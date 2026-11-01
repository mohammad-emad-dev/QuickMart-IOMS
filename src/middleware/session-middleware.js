// Lightweight session management and role-based access control (RBAC).
// Tracks active sessions in memory and attaches the session object to incoming requests.
const crypto = require('node:crypto');
const { sendError } = require('../utils/api-response');

const activeSessions = new Map();

function extractSessionId(request) {
    if (request.cookies && request.cookies.qm_session_id) {
        return request.cookies.qm_session_id;
    }
    if (request.headers && request.headers['x-session-id']) {
        return request.headers['x-session-id'];
    }
    const authHeader = request.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }
    if (request.query && (request.query.sid || request.query.token)) {
        return request.query.sid || request.query.token;
    }
    return null;
}

function setSessionCookie(request, response, sessionId) {
    const isHttps = request.secure
        || request.headers['x-forwarded-proto'] === 'https'
        || request.protocol === 'https';

    response.cookie('qm_session_id', sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: isHttps ? 'None' : 'Lax',
        secure: isHttps
    });
}

// Provisions a cryptographically random session and CSRF token when no valid session is present
function resolveSession(request, response) {
    let sessionId = extractSessionId(request);

    if (!sessionId || !activeSessions.has(sessionId)) {
        sessionId = crypto.randomBytes(24).toString('hex');
        const sessionPayload = {
            id: sessionId,
            user: null,
            csrf_token: crypto.randomBytes(16).toString('hex')
        };
        activeSessions.set(sessionId, sessionPayload);
        setSessionCookie(request, response, sessionId);
        return sessionPayload;
    }

    const sessionPayload = activeSessions.get(sessionId);
    // Refresh cookie header so browser keeps receiving the updated SameSite policy
    setSessionCookie(request, response, sessionId);
    return sessionPayload;
}

const { findStaffById } = require('../data/inventory-store');

function syncSessionUser(session) {
    if (!session || !session.user) return null;
    const staff = findStaffById(session.user.staff_id);
    if (!staff) {
        session.user = null;
        return null;
    }
    if (session.user.auth_revision && staff.Auth_Revision && session.user.auth_revision !== staff.Auth_Revision) {
        session.user = null;
        return null;
    }
    session.user.role = staff.Role;
    session.user.full_name = staff.Full_Name;
    session.user.email = staff.Email;
    session.user.auth_revision = staff.Auth_Revision;
    return session.user;
}

function sessionMiddleware(request, response, next) {
    request.session = resolveSession(request, response);
    syncSessionUser(request.session);
    next();
}

// Blocks unauthenticated requests from reaching protected business logic
function requireAuthenticatedUser(request, response, next) {
    syncSessionUser(request.session);
    if (!request.session || !request.session.user) {
        return sendError(response, 'Authentication required.', 401);
    }
    next();
}

// Restricts route execution to specific authorized roles (e.g. Admin or Manager)
function requireRole(allowedRoles) {
    const permittedRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return function roleGuard(request, response, next) {
        syncSessionUser(request.session);
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
