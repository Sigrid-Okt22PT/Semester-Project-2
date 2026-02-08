import { test, expect } from "@playwright/test";

test.describe("login", () => {
  test("user can login", async ({ page }) => {
    await page.goto("/auth/login.html");

    await page.locator('input[name="email"]').fill(process.env.E2E_USER_EMAIL);
    await page
      .locator('input[name="password"]')
      .fill(process.env.E2E_USER_PASSWORD);

    await page.getByRole("button", { name: /login/i }).click();

    // Logged in = a user-only logout link is visible
    await expect(
      page.locator("[data-user-only][data-logout]").first(),
    ).toBeVisible();
  });

  test("wrong password shows error", async ({ page }) => {
    await page.goto("/auth/login.html");

    await page.locator('input[name="email"]').fill(process.env.E2E_USER_EMAIL);
    await page.locator('input[name="password"]').fill("wrongpassword");

    await page.getByRole("button", { name: /login/i }).click();

    // Error message should appear
    const error = page
      .locator("[data-login-error], [data-error], #message-container")
      .first();

    await expect(error).not.toBeEmpty();
  });
});
