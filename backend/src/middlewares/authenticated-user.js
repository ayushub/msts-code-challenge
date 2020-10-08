
module.exports = authenticatedUser;

/**
 * Middleware for resolving `request.user` from `request.services.authentication`.
 * @param {object} options
 * @param {boolean=} options.authenticationRequired
 * Optional flag to instruct the middleware that authentication is required.
 * Will fail requests with `401` if no `Authorization` header is present.
 */
function authenticatedUser(options) {
    const { authenticationRequired } = options || {};
    return async function (request, response, next) {
        if (authenticationRequired || request.headers.authorization) {
            try {
                const { user } = await request.services.authentication('GET', '/api/authentication');
                request.user = user;
            }
            catch (error) {
                next(error);
                return;
            }
        }
        next();
    }
}