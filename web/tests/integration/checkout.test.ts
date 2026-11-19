import { randomUUID } from 'node:crypto';
import type Stripe from 'stripe';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { reserveCheckout, createCheckoutSession, syncCheckoutSession, getOwnedSession } from '@/modules/payments/payments.service';
import { handleStripeWebhook } from '@/modules/payments/payments.service';
import { loginUser, registerUser } from '@/modules/auth/auth.service';
import { rateLimit } from '@/lib/request-security';

const stripe = vi.hoisted(() => ({
  checkout: { sessions: { create: vi.fn(), retrieve: vi.fn(), expire: vi.fn() } },
  webhooks: { constructEvent: vi.fn() },
}));
vi.mock('@/lib/stripe', () => ({ getStripeClient: () => stripe }));

let flightId: number;
let first: number;
let second: number;
const flights: number[] = [];
const users: number[] = [];
const payload = (userId: number, selectedSeats = ['1A']) => ({
  userId, flightId, adults: selectedSeats.length, children: 0, infants: 0, selectedSeats,
});
const sessionFor = (order: { id: string; amountTotal: number }, overrides = {}) => ({
  id: `cs_test_${order.id.replaceAll('-', '')}`, mode: 'payment', status: 'complete', payment_status: 'paid',
  amount_total: order.amountTotal, currency: 'eur', livemode: false,
  metadata: { app: 'yellow-airline-web', environment: 'test', orderId: order.id },
  ...overrides,
}) as unknown as Stripe.Checkout.Session;

beforeEach(async () => {
  vi.clearAllMocks();
  const nonce = randomUUID();
  const created = await prisma.user.createManyAndReturn({
    data: ['a', 'b'].map((prefix) => ({ name: 'Integration', email: `${prefix}-${nonce}@example.invalid`, passport: 'TEST', password: 'not-a-login-hash' })),
  });
  [first, second] = created.map((user) => user.id);
  users.push(first, second);
  const flight = await prisma.flight.create({
    data: { origin: 'Test', destination: nonce, departureTime: new Date(Date.now() + 60 * 86400000), price: 100, capacity: 3 },
  });
  flightId = flight.id;
  flights.push(flightId);
});
afterEach(() => vi.unstubAllEnvs());
afterAll(async () => {
  // Only records created by this suite, never a global delete or database reset.
  await prisma.flightSeat.deleteMany({ where: { flightId: { in: flights } } });
  await prisma.checkoutOrder.deleteMany({ where: { flightId: { in: flights } } });
  await prisma.booking.deleteMany({ where: { flightId: { in: flights } } });
  await prisma.flight.deleteMany({ where: { id: { in: flights } } });
  await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.$disconnect();
});

