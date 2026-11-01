// Express application factory. Route mounting order matters: static assets
// and security headers run first, followed by web views and backend JSON APIs.
const path = require('node:path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { applySecurityHeaders } = require('./middleware/security-headers');
const { sessionMiddleware } = require('./middleware/session-middleware');
const { csrfMiddleware } = require('./middleware/csrf-middleware');

const viewRoutes = require('./routes/view-routes');
const authRoutes = require('./routes/auth-routes');
const productRoutes = require('./routes/product-routes');
const orderRoutes = require('./routes/order-routes');
const reportRoutes = require('./routes/report-routes');
const staffRoutes = require('./routes/staff-routes');

const rootDir = path.resolve(__dirname, '..');

function createApp() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Standardized handler for malformed client JSON
    app.use((error, request, response, next) => {
        if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
            return response.status(400).json({ success: false, message: 'Invalid JSON request payload' });
        }
        next(error);
    });

    app.use(cookieParser());
    app.use(applySecurityHeaders);
    app.use(sessionMiddleware);

    // Serve public assets and minified dist bundles directly
    app.use('/assets', express.static(path.join(rootDir, 'assets')));
    app.use('/dist', express.static(path.join(rootDir, 'dist')));

    // HTML views and legacy .php routing compatibility
    app.use('/', viewRoutes);

    // CSRF verification for state-changing backend API operations
    app.use('/backend/api', csrfMiddleware);

    // Modular JSON API endpoints matching legacy PHP paths
    app.use('/backend/api/auth', authRoutes);
    app.use('/backend/api/products', productRoutes);
    app.use('/backend/api/orders', orderRoutes);
    app.use('/backend/api/reports', reportRoutes);
    app.use('/backend/api/staff', staffRoutes);

    // Global defensive error fallback
    app.use((error, request, response, next) => {
        if (response.headersSent) {
            return next(error);
        }
        console.error('Unhandled request error:', error);
        response.status(500).json({ success: false, message: 'Internal server error' });
    });

    return app;
}

module.exports = {
    createApp
};
