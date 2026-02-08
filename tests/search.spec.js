import { test, expect } from "@playwright/test";

test.describe("search", () => {
  test("everyone can search listings", async ({ page }) => {
    // Mock listings search endpoint (and optionally list endpoint)
    await page.route("**/auction/listings/search**", (route) =>
      route.fulfill({
        status: 200,
        json: {
          data: [
            {
              id: "1",
              title: "Test Listing",
              description: "A test item",
              endsAt: new Date(Date.now() + 86400000).toISOString(),
              bids: [{ amount: 100 }],
              media: [],
            },
          ],
          meta: { page: 1, pageCount: 1, count: 1 },
        },
      }),
    );

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const input = page
      .locator('form[data-search-form] input[name="search"]')
      .first();

    await input.fill("test");
    await input.press("Enter");

    // Grid should show our mocked card
    const grid = page.locator("[data-listings]");
    await expect(grid.locator("article").first()).toBeVisible();
  });
});
