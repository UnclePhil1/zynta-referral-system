document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("logout")) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Check if already logged in - use consistent key
  if (localStorage.getItem("authToken")) {
    window.location.href = "/index.html";
    return;
  }

  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authMessage = document.getElementById("authMessage");

  const API_BASE_URL = "https://zynta-referral-system.onrender.com";

  loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
    authMessage.style.display = "none";
  });

  registerTab.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
    authMessage.style.display = "none";
  });

  // Login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token and user data with consistent keys
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
      window.location.href = "/index.html";
    } catch (error) {
      console.error("Login error:", error);
      showMessage(error.message, "error");
    }
  });

  // Register form submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const referralCode = document.getElementById("registerReferralCode").value;

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, referralCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
      window.location.href = "/index.html";
    } catch (error) {
      console.error("Registration error:", error);
      showMessage(error.message, "error");
    }
  });

  function showMessage(text, type) {
    authMessage.textContent = text;
    authMessage.className = `message ${type}`;
    authMessage.style.display = "block";
  }
});
