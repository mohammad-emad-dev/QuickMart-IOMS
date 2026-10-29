function applySecurityHeaders(request, response, next) {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'same-origin');
    next();
}

module.exports = {
    applySecurityHeaders
};
