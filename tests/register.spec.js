import { test, expect } from "@playwright/test";

test.describe("registration", () => {
  test("successful registration sends request and redirects", async ({
    page,
  }) => {
    await page.route("**/auth/register", (route) =>
      route.fulfill({
        status: 200,
        json: {
          data: { name: "Test User", email: "success@stud.noroff.no" },
        },
      }),
    );

    await page.goto("/auth/index.html");

    await page.locator('input[name="name"]').fill("Test User");
    await page.locator('input[name="email"]').fill("success@stud.noroff.no");
    await page.locator('input[name="password"]').fill("password123");

    // Wait for the request to happen
    const reqPromise = page.waitForRequest("**/auth/register");

    await page.getByRole("button", { name: /sign up|register/i }).click();

    const req = await reqPromise;
    expect(req.method()).toBe("POST");

    // After a successful register, most apps redirect to login
    // Change this to match your real redirect if needed
    await expect(page).not.toHaveURL(/auth\/index/i);
  });

  test("failed registration shows error message", async ({ page }) => {
    await page.route("**/auth/register", (route) =>
      route.fulfill({
        status: 400,
        json: { errors: [{ message: "Registration failed" }] },
      }),
    );

    await page.goto("/auth/index.html");

    await page.locator('input[name="name"]').fill("Test User");
    await page.locator('input[name="email"]').fill("fail@stud.noroff.no");
    await page.locator('input[name="password"]').fill("password123");

    await page.getByRole("button", { name: /sign up|register/i }).click();

    // You DO have a register error element already (you showed it earlier)
    await expect(page.locator("[data-register-error]")).toContainText(
      "Registration failed",
    );
  });
});
