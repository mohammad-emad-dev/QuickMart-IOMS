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
    const { name, category, quantity, price, threshold } = productPayload || {};

    const cleanName = String(name || '').trim();
    const cleanCategory = String(category || '').trim();
    if (!cleanName || !cleanCategory) {
        return { status: 'validation_error', message: 'Product name and category cannot be empty.' };
    }

    const numQty = Number(quantity);
    if (!Number.isInteger(numQty) || numQty < 0) {
        return { status: 'validation_error', message: 'Quantity must be a non-negative whole integer.' };
    }

    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice < 0) {
        return { status: 'validation_error', message: 'Price must be a valid non-negative number.' };
    }

    const numThreshold = Number(threshold);
    if (!Number.isInteger(numThreshold) || numThreshold < 0) {
        return { status: 'validation_error', message: 'Stock threshold must be a non-negative whole integer.' };
    }

    const newRecord = {
        Product_ID: generateProductId(),
        Name: cleanName,
        Category: cleanCategory,
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

    const { name, category, quantity, price, threshold } = updatePayload || {};

    if (name !== undefined) {
        const cleanName = String(name).trim();
        if (!cleanName) {
            return { status: 'validation_error', message: 'Product name cannot be empty.' };
        }
        targetProduct.Name = cleanName;
    }

    if (category !== undefined) {
        const cleanCategory = String(category).trim();
        if (!cleanCategory) {
            return { status: 'validation_error', message: 'Category cannot be empty.' };
        }
        targetProduct.Category = cleanCategory;
    }

    if (quantity !== undefined) {
        const numQty = Number(quantity);
        if (!Number.isInteger(numQty) || numQty < 0) {
            return { status: 'validation_error', message: 'Quantity must be a non-negative whole integer.' };
        }
        targetProduct.Quantity = numQty;
    }

    if (price !== undefined) {
        const numPrice = Number(price);
        if (!Number.isFinite(numPrice) || numPrice < 0) {
            return { status: 'validation_error', message: 'Price must be a valid non-negative number.' };
        }
        targetProduct.Price = numPrice.toFixed(2);
    }

    if (threshold !== undefined) {
        const numThreshold = Number(threshold);
        if (!Number.isInteger(numThreshold) || numThreshold < 0) {
            return { status: 'validation_error', message: 'Stock threshold must be a non-negative whole integer.' };
        }
        targetProduct.Threshold = numThreshold;
    }

    targetProduct.Status = deriveStockStatus(targetProduct.Quantity, targetProduct.Threshold);
    return { status: 'ok', product: targetProduct };
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
