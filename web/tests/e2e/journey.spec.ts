import { expect, test } from '@playwright/test';

const flight = { id: 1, origin: 'Madrid', destination: 'Roma', departureTime: '2030-06-05T12:00:00Z', finalPrice: 100, basePrice: 100, price: 100, availableSeats: 10, capacity: 180 };

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/session', (route) => route.fulfill({ json: { user: { id: 1, name: 'Traveller', email: 'test@example.invalid', isVip: true } } }));
  await page.route('**/api/flights', (route) => route.fulfill({ json: [flight] }));
});
test('searches flights, selects real API seats and sends them to checkout', async ({ page }) => {
  await page.route('**/api/flights/seats?*', (route) => route.fulfill({ json: [
    { number: '1A', supplement: 1800, available: true }, { number: '1B', supplement: 1800, available: false },
  ] }));
  await page.route('**/api/payments/checkout-session', async (route) => {
    expect(route.request().postDataJSON().selectedSeats).toEqual(['1A']);
    await route.fulfill({ json: { checkoutUrl: 'http://localhost:3100/success?session_id=cs_test_example12345' } });
  });
  await page.route('**/api/payments/session?*', (route) => route.fulfill({ json: { status: 'PAID' } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Elegir vuelo' }).click();
  await expect(page.getByRole('button', { name: '1B · 18.00 EUR' })).toBeDisabled();
  await page.getByRole('button', { name: '1A · 18.00 EUR' }).click();
  await page.getByRole('button', { name: 'Continuar en Stripe' }).click();
  await expect(page.getByRole('heading', { name: 'Tu reserva está confirmada.' })).toBeVisible();
});
test('never announces success for an unverified session', async ({ page }) => {
  await page.route('**/api/payments/session?*', (route) => route.fulfill({ status: 404, json: { error: 'Not found' } }));
  await page.goto('/success?session_id=cs_test_unknown12345');
  await expect(page.getByRole('status')).toContainText('No se pudo verificar');
  await expect(page.getByRole('heading', { name: 'Tu reserva está confirmada.' })).toHaveCount(0);
});
test('retains language across navigation and reload without hydration errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.getByRole('heading', { name: 'Available flights' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Available flights' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('downloads a boarding pass with the correct total', async ({ page }) => {
  await page.route('**/api/bookings/my-bookings', (route) => route.fulfill({ json: [{
    id: 1, bookingReference: 'YA-TEST', status: 'PAID', finalPrice: 100, totalAmount: 21800, currency: 'eur',
    adults: 2, children: 0, infants: 0, selectedSeats: ['1A', '3A'], flight,
  }] }));
  await page.goto('/my-bookings');
  await expect(page.getByText('Total pagado:')).toContainText('218');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar pase PDF' }).click();
  expect((await download).suggestedFilename()).toBe('boarding-pass-YA-TEST.pdf');
});
test('keeps the mobile booking dialog accessible and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/flights/seats?*', (route) => route.fulfill({ json: [
    { number: '1A', supplement: 1800, available: true },
  ] }));
  await page.goto('/');
  const book = page.getByRole('button', { name: 'Elegir vuelo' });
  await book.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
