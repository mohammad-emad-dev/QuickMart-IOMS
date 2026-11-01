const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const { createApp } = require('../src/app');

describe('API Integration & Security Tests', () => {
    let server;
    let baseUrl;

    before((_, done) => {
        const app = createApp();
        server = http.createServer(app);
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            baseUrl = `http://127.0.0.1:${address.port}`;
            done();
        });
    });

    after((_, done) => {
        server.close(done);
    });

    test('POST /backend/api/auth/login.php authenticates and returns session token and CSRF token', async () => {
        const response = await fetch(`${baseUrl}/backend/api/auth/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@quickmart.com', password: 'admin123' })
        });

        assert.equal(response.status, 200);
        const data = await response.json();
        assert.equal(data.success, true);
        assert.equal(data.data.email, 'admin@quickmart.com');
        assert.equal(data.data.role, 'Admin');
        assert.ok(data.data.session_id);
        assert.ok(data.data.csrf_token);
    });

    test('CSRF middleware blocks state-changing request with missing CSRF token', async () => {
        // Authenticate first
        const loginRes = await fetch(`${baseUrl}/backend/api/auth/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@quickmart.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        const sessionId = loginData.data.session_id;

        // Attempt to create product without X-CSRF-Token
        const createRes = await fetch(`${baseUrl}/backend/api/products/create.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId
            },
            body: JSON.stringify({
                name: 'Unauthorized Cable',
                category: 'Accessories',
                quantity: 10,
                price: 15,
                threshold: 2
            })
        });

        assert.equal(createRes.status, 403);
        const createData = await createRes.json();
        assert.match(createData.message, /CSRF token/i);
    });

    test('CSRF middleware allows state-changing request with valid CSRF token', async () => {
        // Authenticate
        const loginRes = await fetch(`${baseUrl}/backend/api/auth/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@quickmart.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        const sessionId = loginData.data.session_id;
        const csrfToken = loginData.data.csrf_token;

        // Now post with valid X-CSRF-Token
        const createRes = await fetch(`${baseUrl}/backend/api/products/create.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId,
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                name: 'Authorized USB Cable',
                category: 'Accessories',
                quantity: 25,
                price: 19.99,
                threshold: 5
            })
        });

        assert.equal(createRes.status, 200);
        const createData = await createRes.json();
        assert.equal(createData.success, true);
        assert.equal(createData.data.Name, 'Authorized USB Cable');
    });

    test('POST /backend/api/products/update.php works cleanly (fixes previous 404 issue)', async () => {
        // Authenticate
        const loginRes = await fetch(`${baseUrl}/backend/api/auth/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@quickmart.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        const sessionId = loginData.data.session_id;
        const csrfToken = loginData.data.csrf_token;

        const updateRes = await fetch(`${baseUrl}/backend/api/products/update.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId,
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                product_id: 'PRD001',
                price: 5199.00
            })
        });

        assert.equal(updateRes.status, 200);
        const updateData = await updateRes.json();
        assert.equal(updateData.success, true);
        assert.equal(updateData.data.Price, '5199.00');

        // Restore price
        await fetch(`${baseUrl}/backend/api/products/update.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId,
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                product_id: 'PRD001',
                price: 4999.00
            })
        });
    });

    test('Handles malformed JSON gracefully with standard JSON error response', async () => {
        const response = await fetch(`${baseUrl}/backend/api/auth/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"email": "broken json'
        });

        assert.equal(response.status, 400);
        const data = await response.json();
        assert.equal(data.success, false);
        assert.match(data.message, /invalid json/i);
    });
});
