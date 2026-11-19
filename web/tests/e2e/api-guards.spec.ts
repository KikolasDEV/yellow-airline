import { expect, test } from '@playwright/test';

// Real HTTP handlers: no network mocks or database credentials required.
test('rejects an off-origin mutation before touching the database', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    headers: { Origin: 'https://not-our-app.invalid' }, data: { email: 'no@example.invalid', password: 'irrelevant' },
  });
  expect(response.status()).toBe(403);
  expect(response.headers()['cache-control']).toContain('no-store');
});
test('maintenance blocks checkout and registration before side effects', async ({ request }) => {
  for (const path of ['/api/auth/register', '/api/payments/checkout-session']) {
    const response = await request.post(path, { headers: { Origin: 'http://localhost:3100' }, data: {} });
    expect(response.status()).toBe(503);
  }
});
test('rejects unsigned webhooks and unauthorized cron invocations', async ({ request }) => {
  expect((await request.post('/api/payments/webhook', { data: {} })).status()).toBe(400);
  expect((await request.get('/api/cron/reconcile')).status()).toBe(401);
});
