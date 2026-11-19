import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error('TEST_DATABASE_URL required; never use DATABASE_URL implicitly.');
const target = new URL(databaseUrl);
if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) {
  throw new Error('Integration tests require a local database ending in _test.');
}

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    include: ['tests/integration/**/*.test.ts'], fileParallelism: false,
    testTimeout: 30000, hookTimeout: 30000,
    env: {
      DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl, APP_ENV: 'test', APP_URL: 'http://localhost:3000',
      WRITES_ENABLED: 'true', PAYMENTS_ENABLED: 'true', SETTLEMENTS_ENABLED: 'true',
      STRIPE_SECRET_KEY: 'sk_test_integration_not_a_real_key',
      JWT_SECRET: 'integration-test-only-secret-at-least-32-characters',
    },
  },
});
