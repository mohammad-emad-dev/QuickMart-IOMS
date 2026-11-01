// Product catalog endpoints for searching, creating, editing, and deleting inventory items.
// Creation and updates require Manager or Admin rights; deletion is strictly Admin-only.
const express = require('express');
const { sendSuccess, sendError } = require('../utils/api-response');
const { requireAuthenticatedUser, requireRole } = require('../middleware/session-middleware');
const { ROLE_ADMIN, ROLE_MANAGER } = require('../config/app-constants');
const {
    filterProducts,
    getProductRecord,
    createProductRecord,
    updateProductRecord,
    removeProductRecord
} = require('../services/product-service');

const router = express.Router();

router.get('/list.php', requireAuthenticatedUser, (request, response) => {
    const { category, status, search } = request.query;
    const matchingProducts = filterProducts({ category, status, search });
    const allProducts = filterProducts({});
    const categories = Array.from(new Set(allProducts.map(p => p.Category).filter(Boolean))).sort();
    sendSuccess(response, {
        products: matchingProducts,
        categories
    });
});

router.get('/get.php', requireAuthenticatedUser, (request, response) => {
    const { id } = request.query;
    if (!id) {
        return sendError(response, 'Product ID is required');
    }

    const product = getProductRecord(id);
    if (!product) {
        return sendError(response, 'Product not found', 404);
    }

    sendSuccess(response, product);
});

// Adding new catalog items requires at least Manager privileges
router.post('/create.php', requireRole([ROLE_ADMIN, ROLE_MANAGER]), (request, response) => {
    const { name, category, quantity, price, threshold } = request.body || {};
    if (!name || !category || quantity === undefined || price === undefined || threshold === undefined) {
        return sendError(response, 'All fields are required', 422);
    }

    const created = createProductRecord({ name, category, quantity, price, threshold });
    if (created && created.status === 'validation_error') {
        return sendError(response, created.message, 422);
    }
    sendSuccess(response, created, 'Product created successfully');
});

// Modifying pricing, quantity, or category requires at least Manager privileges (accepts both POST and PUT)
router.all('/update.php', requireRole([ROLE_ADMIN, ROLE_MANAGER]), (request, response) => {
    if (!['POST', 'PUT'].includes(request.method.toUpperCase())) {
        return sendError(response, 'Method not allowed', 405);
    }

    const { id, product_id, name, category, quantity, price, threshold } = request.body || {};
    const targetId = id || product_id;
    if (!targetId) {
        return sendError(response, 'Product ID is required', 422);
    }

    const outcome = updateProductRecord(targetId, { name, category, quantity, price, threshold });
    if (!outcome) {
        return sendError(response, 'Product not found', 404);
    }
    if (outcome.status === 'validation_error') {
        return sendError(response, outcome.message, 422);
    }

    sendSuccess(response, outcome.product || outcome, 'Product updated successfully');
});

// router.all supports both DELETE and POST forms sent by legacy client scripts
router.all('/delete.php', requireRole(ROLE_ADMIN), (request, response) => {
    const targetId = request.query.id || (request.body && (request.body.id || request.body.product_id));
    if (!targetId) {
        return sendError(response, 'Product ID is required');
    }

    const result = removeProductRecord(targetId);
    if (result.status === 'not_found') {
        return sendError(response, 'Product not found', 404);
    }
    if (result.status === 'referenced') {
        return sendError(response, `Cannot delete product. It is referenced in ${result.orderCount} order(s)`);
    }

    sendSuccess(response, {
        product_id: result.product.Product_ID,
        name: result.product.Name
    }, 'Product deleted successfully');
});

module.exports = router;
