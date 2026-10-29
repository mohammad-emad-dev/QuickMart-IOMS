const express = require('express');
const { buildViewCache, renderForbiddenAccessPage } = require('../views/view-compiler');

const router = express.Router();
const compiledViews = buildViewCache();

router.get(['/', '/index.php'], (request, response) => {
    if (request.session && request.session.user) {
        return response.redirect('/backend/views/dashboard.php');
    }
    return response.redirect('/assets/login-signup/login.html');
});

router.get('/backend/views/:viewName', (request, response) => {
    const { viewName } = request.params;

    if (!request.session || !request.session.user) {
        return response.redirect('../../assets/login-signup/login.html');
    }

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
