import { test, expect } from "@playwright/test";

test.describe("create listing", () => {
  test("logged in user can create a listing", async ({ page }) => {
    // Mock logged in user by setting localStorage before page load
    await page.addInitScript(() => {
      localStorage.setItem("biddy_token", "fake-token");
      localStorage.setItem(
        "biddy_profile",
        JSON.stringify({
          name: "TestUser",
          email: "test@stud.noroff.no",
          credits: 1000,
        })
      );
    });

    // Mock the API response for creating a listing
    await page.route("**/auction/listings", (route) => {
      const request = route.request();

      // Optional: verify request method
      if (request.method() === "POST") {
        route.fulfill({
          status: 201,
          json: {
            data: {
              id: "listing-123",
              title: "My Test Listing",
              endsAt: new Date(Date.now() + 86400000).toISOString(),
            },
          },
        });
      }
    });

    // Go to create listing page
    await page.goto("/listings/create.html", {
      waitUntil: "domcontentloaded",
    });

    // Fill out the form
    await page.locator('input[name="title"]').fill("My Test Listing");
    await page
      .locator('input[name="endsAt"]')
      .fill("2099-12-31T12:00");
    await page
      .locator('textarea[name="description"]')
      .fill("A test description");

    // Submit the form
    await page.getByRole("button", { name: /create/i }).click();

    //  After successful creation, we should be redirected to the listing details page
    await expect(page).toHaveURL(/listings\/details/i);
  });
});
