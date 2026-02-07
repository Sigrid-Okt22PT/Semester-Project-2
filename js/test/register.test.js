import { describe, it, expect, beforeEach, vi } from "vitest";
import { register } from "../script.js";

describe("register", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it("returns user data when registration succeeds", async () => {
    const mockResponse = {
      data: {
        name: "John Smith",
        email: "john@stud.noroff.no",
      },
    };

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await register({
      name: "John Smith",
      email: "john@stud.noroff.no",
      password: "password123",
    });

    expect(result).toEqual(mockResponse.data);
  });

  it("throws an error when email is not stud.noroff.no", async () => {
    await expect(
      register({
        name: "John",
        email: "john@gmail.com",
        password: "password123",
      })
    ).rejects.toThrow("Email must be @stud.noroff.no");
  });
});
