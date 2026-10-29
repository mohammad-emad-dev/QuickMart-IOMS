// Lightweight session management and role-based access control (RBAC).
// Tracks active sessions in memory and attaches the session object to incoming requests.
const crypto = require('node:crypto');
const { sendError } = require('../utils/api-response');

const activeSessions = new Map();

// Provisions a cryptographically random session and CSRF token when no valid cookie is present
function resolveSession(request, response) {
    let sessionId = request.cookies.qm_session_id;

    if (!sessionId || !activeSessions.has(sessionId)) {
        sessionId = crypto.randomBytes(24).toString('hex');
        const sessionPayload = {
            id: sessionId,
            user: null,
            csrf_token: crypto.randomBytes(16).toString('hex')
        };
        activeSessions.set(sessionId, sessionPayload);
        response.cookie('qm_session_id', sessionId, {
            path: '/',
            httpOnly: true,
            sameSite: 'Lax'
        });
        return sessionPayload;
    }

    return activeSessions.get(sessionId);
}

function sessionMiddleware(request, response, next) {
    request.session = resolveSession(request, response);
    next();
}

// Blocks unauthenticated requests from reaching protected business logic
function requireAuthenticatedUser(request, response, next) {
    if (!request.session || !request.session.user) {
        return sendError(response, 'Authentication required.', 401);
    }
    next();
}

// Restricts route execution to specific authorized roles (e.g. Admin or Manager)
function requireRole(allowedRoles) {
    const permittedRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return function roleGuard(request, response, next) {
        if (!request.session || !request.session.user) {
            return sendError(response, 'Authentication required.', 401);
        }
        if (!permittedRoles.includes(request.session.user.role)) {
            return sendError(response, 'Access denied.', 403);
        }
        next();
    };
}

module.exports = {
    sessionMiddleware,
    requireAuthenticatedUser,
    requireRole
};
