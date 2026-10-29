// Product inventory management and catalog business logic.
// Stock levels determine catalog health badges, and order references protect audit integrity.
const {
    STATUS_NORMAL,
    STATUS_LOW_STOCK,
    STATUS_OUT_OF_STOCK
} = require('../config/app-constants');
const {
    getAllProducts,
    findProductById,
    insertProduct,
    deleteProduct,
    generateProductId,
    getAllOrders
} = require('../data/inventory-store');

// Computes stock warning status by comparing current inventory against the configured threshold
function deriveStockStatus(quantity, threshold) {
    if (quantity <= 0) {
        return STATUS_OUT_OF_STOCK;
    }
    if (quantity <= threshold) {
        return STATUS_LOW_STOCK;
    }
    return STATUS_NORMAL;
}

function filterProducts(filters = {}) {
    const { category, status, search } = filters;
    let records = [...getAllProducts()];

    if (category) {
        const targetCategory = String(category).toLowerCase();
        records = records.filter(item => item.Category.toLowerCase() === targetCategory);
    }

    if (status) {
        const targetStatus = String(status).toLowerCase();
        records = records.filter(item => item.Status.toLowerCase() === targetStatus);
    }

    if (search) {
        const query = String(search).toLowerCase();
        records = records.filter(item =>
            item.Name.toLowerCase().includes(query) ||
            item.Product_ID.toLowerCase().includes(query)
        );
    }

    return records;
}

function getProductRecord(productId) {
    return findProductById(productId);
}

function createProductRecord(productPayload) {
    const { name, category, quantity, price, threshold } = productPayload;
    const numQty = parseInt(quantity, 10);
    const numPrice = parseFloat(price);
    const numThreshold = parseInt(threshold, 10);

    const newRecord = {
        Product_ID: generateProductId(),
        Name: String(name).trim(),
        Category: String(category).trim(),
        Quantity: numQty,
        Price: numPrice.toFixed(2),
        Status: deriveStockStatus(numQty, numThreshold),
        Threshold: numThreshold
    };

    return insertProduct(newRecord);
}

function updateProductRecord(productId, updatePayload) {
    const targetProduct = findProductById(productId);
    if (!targetProduct) {
        return null;
    }

    const { name, category, quantity, price, threshold } = updatePayload;
    if (name) targetProduct.Name = String(name).trim();
    if (category) targetProduct.Category = String(category).trim();
    if (quantity !== undefined) targetProduct.Quantity = parseInt(quantity, 10);
    if (price !== undefined) targetProduct.Price = parseFloat(price).toFixed(2);
    if (threshold !== undefined) targetProduct.Threshold = parseInt(threshold, 10);

    targetProduct.Status = deriveStockStatus(targetProduct.Quantity, targetProduct.Threshold);
    return targetProduct;
}

// Blocks deletion if the product appears in historical orders to protect ledger consistency
function removeProductRecord(productId) {
    const targetProduct = findProductById(productId);
    if (!targetProduct) {
        return { status: 'not_found' };
    }

    const allOrders = getAllOrders();
    const referenceCount = allOrders.filter(order =>
        order.items && order.items.some(item => item.Product_ID === targetProduct.Product_ID)
    ).length;

    if (referenceCount > 0) {
        return { status: 'referenced', orderCount: referenceCount };
    }

    const removed = deleteProduct(targetProduct.Product_ID);
    return { status: 'deleted', product: removed };
}

module.exports = {
    deriveStockStatus,
    filterProducts,
    getProductRecord,
    createProductRecord,
    updateProductRecord,
    removeProductRecord
};
