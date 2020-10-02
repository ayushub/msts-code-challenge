
/**
 * This is the mocked services to be used by your implementation.
 * You shouldn't make changes to this file. Documentation of the
 * endpoints are available in README.md.
 *
 * The data in use is being loaded from mocked-data.json on
 * every request so the service doesn't need to be restarted.
 */

const crypto = require('crypto');
const http = require('http');
const url = require('url');
const fs = require('fs').promises;

const {
    SERVER_PORT = '2000',
    SERVER_SECRET = 'de01fa02f088a85010d11ed3ba2239db3e87244667e68b15dd187c91d7ebfd2a',
    AUTH_TOKEN_EXPIRY = '15',
    DATA_FILE = 'mocked-data.json',
} = process.env;

const server =
    http.createServer(handleRequest)
        .listen(SERVER_PORT)
        .on('listening', () => {
            console.info(
                `Mock services listening on port ${SERVER_PORT} ...\n` +
                `Endpoints:\n` +
                `    POST /api/authentication\n` +
                `    GET  /api/authentication\n` +
                `    GET  /api/transactions\n` +
                `    GET  /api/transactions/{id}\n`
            );
        });

process.on('SIGINT', () => server.close(() => process.exit()));


async function handleRequest(request, response) {
    let data;
    try {
        data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));

        const { pathname } = url.parse(request.url);
        const { method, headers } = request;
        const body = parseBody(await readBody(request));

        if (method === 'POST' && pathname === '/api/authentication') {
            const { username, password } = body || {};
            const user = data.users.find(u => u.username === username && u.$password === password);
            endRequest(200, getUserAndToken(user));
            return;
        }

        const user = verifyAuthorizationHeader(headers.authorization);

        if (method === 'GET' && pathname === '/api/authentication') {
            endRequest(200, getUserAndToken(user));
            return;
        }

        if (method === 'GET' && pathname === '/api/transactions') {
            endRequest(200, getTransactions(user));
            return;
        }

        if (method === 'GET' && pathname.startsWith('/api/transactions/')) {
            const id = pathname.split('/').slice(3).join('/');
            endRequest(200, getTransactions(user, { id })[0]);
            return;
        }

        endRequest(404, { message: 'Not Found' });
    }
    catch (error) {
        if (error) {
            console.error('Request failed:', error);
            endRequest(500, { message: 'Internal Server Error' });
        }
    }
    return;

    function verifyAuthorizationHeader(value) {
        let token = decrypt((/^Bearer (.*)$/.exec(value || '') || [])[1]), user;
        if (!token ||
            (token = JSON.parse(token)).expires < Date.now() ||
            (user = data.users.find(u => u.id === token.id)) == null) {
            endRequest(401, { message: 'Unauthorized' });
            throw null;
        }
        return user;
    }

    function getUserAndToken(user) {
        const issued = Date.now();
        const expires = issued + (parseInt(AUTH_TOKEN_EXPIRY) || 15)*60*1000;
        return (user && {
            user,
            token: encrypt(JSON.stringify({ id: user.id, issued, expires })),
            token_issued: issued,
            token_expires: expires,
         }) || {};
    }

    function getTransactions(user, filter) {
        filter = filter || {}
        if (user.role !== 'Admin') {
            filter.account_ids = (filter.account_ids || user.account_ids).filter(a => user.account_ids.indexOf(a) >= 0);
        }
        return data.transactions.filter(t =>
            (filter.id == null || filter.id === t.id) && 
            (filter.account_ids == null || filter.account_ids.indexOf(t.account_id) >= 0));
    }

    function parseBody(body) {
        try {
            return body.length !== 0 && JSON.parse(body.toString());
        }
        catch {
            endRequest(400, { message: 'Bad Request' });
            throw null;
        }
    }

    function readBody(request) {
        return new Promise((resolve, reject) => {
            let data = [];
            request.on('error', reject);
            request.on('data', chunk => data.push(chunk));
            request.on('end', () => resolve(Buffer.concat(data)));
        });
    }

    function endRequest(status, body, headers) {
        response.writeHead(status || 200, { 'Content-Type': 'application/json', ...(headers || {}) });
        response.end(body && JSON.stringify(body, (k, v) => k.startsWith('$') ? undefined : v));
    }
}

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SERVER_SECRET, 'hex'), iv);
    return Buffer.concat([iv, cipher.update(text), cipher.final()]).toString('base64');
}

function decrypt(text) {
    try {
        text = Buffer.from(text, 'base64');
        const iv = text.slice(0, 16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SERVER_SECRET, 'hex'), iv);
        return Buffer.concat([decipher.update(text.slice(iv.length)), decipher.final()]).toString();
    }
    catch (e) {
        return undefined;
    }
}
