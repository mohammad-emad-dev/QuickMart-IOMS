// Order creation and transaction logic.
// Validates available inventory before sell orders, updates quantities atomically,
// and enforces role-based access rules for order history visibility.
const {
    ORDER_TYPE_SELL,
    ORDER_TYPE_PURCHASE,
    ROLE_STAFF,
    ROLE_ADMIN
} = require('../config/app-constants');
const {
    getAllOrders,
    findOrderById,
    insertOrder,
    generateOrderId,
    generateDetailId,
    findProductById,
    findStaffById
} = require('../data/inventory-store');
const { deriveStockStatus } = require('./product-service');

function fetchStaffName(staffId) {
    const staff = findStaffById(staffId);
    return staff ? staff.Full_Name : 'Staff';
}

function calculateOrderTotal(items = []) {
    return items.reduce((sum, item) => {
        const itemTotal = item.Line_Total || (item.Ordered_Qty * item.Sold_Price);
        return sum + itemTotal;
    }, 0);
}

// Applies role segregation: staff only see their own orders, while managers and admins see all
function listOrders(currentUser, queryFilters = {}) {
    const { type, staff_id: staffFilter, date_from: dateFrom, date_to: dateTo } = queryFilters;
    let list = [...getAllOrders()];

    if (currentUser.role === ROLE_STAFF) {
        list = list.filter(order => order.Staff_ID === currentUser.staff_id);
    } else if (staffFilter && currentUser.role === ROLE_ADMIN) {
        const targetStaff = String(staffFilter).toLowerCase();
        list = list.filter(order => order.Staff_ID.toLowerCase() === targetStaff);
    }

    if (type) {
        const targetType = String(type).toLowerCase();
        list = list.filter(order => order.Order_Type.toLowerCase() === targetType);
    }

    if (dateFrom) {
        const boundaryFrom = `${dateFrom} 00:00:00`;
        list = list.filter(order => order.Order_Date >= boundaryFrom);
    }

    if (dateTo) {
        const boundaryTo = `${dateTo} 23:59:59`;
        list = list.filter(order => order.Order_Date <= boundaryTo);
    }

    list.sort((first, second) => second.Order_Date.localeCompare(first.Order_Date));

    const formattedOrders = list.map(order => ({
        Order_ID: order.Order_ID,
        Staff_ID: order.Staff_ID,
        Staff_Name: fetchStaffName(order.Staff_ID),
        Order_Date: order.Order_Date,
        Order_Type: order.Order_Type,
        Party_Name: order.Party_Name,
        Item_Count: order.items ? order.items.length : 0,
        Total_Amount: calculateOrderTotal(order.items)
    }));

    return { orders: formattedOrders, total: formattedOrders.length };
}

function getOrderDetails(currentUser, orderId) {
    const orderRecord = findOrderById(orderId);
    if (!orderRecord) {
        return { status: 'not_found' };
    }

    // Restrict staff users from inspecting orders created by colleagues
    if (currentUser.role === ROLE_STAFF && orderRecord.Staff_ID !== currentUser.staff_id) {
        return { status: 'forbidden' };
    }

    const items = (orderRecord.items || []).map(item => ({
        Detail_ID: item.Detail_ID,
        Product_ID: item.Product_ID,
        Product_Name: item.Product_Name,
        Product_Category: item.Product_Category,
        Ordered_Qty: item.Ordered_Qty,
        Sold_Price: item.Sold_Price,
        Line_Total: item.Line_Total || (item.Ordered_Qty * item.Sold_Price)
    }));

    return {
        status: 'ok',
        data: {
            order: {
                Order_ID: orderRecord.Order_ID,
                Staff_ID: orderRecord.Staff_ID,
                Staff_Name: fetchStaffName(orderRecord.Staff_ID),
                Order_Date: orderRecord.Order_Date,
                Order_Type: orderRecord.Order_Type,
                Party_Name: orderRecord.Party_Name
            },
            details: items,
            total_amount: calculateOrderTotal(items),
            item_count: items.length
        }
    };
}

