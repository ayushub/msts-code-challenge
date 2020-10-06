const fetch = require('node-fetch');

module.exports = apiClients;

/**
 * Middleware for attaching named API clients to the `request.services` object.
 * The API clients will handle passing on the `Authorization` header to upstream
 * services.
 *
 * @param {object} options
 *
 * @param {{ [name: string]: string }} options.serviceBaseUrls
 * Mapping between service name and API client base URL
 *
 * @param {boolean=} options.passOnAuthorizationHeader
 * Optional flag to pass on any authorization header from
 * the incoming request to upstream services.
 */
function apiClients(options) {
    const { serviceBaseUrls, passOnAuthorizationHeader } = options || {};
    return function (request, response, next) {
        request.services =
            Object.assign(
                request.services || {},
                ...Object
                    .entries(serviceBaseUrls)
                    .map(([name, baseUrl]) => ({
                        [name]: getApiClient(baseUrl, getDefaultHeaders(request, passOnAuthorizationHeader)),
                    })
                )
            );
        next();
    };
}

function getApiClient(baseUrl, defaultHeaders) {
    return async function apiClient(method, url, body, headers) {

        url = baseUrl + url;

        if (body != null) {
            headers = { ['Content-Type']: 'application/json', ...headers };
            body = JSON.stringify(body);
        }

        headers = { ...defaultHeaders, headers };

        const response = await fetch(url, { headers, body });
        if (response.ok) {
            return response.json();
        }

        const { status, statusText } = response;
        throw Object.assign(
            new Error(`'${method} ${url}' failed with status code ${status} (${statusText})`),
            { name: 'UpstreamError', status, statusText }
        );
    };
}

function getDefaultHeaders(request, passOnAuthorizationHeader) {
    const headers = {};
    if (passOnAuthorizationHeader && request.headers.authorization) {
        headers.authorization = request.headers.authorization;
    }
    return headers;
}