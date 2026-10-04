import { defineConfig, devices } from '@playwright/test'

// Smoke tests of the client booking flow (tests/e2e). Mobile-first: 375px wide.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:5174',
    ...devices['Desktop Chrome'],
    viewport: { width: 375, height: 812 },
    timezoneId: 'Asia/Jerusalem',
  },
  webServer: {
    command: 'npx vite --port 5174 --strictPort',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
