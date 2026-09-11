import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: isCI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node scripts/e2e-api.mjs',
      url: 'http://127.0.0.1:8001/health',
      timeout: 180_000,
      reuseExistingServer: !isCI,
    },
    {
      command: 'npm --prefix apps/ops-console run start -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5173',
      timeout: 180_000,
      reuseExistingServer: !isCI,
    },
  ],
})
