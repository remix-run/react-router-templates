import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./.tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "line",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
    {
      name: "webkit",
      use: devices["Desktop Safari"],
    },
    {
      name: "msedge",
      use: {
        ...devices["Desktop Edge"],
        // Desktop Edge uses chromium by default
        // https://github.com/microsoft/playwright/blob/993546c1bc3267fb72eddaf8cf003cb2e1519598/packages/playwright-core/src/server/deviceDescriptorsSource.json#L1652
        channel: "msedge",
      },
    },
    {
      name: "firefox",
      use: devices["Desktop Firefox"],
    },
  ],
});
