import { fetchWithAuth } from "./utils.js";


fetchWithAuth("/api/auth/verify/", {}, false)
    .then(data => {
        const username = document.getElementById("username-nev");
        const userRole = document.getElementById("user-role-nev");
        const profileInitial = document.getElementById("profile-initial-nev");

        username.textContent = data.user;
        profileInitial.textContent = data.user[0].toUpperCase();
        if (data.role === "admin") {
            userRole.textContent = "Admin";
        } else if (data.role === "owner") {
            userRole.textContent = "Restaurant Owner";
            const manageBtn = document.getElementById("manage-link-nav");
            manageBtn.classList.remove("hidden");
        } else {
            userRole.textContent = "Regular User";
        }
    })
    .catch(error => {
        console.log(error);
        
        const username = document.getElementById("username-nev");
        const userRole = document.getElementById("user-role-nev");
        const profileInitial = document.getElementById("profile-initial-nev");
        const profileWrapper = document.getElementById("dropdownDefaultButton");
        const loginBtn = document.getElementById("login-btn-nev");
        const signupBtn = document.getElementById("signup-btn-nev");

        username.classList.add("hidden");
        userRole.classList.add("hidden");
        profileInitial.classList.add("hidden");
        profileWrapper.classList.add("hidden");
        loginBtn.classList.remove("hidden");
        signupBtn.classList.remove("hidden");
    });
