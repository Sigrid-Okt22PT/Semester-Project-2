import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock script.js BEFORE importing auth-ui.js
vi.mock("../script.js", () => {
  return {
    getStoredProfile: vi.fn(),
    logout: vi.fn(),
  };
});

// Import mocked functions so we can control them in tests
import { getStoredProfile, logout } from "../script.js";

// Import the function we want to test
import { setupAuthUI } from "../ui/auth-ui.js";

describe("setupAuthUI", () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = `
      <a data-guest-only>Login</a>
      <a data-guest-only>Sign up</a>

      <a data-user-only>Profile</a>
      <a data-user-only data-logout>Logout</a>

      <span data-nav-credits></span>
    `;

    vi.clearAllMocks();
  });

  it("shows guest-only and hides user-only when logged out", () => {
    getStoredProfile.mockReturnValue(null);

    setupAuthUI();

    const guestOnly = document.querySelectorAll("[data-guest-only]");
    const userOnly = document.querySelectorAll("[data-user-only]");

    expect(guestOnly[0].style.display).toBe("");
    expect(guestOnly[1].style.display).toBe("");

    expect(userOnly[0].style.display).toBe("none");
    expect(userOnly[1].style.display).toBe("none");

    // Credits should be 0 when logged out
    expect(document.querySelector("[data-nav-credits]").textContent).toBe("0");
  });

  it("shows user-only and hides guest-only when logged in", () => {
    getStoredProfile.mockReturnValue({ name: "TestUser", credits: 1000 });

    setupAuthUI();

    const guestOnly = document.querySelectorAll("[data-guest-only]");
    const userOnly = document.querySelectorAll("[data-user-only]");

    expect(guestOnly[0].style.display).toBe("none");
    expect(guestOnly[1].style.display).toBe("none");

    expect(userOnly[0].style.display).toBe("");
    expect(userOnly[1].style.display).toBe("");

    // Credits should show the stored value
    expect(document.querySelector("[data-nav-credits]").textContent).toBe(
      "1000",
    );
  });

  it("calls logout when clicking a logout link", () => {
    getStoredProfile.mockReturnValue({ name: "TestUser", credits: 1000 });

    setupAuthUI();

    const logoutLink = document.querySelector("[data-logout]");
    logoutLink.click();

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
