import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["js/test/**/*.test.js"],
    exclude: [
      "tests/**", // ignore Playwright tests
      "node_modules/**",
    ],
  },
});
