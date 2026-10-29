const crypto = require('node:crypto');
const { sendError } = require('../utils/api-response');

const activeSessions = new Map();

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

function requireAuthenticatedUser(request, response, next) {
    if (!request.session || !request.session.user) {
        return sendError(response, 'Authentication required.', 401);
    }
    next();
}

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
    resolveSession,
    requireAuthenticatedUser,
    requireRole
};
