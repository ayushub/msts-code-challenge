module.exports = errorHandler;

/**
 * Middleware for handling errors.
 * @param {object} options
 * @param {((e: any)=> void)=} options.log
 * Optional callback for logging error
 */
function errorHandler(options) {
    const { logError } = options || {};
    return function (error, request, response, next) {
        const { status = 500, statusText = 'Internal Server Error' } = error;
        logError && logError(error);
        response.status(status).json({ message: statusText });
    }
}