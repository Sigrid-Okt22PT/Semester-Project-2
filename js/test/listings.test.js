import { describe, it, expect, beforeEach, vi } from "vitest";
import { listListings } from "../listings.js";

describe("listListings", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it("returns listings data on success", async () => {
    const mockResponse = {
      data: [{ id: 1, title: "Test listing" }],
      meta: { page: 1 },
    };

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await listListings({ page: 1 });

    expect(result.data.length).toBe(1);
    expect(result.data[0].title).toBe("Test listing");
  });

  it("throws an error when API fails", async () => {
    fetch.mockResolvedValue({
      ok: false,
      statusText: "Bad Request",
      json: () => Promise.resolve({}),
    });

    await expect(listListings()).rejects.toThrow();
  });
});