describe('real PostgreSQL locking and Stripe boundary', () => {
  it('serializes competing seat claims', async () => {
    const results = await Promise.allSettled([reserveCheckout(payload(first)), reserveCheckout(payload(second))]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(await prisma.flightSeat.count({ where: { flightId } })).toBe(1);
  });
  it('does not oversell when different seats compete for capacity', async () => {
    const results = await Promise.allSettled([
      reserveCheckout(payload(first, ['1A', '1B'])), reserveCheckout(payload(second, ['1C', '1D'])),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  });
  it('returns the same purchase for simultaneous double clicks', async () => {
    const [a, b] = await Promise.all([reserveCheckout(payload(first)), reserveCheckout(payload(first))]);
    expect(a.id).toBe(b.id);
  });
  it('fulfills a paid session exactly once under concurrent delivery', async () => {
    const order = await reserveCheckout(payload(first));
    const session = sessionFor(order);
    await Promise.all([syncCheckoutSession(session), syncCheckoutSession(session)]);
    const bookings = await prisma.booking.findMany({ where: { flightId } });
    expect(bookings).toHaveLength(1);
    expect(bookings[0].totalAmount).toBe(order.amountTotal);
    expect(bookings[0].selectedSeats).toEqual(['1A']);
  });
  it('retains a REVIEW record for amount mismatch instead of losing a payment', async () => {
    const order = await reserveCheckout(payload(first));
    await expect(syncCheckoutSession(sessionFor(order, { amount_total: 1 }))).rejects.toThrow();
    expect((await prisma.checkoutOrder.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('REVIEW');
    expect(await prisma.booking.count({ where: { flightId } })).toBe(0);
  });
  it('does not free seats based on local time alone', async () => {
    const order = await reserveCheckout(payload(first));
    await prisma.checkoutOrder.update({ where: { id: order.id }, data: { expiresAt: new Date(0) } });
    await expect(reserveCheckout(payload(second))).rejects.toThrow();
    await syncCheckoutSession(sessionFor(order, { status: 'expired', payment_status: 'unpaid' }));
    expect(await reserveCheckout(payload(second))).toBeDefined();
  });
  it('ignores events from another environment', async () => {
    const order = await reserveCheckout(payload(first));
    await syncCheckoutSession(sessionFor(order, { metadata: { app: 'yellow-airline-web', environment: 'production', orderId: order.id } }));
    expect(await prisma.booking.count({ where: { flightId } })).toBe(0);
  });
  it('respects historical paid capacity', async () => {
    await prisma.booking.create({ data: { userId: first, flightId, adults: 3, status: 'PAID' } });
    await expect(reserveCheckout(payload(second))).rejects.toThrow();
  });
  it('retries session creation with the same Stripe idempotency key after a timeout', async () => {
    stripe.checkout.sessions.create.mockRejectedValueOnce(new Error('network timeout'));
    await expect(createCheckoutSession(payload(first))).rejects.toThrow('network timeout');
    const order = await prisma.checkoutOrder.findFirstOrThrow({ where: { flightId } });
    stripe.checkout.sessions.create.mockResolvedValueOnce(sessionFor(order, { status: 'open', payment_status: 'unpaid', url: 'https://checkout.stripe.com/test' }));
    await createCheckoutSession(payload(first));
    expect(stripe.checkout.sessions.create.mock.calls[0][1]).toEqual(stripe.checkout.sessions.create.mock.calls[1][1]);
    expect(await prisma.checkoutOrder.count({ where: { flightId } })).toBe(1);
  });
  it('does not reveal another users purchase', async () => {
    const order = await reserveCheckout(payload(first));
    await syncCheckoutSession(sessionFor(order));
    await expect(getOwnedSession(sessionFor(order).id, second)).rejects.toThrow('Compra no encontrada');
  });
  it('rejects invalid webhook signatures before writing', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
    stripe.webhooks.constructEvent.mockImplementationOnce(() => { throw new Error('bad signature'); });
    await expect(handleStripeWebhook('{}', 'invalid')).rejects.toThrow('Firma');
    expect(await prisma.booking.count({ where: { flightId } })).toBe(0);
  });
  it('preserves bcrypt authentication and normalizes new account emails', async () => {
    const email = `AUTH-${randomUUID()}@example.invalid`;
    const user = await registerUser({ name: 'New Traveller', email, passport: 'TEST1234', password: 'A-long-test-password-123' });
    expect(user).not.toBeNull();
    users.push(user!.id);
    expect(user!.email).toBe(email.toLowerCase());
    expect(await loginUser({ email, password: 'incorrect' })).toBeNull();
    expect((await loginUser({ email, password: 'A-long-test-password-123' }))?.user.id).toBe(user!.id);
  });
  it('counts rate limits atomically across simultaneous requests', async () => {
    const identity = randomUUID();
    const results = await Promise.all(Array.from({ length: 5 }, () => rateLimit('integration', identity, 2)));
    expect(results.filter(Boolean)).toHaveLength(2);
  });
  it('keeps a paid order paid when an older expiration notification arrives', async () => {
    const order = await reserveCheckout(payload(first));
    await syncCheckoutSession(sessionFor(order));
    await syncCheckoutSession(sessionFor(order, { status: 'expired', payment_status: 'unpaid' }));
    expect((await prisma.checkoutOrder.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('PAID');
    expect(await prisma.flightSeat.count({ where: { flightId } })).toBe(1);
  });
  it('binds a recovered open Stripe session without overwriting a completed purchase', async () => {
    const order = await reserveCheckout(payload(first));
    await syncCheckoutSession(sessionFor(order, { status: 'open', payment_status: 'unpaid' }));
    const updated = await prisma.checkoutOrder.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.stripeSessionId).toBe(sessionFor(order).id);
    expect(updated.status).toBe('OPEN');
  });
  it('does not automatically clear a review hold on a later event', async () => {
    const order = await reserveCheckout(payload(first));
    await expect(syncCheckoutSession(sessionFor(order, { amount_total: 1 }))).rejects.toThrow();
    await expect(syncCheckoutSession(sessionFor(order))).rejects.toThrow();
    expect(await prisma.booking.count({ where: { flightId } })).toBe(0);
  });
  it('pauses settlement writes without acknowledging an owned payment', async () => {
    const order = await reserveCheckout(payload(first));
    vi.stubEnv('SETTLEMENTS_ENABLED', 'false');
    await expect(syncCheckoutSession(sessionFor(order))).rejects.toThrow('pausadas');
    expect(await prisma.booking.count({ where: { flightId } })).toBe(0);
  });
});
