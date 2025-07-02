// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Production test configuration
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12 Pro'] },
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad'] },
    },
  ],

  // No webServer config - container is managed by test script
});
