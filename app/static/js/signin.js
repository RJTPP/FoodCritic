function showError(id, message) {
    const errorElement = document.getElementById(id);
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
}

function hideError(id) {
    document.getElementById(id).classList.add("hidden");
}

document.getElementById("signin-button").addEventListener("click", signin);
document.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        signin();
    }
});

async function signin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    let isValid = true;

    if (!username) {
        showError("username-error", "Username is required.");
        isValid = false;
    } else hideError("username-error");

    if (!password) {
        showError("password-error", "Password is required.");
        isValid = false;
    } else hideError("password-error");

    if (!isValid) return; // Stop if validation fails

    // Prepare request data
    const data = { username, password };

    try {
        const response = await fetch("/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Store JWT token
            localStorage.setItem("access_token", result.access_token);
            localStorage.setItem("token_type", result.token_type);

            // Redirect
            window.location.href = "/signin";
        } else {
            showError("signin-error", result.detail || "Invalid username or password.");
        }
    } catch (error) {
        showError("signin-error", "An error occurred. Please try again.");
    }
}
