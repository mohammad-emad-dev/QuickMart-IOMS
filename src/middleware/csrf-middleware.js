// Defensive CSRF validation middleware.
// Validates X-CSRF-Token header or _csrf request field on all state-changing operations.
const { sendError } = require('../utils/api-response');

function csrfMiddleware(request, response, next) {
    const method = request.method.toUpperCase();

    // Safe idempotent HTTP methods do not mutate state
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        return next();
    }

    // Public authentication endpoint is exempt because the user has not yet established a session
    if (request.path === '/login.php' || request.path.endsWith('/auth/login.php')) {
        return next();
    }

    const sessionCsrf = request.session?.csrf_token;
    if (!sessionCsrf) {
        return sendError(response, 'Invalid or expired session security token.', 403);
    }

    const incomingCsrf = request.headers['x-csrf-token']
        || (request.body && request.body._csrf)
        || (request.query && request.query._csrf);

    if (!incomingCsrf || incomingCsrf !== sessionCsrf) {
        return sendError(response, 'Security verification failed: invalid CSRF token.', 403);
    }

    next();
}

module.exports = {
    csrfMiddleware
};
