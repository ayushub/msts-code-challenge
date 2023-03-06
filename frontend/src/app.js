/**
 * Authenticate user and store session token
 * @param {{ username: string; password: string; }} credentials
 * @returns {boolean} `true` if login attempt were successful, `false` otherwise
 */
async function authenticate(credentials) {
    const response = await fetch("/api/authentication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    if (response.ok) {
        const {
            token,
            token_expires,
            user: { role },
        } = await response.json();
        if (token) {
            sessionStorage.setItem("session_auth_token", token);
            sessionStorage.setItem("session_auth_token_expiry", token_expires);
            sessionStorage.setItem("user_role", role);
            return true;
        }
    }

    return false;
}

/**
 * Executes callback if a stored session token exists, otherwise redirects to login.
 * @param {() => void} callback
 */
function ifAuthenticated(callback) {
    if (!sessionStorage.getItem("session_auth_token")) {
        window.location = "/login";
        return;
    }
    callback();
}

/**
 * Check if the logged in user's token is about to expire
 * @returns {boolean} `true` if token about to expire in 1 min, `false` otherwise
 */
async function checkAuthentication() {
    const timeLeft =
        sessionStorage.getItem("session_auth_token_expiry") - Date.now();
    const TIMECHECK = 60000;
    console.log("token in expiry =>", timeLeft);
    if (timeLeft <= TIMECHECK) {
        const response = await apiRequest(
            "GET",
            "/api/authentication",
            null,
            false
        );
        console.log("reauthenticated?");
        if (response.token) {
            sessionStorage.setItem("session_auth_token", response.token);
            sessionStorage.setItem(
                "session_auth_token_expiry",
                response.token_expires
            );
            sessionStorage.setItem("user_role", response.role);
            return true;
        }
        return false;
    } else if (timeLeft > TIMECHECK) {
        return true;
    }
    return false;
}

/**
 * Check if the logged in user's role is Admin
 * @returns {boolean} `true` if role is Admin, `false` otherwise
 */
function isAdmin() {
    if (sessionStorage.getItem("user_role") === "Admin") {
        return true;
    }
    return false;
}

/**
 * Send an API request, with an optional JSON body, to the backend.
 * Handles redirect to login for 401 failures.
 * @param {string} string
 * @param {string} url
 * @param {{*}=} body
 * @param {boolean} checkAuth
 */
async function apiRequest(method, url, body, checkAuth = true) {
    if (checkAuth) checkAuthentication();
    const token = sessionStorage.getItem("session_auth_token") || "";
    const headers = { Authorization: `Bearer ${token}` };

    if (body != null) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(body);
    }

    const response = await fetch(url, { method, headers, body });
    if (response.ok) {
        return response.json();
    }

    if (response.status === 401) {
        sessionStorage.removeItem("session_auth_token");
        sessionStorage.removeItem("session_auth_token_expiry");
        sessionStorage.removeItem("user_role");
        alert(`You have been logged out.`);
        window.location = "/login";
        return Promise.reject(response);
    }

    alert(`Backend error: ${response.status}`);
    return Promise.reject(response);
}
