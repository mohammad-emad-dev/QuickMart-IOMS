const { RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MS } = require('../config/app-constants');

const attemptRegistry = new Map();

function evaluateRateLimit(identifierKey) {
    const currentTime = Date.now();
    const normalizedKey = String(identifierKey).trim().toLowerCase();
    const existing = attemptRegistry.get(normalizedKey) || {
        attemptCount: 0,
        windowStartTime: currentTime
    };

    if (currentTime - existing.windowStartTime > RATE_LIMIT_WINDOW_MS) {
        existing.attemptCount = 0;
        existing.windowStartTime = currentTime;
    }

    existing.attemptCount += 1;
    attemptRegistry.set(normalizedKey, existing);

    if (existing.attemptCount > RATE_LIMIT_MAX_ATTEMPTS) {
        const remainingMs = RATE_LIMIT_WINDOW_MS - (currentTime - existing.windowStartTime);
        const retryAfterSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
        return { isAllowed: false, retryAfterSeconds };
    }

    return { isAllowed: true, retryAfterSeconds: 0 };
}

function clearRateLimit(identifierKey) {
    const normalizedKey = String(identifierKey).trim().toLowerCase();
    attemptRegistry.delete(normalizedKey);
}

module.exports = {
    evaluateRateLimit,
    clearRateLimit
};
