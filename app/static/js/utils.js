export async function checkAuth(redirectionUrl = "/signin") {
    const token = localStorage.getItem("access_token");
    const token_type = localStorage.getItem("token_type");

    if (!token) {
        console.log("No token found. Redirecting to login...");
        window.location.href = redirectionUrl; // Redirect to login if no token
        return;
    }

    try {
        const response = await fetch("/api/auth/verify", {
            method: "GET",
            headers: { "Authorization": `${token_type} ${token}` }
        });

        if (!response.ok) {
            console.log("Token is invalid or expired. Redirecting to login...");
            logoutUser();
        }
    } catch (error) {
        console.error("Error validating token:", error);
        logoutUser();
    }
}

export async function fetchWithOutAuth(url, options = {}) {
    const response = await fetch(url, options);
    return response.json();
}

export async function fetchWithAuth(url, options = {}, logoutOnFailure = true) {
    const token = localStorage.getItem("access_token");
    const token_type = localStorage.getItem("token_type");

    if (!token) {
        if (!logoutOnFailure) return null;
        console.log("No token found. Redirecting to login...");
        window.location.href = "/signin"; // Redirect if token is missing
        return;
    }

    // Ensure headers exist and include the Authorization header
    options.headers = {
        ...options.headers,
        "Authorization": `${token_type} ${token}`,
        "Content-Type": "application/json"
    };

    try {
        const response = await fetch(url, options);

        // If token is expired or invalid, log the user out
        if (response.status === 401) {
            if (!logoutOnFailure) return null;
            console.log("Unauthorized! Token expired or invalid. Logging out...");
            logoutUser();
            return;
        }

        if (response.status === 204 || response.headers.get('Content-Length') === "0") {
            return response;
        }

        return response.json(); // Return JSON response
    } catch (error) {
        console.error("Error:", error);
        if (!logoutOnFailure) return null;
        console.log("An error occurred. Logging out...");
        logoutUser();
    }
}

export function logoutUser() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    window.location.href = "/"; // Redirect to login
}

export async function signinWithToken() {
    const token = localStorage.getItem("access_token");
    const token_type = localStorage.getItem("token_type");

    if (!token) {
        return null;
    }

    const response = await fetch("/api/auth/redirect", {
        method: "GET",
        headers: {
            "Authorization": `${token_type} ${token}`
        }
    });
    if (response.ok) {
        if (response.url === window.location.href) {
            return null;
        }
        return response.url;
    } else {
        return null;
        // console.error("Failed to get redirect URL.");
    }
}

export function createProfilePlaceholder(name, size=8) {
    const htmlContent = `
    <div class="h-${size} w-${size} rounded-full bg-gray-200 flex items-center justify-center m-3">
        <span id="profile-initial-nev" class="text-sm font-medium">${name.charAt(0).toUpperCase()}</span>
    </div>
    `;
    return htmlContent;
}