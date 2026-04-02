import { expect, test } from '@playwright/test';

test('loads my bookings for authenticated users', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-jwt-token');
  });

  await page.route('http://localhost:5000/api/bookings/my-bookings', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 22,
          userId: 1,
          flightId: 101,
          adults: 2,
          children: 1,
          infants: 0,
          createdAt: '2026-06-01T10:00:00.000Z',
          flight: {
            id: 101,
            origin: 'Madrid',
            destination: 'Roma',
            departureTime: '2026-06-05T12:00:00.000Z',
            price: 65.25,
          },
        },
      ]),
    });
  });

  await page.goto('/my-bookings');

  await expect(page.getByRole('heading', { name: /Mis Vuelos|My Bookings/ })).toBeVisible();
  await expect(page.getByText('MAD')).toBeVisible();
  await expect(page.getByText('ROM')).toBeVisible();
  await expect(page.getByText(/2 Adults|2 Adultos/)).toBeVisible();
});
