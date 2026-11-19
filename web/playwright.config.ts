import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3100', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run start -- --port 3100',
    url: 'http://localhost:3100', reuseExistingServer: false, timeout: 120000,
    env: { APP_ENV: 'test', APP_URL: 'http://localhost:3100', WRITES_ENABLED: 'false', PAYMENTS_ENABLED: 'false', SETTLEMENTS_ENABLED: 'false' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
