const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
    createOrderRecord,
    listOrders,
    getOrderDetails
} = require('../src/services/order-service');
const { findProductById } = require('../src/data/inventory-store');
const {
    ORDER_TYPE_SELL,
    ORDER_TYPE_PURCHASE,
    ROLE_STAFF,
    ROLE_ADMIN
} = require('../src/config/app-constants');

describe('Order Service Tests', () => {
    test('aggregates line quantities to prevent stock underflow when same product is submitted multiple times', () => {
        const product = findProductById('PRD002');
        assert.ok(product);
        const originalQty = product.Quantity; // e.g. 30

        // Attempt to order 20 + 20 = 40 (which exceeds 30)
        const outcome = createOrderRecord('STF001', {
            order_type: ORDER_TYPE_SELL,
            party_name: 'Overdraw Customer',
            items: [
                { product_id: 'PRD002', quantity: 20 },
                { product_id: 'PRD002', quantity: 20 }
            ]
        });

        assert.equal(outcome.status, 'validation_error');
        assert.match(outcome.message, /Insufficient stock/i);
        // Ensure stock was not touched
        assert.equal(product.Quantity, originalQty);
    });

    test('validates party name requirement', () => {
        const outcome = createOrderRecord('STF001', {
            order_type: ORDER_TYPE_SELL,
            party_name: '   ',
            items: [{ product_id: 'PRD002', quantity: 1 }]
        });
        assert.equal(outcome.status, 'validation_error');
        assert.match(outcome.message, /party name/i);
    });

    test('successfully processes Sell order, updates inventory, and maintains historical line price', () => {
        const product = findProductById('PRD002');
        const startQty = product.Quantity;

        const outcome = createOrderRecord('STF001', {
            order_type: ORDER_TYPE_SELL,
            party_name: 'Ahmed Test Client',
            items: [{ product_id: 'PRD002', quantity: 2 }]
        });

        assert.equal(outcome.status, 'created');
        assert.equal(outcome.data.order_type, ORDER_TYPE_SELL);
        assert.equal(product.Quantity, startQty - 2);

        // Verify line total precision
        const line = outcome.data.items[0];
        assert.equal(line.Ordered_Qty, 2);
        assert.equal(line.Sold_Price, 3999);
        assert.equal(line.Line_Total, 7998);
        assert.equal(outcome.data.total_amount, 7998);
    });

    test('successfully processes Purchase order and replenishes stock', () => {
        const product = findProductById('PRD002');
        const startQty = product.Quantity;

        const outcome = createOrderRecord('STF001', {
            order_type: ORDER_TYPE_PURCHASE,
            party_name: 'Tech Distributor LLC',
            items: [{ product_id: 'PRD002', quantity: 5 }]
        });

        assert.equal(outcome.status, 'created');
        assert.equal(product.Quantity, startQty + 5);
    });

    test('enforces role scoping for staff order inspection', () => {
        // ORD001 belongs to STF001 (Admin)
        // Staff user STF003 should be forbidden
        const staffUser = { staff_id: 'STF003', role: ROLE_STAFF };
        const adminUser = { staff_id: 'STF001', role: ROLE_ADMIN };

        const forbiddenOutcome = getOrderDetails(staffUser, 'ORD001');
        assert.equal(forbiddenOutcome.status, 'forbidden');

        const allowedOutcome = getOrderDetails(adminUser, 'ORD001');
        assert.equal(allowedOutcome.status, 'ok');
        assert.equal(allowedOutcome.data.order.Order_ID, 'ORD001');
    });

    test('listOrders correctly filters by staff role', () => {
        const staffUser = { staff_id: 'STF003', role: ROLE_STAFF };
        const result = listOrders(staffUser);
        assert.ok(result.orders.length > 0);
        result.orders.forEach(order => {
            assert.equal(order.Staff_ID, 'STF003');
        });
    });
});
