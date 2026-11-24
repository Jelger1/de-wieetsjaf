// Playwright-configuratie: end-to-end tests in Chromium, Firefox en WebKit.
// Start een eigen testserver op poort 4322 (los van de preview op 4321).
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: [['list'], ['json', { outputFile: 'test-results/resultaten.json' }]],
  use: {
    baseURL: 'http://localhost:4322',
    trace: 'retain-on-failure',
    locale: 'nl-NL',
    timezoneId: 'Europe/Amsterdam',
  },
  webServer: {
    command: 'node scripts/dev-server.mjs',
    env: { PORT: '4322' },
    url: 'http://localhost:4322/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobiel-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'mobiel-webkit', use: { ...devices['iPhone 14'] } },
  ],
});
