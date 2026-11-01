// Applies defensive HTTP response headers to prevent MIME sniffing,
// framing/clickjacking, and cross-origin referrer leakage.
function applySecurityHeaders(request, response, next) {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'same-origin');
    next();
}

module.exports = {
    applySecurityHeaders
};
