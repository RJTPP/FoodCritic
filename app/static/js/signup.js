
function showError(id, message) {
    const errorElement = document.getElementById(id);
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
}

function hideError(id) {
    document.getElementById(id).classList.add("hidden");
}

document.getElementById("next-to-step-2").addEventListener("click", function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    if (!emailPattern.test(email)) {
        showError("email-error", "Invalid email format.");
        isValid = false;
    } else hideError("email-error");

    if (!password) {
        showError("password-error", "Password is required.");
        isValid = false;
    } else hideError("password-error");

    if (password !== confirmPassword) {
        showError("confirm-password-error", "Passwords do not match.");
        isValid = false;
    } else hideError("confirm-password-error");

    if (isValid) {
        document.getElementById("step-1").classList.add("hidden");
        document.getElementById("step-2").classList.remove("hidden");
    }
});

document.getElementById("back-to-step-1").addEventListener("click", function () {
    document.getElementById("step-1").classList.remove("hidden");
    document.getElementById("step-2").classList.add("hidden");
})

document.getElementById("signup-button").addEventListener("click", async function (event) {
    hideError("signup-error");

    event.preventDefault();
    const username = document.getElementById("username").value;
    const phone = document.getElementById("phone").value;
    const role = document.getElementById("role").value;
    const phonePattern = /^\+?[0-9]{7,15}$/;
    let isValid = true;

    if (!username) {
        showError("username-error", "Username is required.");
        isValid = false;
    } else hideError("username-error");

    if (phone && !phonePattern.test(phone)) {
        showError("phone-error", "Invalid phone number.");
        isValid = false;
    } else hideError("phone-error");

    if (!isValid) return;

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const data = { email, password, username, phone, role };

    try {
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem("access_token", result.access_token);
            localStorage.setItem("token_type", result.token_type);

            window.location.href = "/";
        } else {
            showError("signup-error", result.detail || "Signup failed.");
        }
    } catch (error) {
        if (response.status === 400) {
            showError("signup-error", result.detail);
        } else {
            showError("signup-error", `An error occurred. Please try again.`);
        }

    }
});
