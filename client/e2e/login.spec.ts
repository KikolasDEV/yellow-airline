import { expect, test } from '@playwright/test';

test('logs in and stores auth data in localStorage', async ({ page }) => {
  await page.route('http://localhost:5000/api/users/login', async (route) => {
    const body = route.request().postDataJSON() as { email: string; password: string };

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'fake-jwt-token',
        user: {
          name: body.email === 'vip@yellow.com' ? 'VIP Tester' : 'Member',
        },
      }),
    });
  });

  await page.route('http://localhost:5000/api/flights**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.goto('/login');

  await page.locator('input[type="email"]').fill('vip@yellow.com');
  await page.locator('input[type="password"]').fill('secret123');
  await page.getByRole('button', { name: /Despegar|Take Off/i }).click();

  await expect(page).toHaveURL(/\/$/);

  const storage = await page.evaluate(() => ({
    token: localStorage.getItem('token'),
    userName: localStorage.getItem('userName'),
  }));

  expect(storage.token).toBe('fake-jwt-token');
  expect(storage.userName).toBe('VIP Tester');
});
