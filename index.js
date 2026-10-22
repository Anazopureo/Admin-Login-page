const form = document.getElementById("loginForm");
const adminIdInput = document.getElementById("adminId");
const passwordInput = document.getElementById("password");
const toggleIcon = document.getElementById("visible");
const errorMsg = document.getElementById("errorMsg");
const loginBtn = form.querySelector(".login");

// Toggle password visibility
toggleIcon.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleIcon.textContent = isHidden ? "visibility_off" : "visibility";
});

function showError(message) {
    errorMsg.textContent = message;
    adminIdInput.classList.add("invalid");
    passwordInput.classList.add("invalid");
}

function clearError() {
    errorMsg.textContent = "";
    adminIdInput.classList.remove("invalid");
    passwordInput.classList.remove("invalid");
}

// Clear the error as soon as the user starts typing again
adminIdInput.addEventListener("input", clearError);
passwordInput.addEventListener("input", clearError);

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const adminId = adminIdInput.value.trim();
    const password = passwordInput.value;

    // Basic client-side check
    if (!adminId || !password) {
        showError("Please enter both Admin ID and password.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
        const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adminId, password })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            window.location.href = "dashboard.html";
        } else if (response.status === 401) {
            showError("Incorrect Admin ID or password.");
        } else if (response.status === 429) {
            showError("Too many attempts. Please wait and try again.");
        } else {
            showError(data.message || "Something went wrong. Please try again.");
        }
    } catch (err) {
        showError("Could not reach the server. Check your connection.");
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
});


//Send credentials to the backend

const API_URL = "/api/admin/login"; // change to your backend route

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const adminId = adminIdInput.value.trim();
    const password = passwordInput.value;

    if (!adminId || !password) {
        showError("Please enter both Admin ID and password.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    // Give up if the server doesn't answer within 10 seconds
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",          // lets the browser store the session cookie
            body: JSON.stringify({ adminId, password }),
            signal: controller.signal
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            window.location.href = "dashboard.html"; // change to your admin page
            return;
        }

        switch (response.status) {
            case 400:
                showError(data.message || "Invalid request. Check your details.");
                break;
            case 401:
                showError("Incorrect Admin ID or password.");
                passwordInput.value = "";
                passwordInput.focus();
                break;
            case 429:
                showError("Too many attempts. Please wait and try again.");
                break;
            default:
                showError("Server error. Please try again later.");
        }
    } catch (err) {
        if (err.name === "AbortError") {
            showError("The server took too long to respond. Try again.");
        } else {
            showError("Could not reach the server. Check your connection.");
        }
    } finally {
        clearTimeout(timeout);
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
});
