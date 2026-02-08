import { describe, it, expect, beforeEach, vi } from "vitest";
import { login } from "../script.js";

describe("login", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
    localStorage.clear();
  });

  it("stores token and returns user data on success", async () => {
    const mockResponse = {
      data: {
        accessToken: "fake-token",
        name: "John",
        email: "john@stud.noroff.no",
        credits: 1000,
      },
    };

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await login({
      email: "john@stud.noroff.no",
      password: "password123",
    });

    expect(result.accessToken).toBe("fake-token");
    expect(localStorage.getItem("biddy_token")).toBe("fake-token");
  });

  it("throws an error when login fails", async () => {
    fetch.mockResolvedValue({
      ok: false,
      statusText: "Unauthorized",
      json: () => Promise.resolve({}),
    });

    await expect(
      login({
        email: "wrong@stud.noroff.no",
        password: "wrongpass",
      }),
    ).rejects.toThrow();
  });
});