function normalizeOrderType(rawType) {
    const lower = String(rawType || '').toLowerCase();
    if (lower === 'sell') return ORDER_TYPE_SELL;
    if (lower === 'purchase') return ORDER_TYPE_PURCHASE;
    return null;
}

// Pre-validates all order lines before mutating stock to prevent partial writes
function validateOrderStock(orderType, requestedItems) {
    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
        return { isValid: false, errorMessage: 'At least one item is required.' };
    }

    const aggregatedDemands = new Map();

    for (const item of requestedItems) {
        if (!item || typeof item !== 'object') {
            return { isValid: false, errorMessage: 'Invalid order item format.' };
        }
        const productId = String(item.product_id || '').trim();
        const product = findProductById(productId);
        if (!product) {
            return { isValid: false, errorMessage: `Product "${productId}" not found.` };
        }
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return { isValid: false, errorMessage: `Quantity for ${product.Name} must be a whole positive number.` };
        }

        const currentDemand = aggregatedDemands.get(product.Product_ID) || 0;
        aggregatedDemands.set(product.Product_ID, currentDemand + quantity);
    }

    if (orderType === ORDER_TYPE_SELL) {
        for (const [productId, totalRequested] of aggregatedDemands.entries()) {
            const product = findProductById(productId);
            if (product.Quantity < totalRequested) {
                return {
                    isValid: false,
                    errorMessage: `Insufficient stock for ${product.Name}. Available: ${product.Quantity}, Total Requested: ${totalRequested}`
                };
            }
        }
    }

    return { isValid: true };
}

function createOrderRecord(staffId, orderPayload) {
    const { order_type: rawType, party_name: partyName, items } = orderPayload || {};
    const normalizedType = normalizeOrderType(rawType);

    if (!normalizedType) {
        return { status: 'invalid_type', message: 'Order type must be "Sell" or "Purchase".' };
    }

    const cleanParty = String(partyName || '').trim();
    if (!cleanParty) {
        return { status: 'validation_error', message: 'Party name (customer or supplier) is required.' };
    }

    const stockValidation = validateOrderStock(normalizedType, items);
    if (!stockValidation.isValid) {
        return { status: 'validation_error', message: stockValidation.errorMessage };
    }

    const newOrderId = generateOrderId();
    const currentDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const processedItems = [];
    let grandTotal = 0;

    // Deduct stock for sell orders or replenish stock for purchases, then capture line items
    for (const item of items) {
        const product = findProductById(item.product_id);
        const quantity = Number(item.quantity);
        const unitPrice = parseFloat(product.Price);
        const lineTotal = Math.round(quantity * unitPrice * 100) / 100;
        grandTotal = Math.round((grandTotal + lineTotal) * 100) / 100;

        if (normalizedType === ORDER_TYPE_SELL) {
            product.Quantity -= quantity;
        } else {
            product.Quantity += quantity;
        }
        product.Status = deriveStockStatus(product.Quantity, product.Threshold);

        processedItems.push({
            Detail_ID: generateDetailId(),
            Product_ID: product.Product_ID,
            Product_Name: product.Name,
            Product_Category: product.Category,
            Ordered_Qty: quantity,
            Sold_Price: unitPrice,
            Line_Total: lineTotal
        });
    }

    const newOrder = {
        Order_ID: newOrderId,
        Staff_ID: staffId,
        Order_Date: currentDate,
        Order_Type: normalizedType,
        Party_Name: cleanParty,
        items: processedItems
    };

    insertOrder(newOrder);

    return {
        status: 'created',
        data: {
            order_id: newOrderId,
            staff_id: staffId,
            order_type: normalizedType,
            party_name: newOrder.Party_Name,
            items: processedItems,
            total_amount: grandTotal
        }
    };
}

module.exports = {
    listOrders,
    getOrderDetails,
    createOrderRecord
};
