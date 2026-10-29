const express = require('express');
const { sendSuccess, sendError } = require('../utils/api-response');
const { requireAuthenticatedUser } = require('../middleware/session-middleware');
const {
    listOrders,
    getOrderDetails,
    createOrderRecord
} = require('../services/order-service');

const router = express.Router();

router.get('/list.php', requireAuthenticatedUser, (request, response) => {
    const { type, staff_id, date_from, date_to } = request.query;
    const result = listOrders(request.session.user, {
        type,
        staff_id,
        date_from,
        date_to
    });
    sendSuccess(response, result);
});

router.get('/get.php', requireAuthenticatedUser, (request, response) => {
    const { id } = request.query;
    if (!id) {
        return sendError(response, 'Order ID is required');
    }

    const outcome = getOrderDetails(request.session.user, id);
    if (outcome.status === 'not_found') {
        return sendError(response, 'Order not found', 404);
    }
    if (outcome.status === 'forbidden') {
        return sendError(response, 'Access denied.', 403);
    }

    sendSuccess(response, outcome.data);
});

router.post('/create.php', requireAuthenticatedUser, (request, response) => {
    const { order_type, party_name, items } = request.body || {};
    if (!order_type || !party_name || !Array.isArray(items) || items.length === 0) {
        return sendError(response, 'Order type, party name, and items are required.', 422);
    }

    const creationOutcome = createOrderRecord(request.session.user.staff_id, {
        order_type,
        party_name,
        items
    });

    if (creationOutcome.status === 'invalid_type') {
        return sendError(response, creationOutcome.message, 422);
    }
    if (creationOutcome.status === 'validation_error') {
        return sendError(response, creationOutcome.message, 400);
    }

    sendSuccess(response, creationOutcome.data, 'Order created successfully');
});

module.exports = router;
