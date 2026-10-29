function sendSuccess(response, payload, message = 'Success') {
    return response.json({
        success: true,
        message,
        data: payload
    });
}

function sendError(response, message, statusCode = 400) {
    return response.status(statusCode).json({
        success: false,
        message
    });
}

module.exports = {
    sendSuccess,
    sendError
};
