import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    include: ['src/**/*.test.ts'],
    env: { APP_ENV: 'test', APP_URL: 'http://localhost:3000', JWT_SECRET: 'unit-test-only-secret-with-more-than-32-characters' },
  },
});
