
/**
 * This file is just to serve the UI assets for local development
 * and to proxy any API requests to the backend services.
 *
 * In productions this would be handled by a reverse proxy like nginx
 * or by a service like AWS Cloudfront.
 *
 * Uses same proxy middleware (http-proxy-middleware) as webpack-dev-server.
 */

const express = require('express');
const { createProxyMiddleware: proxy } = require('http-proxy-middleware');

const {
    SERVER_PORT ='8080',
    STATIC_ASSETS_DIRECTORY = `${__dirname}/src`,
    AUTHENTICATION_SERVICE_BASE_URL = 'http://localhost:2000',
    TRANSACTIONS_SERVICE_BASE_URL   = 'http://localhost:2000',
    DISPUTE_CENTER_SERVICE_BASE_URL = 'http://localhost:3000',
} = process.env;

const server =
    express()
        .use(express.static(STATIC_ASSETS_DIRECTORY))
        .use(proxy('/api/authentication/**', { target: AUTHENTICATION_SERVICE_BASE_URL }))
        .use(proxy('/api/transactions/**',   { target: TRANSACTIONS_SERVICE_BASE_URL }))
        .use(proxy('/api/dispute-center/**', { target: DISPUTE_CENTER_SERVICE_BASE_URL }))
        .listen(SERVER_PORT)
        .on('listening', () => console.info(`Dispute center UI host and proxy listening on port ${SERVER_PORT} ...`));

process.on('SIGINT', () => server.close(() => process.exit()));