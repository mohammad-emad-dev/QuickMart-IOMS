// View routing controller maintaining path compatibility with legacy PHP endpoints.
// Delivers pre-compiled HTML and blocks unauthorized roles from restricted screens.
const express = require('express');
const { buildViewCache, renderForbiddenAccessPage } = require('../views/view-compiler');

const router = express.Router();
const compiledViews = buildViewCache();

// Direct visitors to the operations dashboard if authenticated, or login screen otherwise
router.get(['/', '/index.php'], (request, response) => {
    const sid = request.query.sid || request.query.token;
    const sidQuery = sid ? `?sid=${encodeURIComponent(sid)}` : '';
    if (request.session && request.session.user) {
        return response.redirect(`/backend/views/dashboard.php${sidQuery}`);
    }
    return response.redirect(`/assets/login-signup/login.html${sidQuery}`);
});

// Deliver cached views with session enforcement and administrative permission checks
router.get('/backend/views/:viewName', (request, response) => {
    const { viewName } = request.params;
    const sid = request.query.sid || request.query.token;
    const sidQuery = sid ? `?sid=${encodeURIComponent(sid)}` : '';

    if (!request.session || !request.session.user) {
        return response.redirect(`../../assets/login-signup/login.html${sidQuery}`);
    }

    // Reports and staff management screens are restricted strictly to administrators
    if (['reports.php', 'staff.php'].includes(viewName) && request.session.user.role !== 'Admin') {
        response.status(403);
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        return response.send(renderForbiddenAccessPage());
    }

    const htmlContent = compiledViews.get(viewName);
    if (!htmlContent) {
        return response.status(404).send('View not found');
    }

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    return response.send(htmlContent);
});

module.exports = router;
