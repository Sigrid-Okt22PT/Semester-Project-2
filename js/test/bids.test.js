import { describe, it, expect } from "vitest";
import { getHighestBid } from "../utils/bids.js";

describe("getHighestBid", () => {
  it("returns 0 when listing has no bids", () => {
    const listing = { bids: [] };

    const result = getHighestBid(listing);

    expect(result).toBe(0);
  });

  it("returns the highest bid amount when bids exist", () => {
    const listing = {
      bids: [
        { amount: 100 },
        { amount: 250 },
        { amount: 75 },
      ],
    };

    const result = getHighestBid(listing);

    expect(result).toBe(250);
  });

  it("returns 0 when listing has no bids property", () => {
    const listing = {};

    const result = getHighestBid(listing);

    expect(result).toBe(0);
  });

  it("handles invalid bid values safely", () => {
    const listing = {
      bids: [
        { amount: "not-a-number" },
        {},
        { amount: 500 },
      ],
    };

    const result = getHighestBid(listing);

    expect(result).toBe(500);
  });
});
