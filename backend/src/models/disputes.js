const pg = require('pg');

module.exports = {
    getByTransactionId,
    listByTransactionIds,
};

async function getByTransactionId(id, options) {
    const client = new pg.Client();
    await client.connect();
    try {
        const { rows: [dispute] } =
            await client.query(`
                SELECT *, (
                    SELECT status FROM dispute_status_log
                    WHERE dispute_id = dispute.id AND is_current = TRUE
                )
                FROM dispute
                WHERE transaction_id = $1`,
                [id],
            );

        if (dispute && options && options.includeStatusLog) {
            const { rows: log } =
                await client.query(`
                    SELECT *
                    FROM dispute_status_log
                    WHERE dispute_id = $1`,
                    [dispute.id],
                );

            dispute.status_log = log;
        }

        return dispute;
    }
    finally {
        await client.end();
    }
}

async function listByTransactionIds(ids) {
    const client = new pg.Client();
    await client.connect();
    try {
        const { rows: disputes } =
            await client.query(`
                SELECT *, (
                    SELECT status FROM dispute_status_log
                    WHERE dispute_id = dispute.id AND is_current = TRUE
                )
                FROM dispute
                WHERE transaction_id = ANY($1)
                `,
                [ids],
            );

        return disputes;
    }
    finally {
        await client.end();
    }
}

