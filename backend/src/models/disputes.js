const pg = require("pg");

module.exports = {
    addDispute,
    getByTransactionId,
    listByTransactionIds,
};

async function addDispute(id, reason, user_id) {
    const client = new pg.Client();
    await client.connect();
    try {
        const disputeAdded = await client.query(
            `
                INSERT INTO dispute (transaction_id, reason)
                VALUES ($1, $2) RETURNING *`,
            [id, reason]
        );
        const disputeLogAdded = await client.query(
            `
            INSERT INTO dispute_status_log (dispute_id, status, user_id, time, is_current)
            VALUES ($2, 'Submitted', $1, now(), TRUE) RETURNING *`,
            [user_id, disputeAdded.rows[0].id]
        );

        return { disputeAdded, disputeLogAdded };
    } finally {
        await client.end();
    }
}

async function getByTransactionId(id, options) {
    const client = new pg.Client();
    await client.connect();
    try {
        const {
            rows: [dispute],
        } = await client.query(
            `
                SELECT *, (
                    SELECT status FROM dispute_status_log
                    WHERE dispute_id = dispute.id AND is_current = TRUE
                )
                FROM dispute
                WHERE transaction_id = $1 AND is_current = TRUE`,
            [id]
        );

        if (dispute && options && options.includeStatusLog) {
            const { rows: log } = await client.query(
                `
                    SELECT *
                    FROM dispute_status_log
                    WHERE dispute_id = $1`,
                [dispute.id]
            );

            dispute.status_log = log;
        }

        return dispute;
    } finally {
        await client.end();
    }
}

async function listByTransactionIds(ids) {
    const client = new pg.Client();
    await client.connect();
    try {
        const { rows: disputes } = await client.query(
            `
                SELECT *, (
                    SELECT status FROM dispute_status_log
                    WHERE dispute_id = dispute.id AND is_current = TRUE
                )
                FROM dispute
                WHERE transaction_id = ANY($1) AND is_current = TRUE
                `,
            [ids]
        );

        return disputes;
    } finally {
        await client.end();
    }
}
