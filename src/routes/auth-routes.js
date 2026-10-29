const express = require('express');
const { sendSuccess, sendError } = require('../utils/api-response');
const { evaluateRateLimit, clearRateLimit } = require('../middleware/rate-limiter');
const { authenticateStaffUser, generateCsrfToken } = require('../services/auth-service');
const { requireAuthenticatedUser } = require('../middleware/session-middleware');

const router = express.Router();

router.get('/csrf.php', (request, response) => {
    sendSuccess(response, { csrf_token: request.session.csrf_token });
});

router.get('/session.php', requireAuthenticatedUser, (request, response) => {
    const { user } = request.session;
    sendSuccess(response, {
        authenticated: true,
        user: {
            staff_id: user.staff_id,
            full_name: user.full_name,
            email: user.email,
            role: user.role
        }
    });
});

router.post('/login.php', (request, response) => {
    const { email, password } = request.body || {};

    if (!email || !password) {
        return sendError(response, 'Missing required fields: email, password', 422);
    }

    const rateResult = evaluateRateLimit(email);
    if (!rateResult.isAllowed) {
        response.setHeader('Retry-After', String(rateResult.retryAfterSeconds));
        return sendError(response, 'Too many sign-in attempts. Please wait and try again.', 429);
    }

    const authenticatedUser = authenticateStaffUser(email, password);
    if (!authenticatedUser) {
        return sendError(response, 'Invalid email/staff ID or password', 401);
    }

    clearRateLimit(email);
    request.session.user = authenticatedUser;
    request.session.csrf_token = generateCsrfToken();

    sendSuccess(response, {
        staff_id: authenticatedUser.staff_id,
        full_name: authenticatedUser.full_name,
        email: authenticatedUser.email,
        role: authenticatedUser.role
    }, 'Login successful');
});

router.post('/logout.php', (request, response) => {
    request.session.user = null;
    response.clearCookie('qm_session_id');
    sendSuccess(response, null, 'Logged out successfully');
});

router.post('/forgot_password.php', (request, response) => {
    sendError(response, 'Password reset is currently unavailable. Please contact a system administrator.', 503);
});

module.exports = router;
