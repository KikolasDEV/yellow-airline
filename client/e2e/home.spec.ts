import { expect, test } from '@playwright/test';

test('shows available flights from the mocked API', async ({ page }) => {
  await page.route('http://localhost:5000/api/flights**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          origin: 'Madrid',
          destination: 'Paris',
          departureTime: '2026-06-01T10:00:00.000Z',
          price: 99.99,
        },
      ]),
    });
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Paris' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Reservar|Book Now/ })).toBeVisible();
  await expect(page.getByText('99.99€', { exact: true })).toBeVisible();
});
