import { defineConfig, devices } from "@playwright/test";

// Use process.env.CI to detect if we're running on GitHub Actions
const CI = !!process.env.CI;

export default defineConfig({
  // Directory where tests are located
  testDir: "./e2e",

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: CI,

  // Retry on CI only
  retries: CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: CI ? 1 : undefined,

  // Reporter to use
  reporter: [["html", { open: "never" }], ["list"]],

  // Shared settings for all the projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Record video only when retrying a test for the first time
    video: "on-first-retry",

    // Take screenshot only when test fails
    screenshot: "only-on-failure",
  },

  // Configure projects for different browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Test against mobile viewports
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 60 * 1000,
  },

  // Folder for test artifacts like screenshots, videos, traces, etc.
  outputDir: "test-results/",
});
