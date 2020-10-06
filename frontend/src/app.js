/**
 * Authenticate user and store session token
 * @param {{ username: string; password: string; }} credentials
 * @returns {boolean} `true` if login attempt were successful, `false` otherwise
 */
async function authenticate(credentials) {
    const response =
        await fetch('/api/authentication', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

    if (response.ok) {
        const { token } = await response.json();
        if (token) {
            sessionStorage.setItem('session_auth_token', token);
            return true;
        }
    }

    return false
}

/**
 * Executes callback if a stored session token exists, otherwise redirects to login.
 * @param {() => void} callback
 */
function ifAuthenticated(callback) {
    if (!sessionStorage.getItem('session_auth_token')) {
        window.location = '/login';
        return;
    }
    callback();
}

/**
 * Send an API request, with an optional JSON body, to the backend.
 * Handles redirect to login for 401 failures.
 * @param {string} string
 * @param {string} url
 * @param {{*}=} body
 */
async function apiRequest(method, url, body) {
    const token = sessionStorage.getItem('session_auth_token') || '';
    const headers = { 'Authorization': `Bearer ${token}` };

    if (body != null) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(body);
    }

    const response = await fetch(url, { headers, body });
    if (response.ok) {
        return response.json();
    }

    if (response.status === 401) {
        sessionStorage.removeItem('session_auth_token');
        alert(`You have been logged out.`);
        window.location = '/login';
        return Promise.reject(response);
    }

    alert(`Backend error: ${response.status}`);
    return Promise.reject(response);
}



