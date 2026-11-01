const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
    deriveStockStatus,
    createProductRecord,
    updateProductRecord,
    removeProductRecord,
    getProductRecord
} = require('../src/services/product-service');
const {
    STATUS_NORMAL,
    STATUS_LOW_STOCK,
    STATUS_OUT_OF_STOCK
} = require('../src/config/app-constants');

describe('Product Service Tests', () => {
    test('deriveStockStatus accurately derives inventory health', () => {
        assert.equal(deriveStockStatus(0, 5), STATUS_OUT_OF_STOCK);
        assert.equal(deriveStockStatus(-2, 5), STATUS_OUT_OF_STOCK);
        assert.equal(deriveStockStatus(5, 5), STATUS_LOW_STOCK);
        assert.equal(deriveStockStatus(4, 5), STATUS_LOW_STOCK);
        assert.equal(deriveStockStatus(6, 5), STATUS_NORMAL);
        assert.equal(deriveStockStatus(50, 10), STATUS_NORMAL);
    });

    test('createProductRecord validates positive numeric fields and non-empty strings', () => {
        // Missing name
        const res1 = createProductRecord({ name: '', category: 'Hardware', quantity: 10, price: 99.99, threshold: 5 });
        assert.equal(res1.status, 'validation_error');

        // Negative quantity
        const res2 = createProductRecord({ name: 'Cable', category: 'Accessories', quantity: -5, price: 10, threshold: 2 });
        assert.equal(res2.status, 'validation_error');

        // Invalid price
        const res3 = createProductRecord({ name: 'Cable', category: 'Accessories', quantity: 5, price: 'invalid', threshold: 2 });
        assert.equal(res3.status, 'validation_error');

        // Valid product creation
        const created = createProductRecord({
            name: 'Test Gaming Mouse',
            category: 'Accessories',
            quantity: 20,
            price: '49.99',
            threshold: 5
        });
        assert.ok(created.Product_ID.startsWith('PRD'));
        assert.equal(created.Name, 'Test Gaming Mouse');
        assert.equal(created.Quantity, 20);
        assert.equal(created.Price, '49.99');
        assert.equal(created.Status, STATUS_NORMAL);
    });

    test('updateProductRecord validates inputs and updates status dynamically', () => {
        const product = getProductRecord('PRD001');
        assert.ok(product);

        // Update quantity to below threshold
        const updateRes = updateProductRecord('PRD001', { quantity: 2, threshold: 5 });
        assert.equal(updateRes.status, 'ok');
        assert.equal(updateRes.product.Status, STATUS_LOW_STOCK);

        // Restore original
        updateProductRecord('PRD001', { quantity: 25, threshold: 5 });
    });

    test('removeProductRecord blocks deletion of items present in historical orders', () => {
        // PRD001 is referenced in ORD001 and ORD003
        const outcome = removeProductRecord('PRD001');
        assert.equal(outcome.status, 'referenced');
        assert.ok(outcome.orderCount > 0);
    });
});
