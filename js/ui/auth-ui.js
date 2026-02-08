import { getStoredProfile, logout } from "../script.js";

export function setupAuthUI() {
  const profile = getStoredProfile();
  const isLoggedIn = profile && profile.name ? true : false;

  const guestOnly = document.querySelectorAll("[data-guest-only]");
  const userOnly = document.querySelectorAll("[data-user-only]");

  // show/hide guest-only
  for (let i = 0; i < guestOnly.length; i++) {
    guestOnly[i].classList.toggle("hidden", isLoggedIn);
  }

  // show/hide user-only
  for (let i = 0; i < userOnly.length; i++) {
    userOnly[i].classList.toggle("hidden", !isLoggedIn);
  }

  // set credits if element exists
  const creditsEl = document.querySelector("[data-nav-credits]");
  if (creditsEl) {
    let credits = 0;
    if (profile && typeof profile.credits === "number")
      credits = profile.credits;
    creditsEl.textContent = String(credits);
  }

  // attach logout click (if present)
  const logoutLinks = document.querySelectorAll("[data-logout]");
  for (let i = 0; i < logoutLinks.length; i++) {
    logoutLinks[i].addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}
