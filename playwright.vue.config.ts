import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: [
    "component-behavior.spec.ts",
    "select-position.spec.ts",
    "vue-glass.spec.ts",
  ],
  grep: /vue/i,
  grepInvert: /\breact\b/i,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report/vue", open: "never" }],
    ["json", { outputFile: "artifacts/glass/results.json" }],
  ],
  use: {
    headless: true,
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    { name: "vue-chrome", use: { browserName: "chromium", channel: "chrome" } },
    { name: "vue-edge", use: { browserName: "chromium", channel: "msedge" } },
    {
      name: "vue-firefox",
      use: { browserName: "firefox" },
      testMatch: "vue-glass.spec.ts",
    },
    {
      name: "vue-webkit",
      use: { browserName: "webkit" },
      testMatch: "vue-glass.spec.ts",
    },
  ],
  webServer: {
    command: "pnpm -C playground dev --host 127.0.0.1 --port 4173",
    port: 4173,
    reuseExistingServer: true,
  },
});
