const path = require('node:path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { applySecurityHeaders } = require('./middleware/security-headers');
const { sessionMiddleware } = require('./middleware/session-middleware');

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
    app.use(cookieParser());
    app.use(applySecurityHeaders);
    app.use(sessionMiddleware);

    // Static Assets
    app.use('/assets', express.static(path.join(rootDir, 'assets')));
    app.use('/dist', express.static(path.join(rootDir, 'dist')));

    // Page Views & Root
    app.use('/', viewRoutes);

    // API Routes
    app.use('/backend/api/auth', authRoutes);
    app.use('/backend/api/products', productRoutes);
    app.use('/backend/api/orders', orderRoutes);
    app.use('/backend/api/reports', reportRoutes);
    app.use('/backend/api/staff', staffRoutes);

    return app;
}

module.exports = {
    createApp
};
