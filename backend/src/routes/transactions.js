const express = require('express');
const models = require('../models');

const routes = express.Router();

module.exports = routes;

routes.get('/api/dispute-center/transactions', async (request, response, next) => {
    try {
        const transactions = await request.services.transactions('GET', '/api/transactions');
        const disputes = await models.disputes.listByTransactionIds(transactions.map(t => t.id));

        response.json({
            transactions: transactions
                .map(transaction => ({
                    transaction,
                    dispute: disputes.find(d => d.transaction_id === transaction.id) || {}
                }))
                .map(({ transaction, dispute }) => ({
                    ...transaction,
                    disputeStatus: dispute.status,
                    disputeReason: dispute.reason,
                })),
        });
    }
    catch (error) {
        next(error);
    }
});

routes.get('/api/dispute-center/transactions/:id', async (request, response, next) => {
    try {
        const transaction = await request.services.transactions('GET', `/api/transactions/${request.params.id}`);
        const dispute = await models.disputes.getByTransactionId(transaction.id, { includeStatusLog: true }) || {};

        response.json({
            transaction: {
                ...transaction,
                disputeStatus: dispute.status,
                disputeReason: dispute.reason,
            },
            dispute_status_log: dispute.status_log || []
        });
    }
    catch (error) {
        next(error);
    }
});