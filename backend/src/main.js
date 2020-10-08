const express = require('express');

const {
    SERVER_PORT ='3000',
    AUTHENTICATION_SERVICE_BASE_URL = 'http://localhost:2000',
    TRANSACTIONS_SERVICE_BASE_URL   = 'http://localhost:2000',
} = process.env;

const server =
    express()
        .use(require('./middlewares/api-clients')({
            serviceBaseUrls: {
                authentication: AUTHENTICATION_SERVICE_BASE_URL,
                transactions: TRANSACTIONS_SERVICE_BASE_URL,
            },
            passOnAuthorizationHeader: true,
        }))
        .use(require('./middlewares/authenticated-user')({
            authenticationRequired: true,
        }))
        .use(express.json())
        .use(require('./routes/transactions'))
        .use(require('./routes/404'))
        .use(require('./middlewares/error-handler')({
            logError: error => console.error(`Request failed: `, error),
        }))
        .listen(SERVER_PORT)
        .on('listening', () => console.info(`Dispute center backend listening on port ${SERVER_PORT} ...`));

process.on('SIGINT', () => server.close(() => process.exit()));
