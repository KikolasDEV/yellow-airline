import { describe, expect, it, vi, afterEach } from 'vitest';
import { checkoutSessionSchema } from '@/modules/payments/payments.schemas';
import { calculateSeatSupplement, createSeatLayout, bookingTotal } from './seats';
import { calculatePricingSnapshot } from './pricing';
import { isSameOrigin, mutationGuard } from './request-security';
import { parseJsonBody } from '@/utils/http';
import { signSessionToken, verifySessionToken } from './jwt';

afterEach(() => vi.unstubAllEnvs());
const payload = { flightId: 1, adults: 1, children: 0, infants: 0, selectedSeats: ['1A'] };

describe('checkout validation', () => {
  it('requires seats, adults and a bounded party', () => {
    expect(checkoutSessionSchema.safeParse(payload).success).toBe(true);
    for (const invalid of [
      { ...payload, adults: 0 }, { ...payload, infants: 2 }, { ...payload, adults: 10 },
      { ...payload, flightId: '1' }, { ...payload, selectedSeats: [] },
      { ...payload, adults: 2, selectedSeats: ['1A', '1A'] }, { ...payload, total: 1 },
    ]) expect(checkoutSessionSchema.safeParse(invalid).success).toBe(false);
  });
  it('calculates seat costs on the server, rejects non-existent and duplicate seats', () => {
    expect(createSeatLayout(180)).toHaveLength(180);
    expect(calculateSeatSupplement(180, ['1A', '3B'])).toBe(1800);
    expect(() => calculateSeatSupplement(12, ['3A'])).toThrow();
    expect(() => calculateSeatSupplement(12, ['1A', '1A'])).toThrow();
  });
  it('preserves historical per-seat prices and uses exact new totals', () => {
    expect(bookingTotal({ finalPrice: 12.34, adults: 2, children: 1 })).toBe(3702);
    expect(bookingTotal({ finalPrice: 12.34, adults: 2, children: 1, totalAmount: 5502 })).toBe(5502);
  });
  it('has deterministic prices away from departure and bounds availability', () => {
    const result = calculatePricingSnapshot({ basePrice: 100, occupiedSeats: 5, capacity: 10, departureTime: new Date(Date.now() + 60 * 86400000) });
    expect(result.finalPrice).toBe(150);
    expect(result.availableSeats).toBe(5);
  });
});

describe('request security', () => {
  it('rejects cross-origin and missing-origin mutations', () => {
    expect(isSameOrigin(new Request('http://localhost:3000/api/auth/login', { headers: { Origin: 'https://evil.example' } }))).toBe(false);
    expect(isSameOrigin(new Request('http://localhost:3000'))).toBe(false);
    expect(isSameOrigin(new Request('http://localhost:3000', { headers: { Origin: 'http://localhost:3000' } }))).toBe(true);
  });
  it('fails closed when writes are not explicitly enabled', () => {
    vi.stubEnv('WRITES_ENABLED', 'false');
    expect(mutationGuard(new Request('http://localhost:3000', { headers: { Origin: 'http://localhost:3000' } }))?.status).toBe(503);
  });
  it('handles malformed and oversized JSON without unhandled exceptions', async () => {
    expect(await parseJsonBody(new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }))).toBeNull();
    expect(await parseJsonBody(new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify('a'.repeat(17000)) }))).toBeNull();
  });
  it('separates JWT audiences between staging and production', () => {
    const token = signSessionToken({ userId: 1, email: 'test@example.invalid', isVip: true });
    expect(verifySessionToken(token).userId).toBe(1);
    vi.stubEnv('APP_ENV', 'production');
    expect(() => verifySessionToken(token)).toThrow();
  });
});
