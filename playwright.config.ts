import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  expect: {
    toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.01 },
  },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: { headless: true, browserName: "chromium", trace: "retain-on-failure" },
  webServer: [
    {
      command: "pnpm -C playground dev --host 127.0.0.1 --port 4173",
      port: 4173,
      reuseExistingServer: true,
    },
    {
      command: "pnpm -C playground-react dev --host 127.0.0.1 --port 4174",
      port: 4174,
      reuseExistingServer: true,
    },
  ],
});
