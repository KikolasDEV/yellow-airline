import { expect, test } from '@playwright/test';

test('allows authenticated booking flow with seat selection', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-jwt-token');
  });

  await page.route('http://localhost:5000/api/flights**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 101,
          origin: 'Madrid',
          destination: 'Roma',
          departureTime: '2026-06-05T12:00:00.000Z',
          price: 65.25,
          basePrice: 65.25,
          finalPrice: 65.25,
          availableSeats: 18,
          occupancyRate: 0.4,
          urgencyFactor: 1,
          capacity: 180,
        },
      ]),
    });
  });

  await page.route('http://localhost:5000/api/bookings/checkout-session', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        checkoutUrl: 'http://localhost:5173/success?session_id=cs_test_123',
        sessionId: 'cs_test_123',
        amountTotal: 6525,
        currency: 'eur',
        unitPrice: 65.25,
      }),
    });
  });

  await page.goto('/');

  await page.getByRole('button', { name: /Reservar|Book Now/ }).first().click();
  await expect(page.getByText('Design your cabin experience')).toBeVisible();

  await page.getByRole('button', { name: /^1A$/ }).click();

  const bookingRequest = page.waitForRequest('http://localhost:5000/api/bookings/checkout-session');
  await page.getByRole('button', { name: 'Confirm Booking' }).click();

  await bookingRequest;
  await expect(page).toHaveURL(/\/success\?session_id=cs_test_123/);
});
