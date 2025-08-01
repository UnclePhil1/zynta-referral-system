
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");
  const API_BASE_URL = "https://zynta-referral-system.onrender.com";

  if (!token || !userData) {
    window.location.href = "/auth.html";
    return;
  }

  let user;
  try {
    user = JSON.parse(userData);
  } catch {
    window.location.href = "/auth.html";
    return;
  }

  const userAvatar = document.getElementById("userAvatar");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const userReferralCode = document.getElementById("userReferralCode");
  const totalReferrals = document.getElementById("totalReferrals");
  const copyCodeBtn = document.getElementById("copyCodeBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const leaderboardContent = document.getElementById("leaderboardContent");

  displayUserInfo(user);
  loadProfile();
  loadLeaderboard();

  copyCodeBtn.addEventListener("click", copyReferralCode);
  logoutBtn.addEventListener("click", logout);

  function displayUserInfo(userData) {
    const initials = userData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    userAvatar.textContent = initials;

    userName.textContent = userData.name;
    userEmail.textContent = userData.email;
    userReferralCode.textContent = userData.referralCode;
    totalReferrals.textContent = userData.referralCount !== undefined 
    ? userData.referralCount 
    : (userData.points / 10);
}

  async function loadLeaderboard() {
    const leaderboardContent = document.getElementById("leaderboardContent");
    leaderboardContent.innerHTML =
      '<div class="loading">Loading leaderboard...</div>';

    try {
      const response = await fetch(`${API_BASE_URL}/api/all-users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load leaderboard");
      }

      const users = await response.json();

      if (users.length === 0) {
        leaderboardContent.innerHTML =
          '<div class="no-users">No users found</div>';
        return;
      }
      leaderboardContent.innerHTML = users
        .map(
          (user, index) => `
            <div class="user-row">
                <div class="user-rank">${index + 1}</div>
                <div class="user-name">${user.name}</div>
                <div class="user-email">${user.email}</div>
                <div class="user-referrals">${user.points}</div>
            </div>
        `
        )
        .join("");
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      leaderboardContent.innerHTML = `
            <div class="error-message">
                Failed to load leaderboard. 
                <button onclick="loadLeaderboard()">Try Again</button>
            </div>
        `;
    }
  }

  function copyReferralCode() {
    navigator.clipboard
      .writeText(user.referralCode)
      .then(() => {
        const originalText = copyCodeBtn.textContent;
        copyCodeBtn.textContent = "Copied!";
        setTimeout(() => {
          copyCodeBtn.textContent = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("Failed to copy referral code. Please try again.");
      });
  }

  async function loadProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const profile = await response.json();

      if (!response.ok) {
        throw new Error(profile.error || "Failed to load profile");
      }

      localStorage.setItem("userData", JSON.stringify(profile));
      displayUserInfo(profile);

    } catch (error) {
      console.error("Error loading profile:", error);
      document.getElementById("totalReferrals").textContent = "0";
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      window.location.href = "/auth.html";
    }
  }
});
