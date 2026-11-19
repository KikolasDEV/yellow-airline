import { randomBytes } from 'node:crypto';
import type Stripe from 'stripe';
import type { CheckoutOrder, Prisma } from '@prisma/client';
import { getStripeClient } from '@/lib/stripe';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { calculatePricingSnapshot } from '@/lib/pricing';
import { calculateSeatSupplement } from '@/lib/seats';
import type { CheckoutPayload } from './payments.schemas';

export class CheckoutError extends Error {
  constructor(message: string, public status = 409) { super(message); }
}

export const ACTIVE_ORDER_STATES = ['CREATING', 'OPEN', 'REVIEW'];

const lockFlight = (tx: Prisma.TransactionClient, flightId: number) =>
  tx.$queryRaw`SELECT "id" FROM "Flight" WHERE "id" = ${flightId} FOR UPDATE`;

const stripeClient = () => {
  const stripe = getStripeClient();
  if (!stripe) throw new CheckoutError('Pagos no configurados.', 503);
  return stripe;
};

export const reserveCheckout = async (payload: CheckoutPayload & { userId: number }) => {
  if (!env.paymentsEnabled() || !env.writesEnabled() || !env.settlementsEnabled()) throw new CheckoutError('Reservas temporalmente pausadas.', 503);
  return prisma.$transaction(async (tx) => {
    await lockFlight(tx, payload.flightId);
    const flight = await tx.flight.findUnique({ where: { id: payload.flightId } });
    if (!flight || flight.departureTime <= new Date(Date.now() + 60 * 60 * 1000)) {
      throw new CheckoutError('Vuelo no disponible.', 400);
    }
    const booked = await tx.booking.findUnique({ where: { userId_flightId: { userId: payload.userId, flightId: flight.id } } });
    if (booked) throw new CheckoutError('Ya existe una reserva para este vuelo.');

    const active = await tx.checkoutOrder.findFirst({
      where: { userId: payload.userId, flightId: flight.id, status: { in: ACTIVE_ORDER_STATES } },
    });
    if (active) {
      if (active.status === 'REVIEW') throw new CheckoutError('Esta compra necesita revision. Contacta con soporte.');
      // A repeated click resumes the same immutable purchase, never creates another charge.
      return active;
    }
    const paid = await tx.booking.aggregate({
      where: { flightId: flight.id, status: 'PAID' }, _sum: { adults: true, children: true },
    });
    const held = await tx.checkoutOrder.aggregate({
      where: { flightId: flight.id, status: { in: ACTIVE_ORDER_STATES } }, _sum: { adults: true, children: true },
    });
    const occupied = (paid._sum.adults ?? 0) + (paid._sum.children ?? 0);
    const reserved = (held._sum.adults ?? 0) + (held._sum.children ?? 0);
    const requested = payload.adults + payload.children;
    if (occupied + reserved + requested > flight.capacity) throw new CheckoutError('No quedan suficientes plazas.');
    const seatAmount = calculateSeatSupplement(flight.capacity, payload.selectedSeats);
    const conflicts = await tx.flightSeat.count({ where: { flightId: flight.id, number: { in: payload.selectedSeats } } });
    if (conflicts) throw new CheckoutError('Algun asiento ya no esta disponible.');

    // Do not allocate an explicitly numbered historical seat a second time.
    const historical = await tx.booking.findMany({
      where: { flightId: flight.id, status: 'PAID' }, select: { seatNumber: true, selectedSeats: true },
    });
    if (historical.some((booking) =>
      [...booking.selectedSeats, ...(booking.seatNumber ? [booking.seatNumber] : [])]
        .some((seat) => payload.selectedSeats.includes(seat)))) throw new CheckoutError('Asiento ocupado.');

    const pricing = calculatePricingSnapshot({ basePrice: flight.price, occupiedSeats: occupied, capacity: flight.capacity, departureTime: flight.departureTime });
    const unitAmount = Math.round(pricing.finalPrice * 100);
    const order = await tx.checkoutOrder.create({
      data: {
        userId: payload.userId, flightId: flight.id, adults: payload.adults, children: payload.children, infants: payload.infants,
        selectedSeats: payload.selectedSeats, basePrice: pricing.basePrice, unitAmount, seatAmount,
        amountTotal: unitAmount * requested + seatAmount, appUrl: env.appUrl(), environment: env.environment(),
        expiresAt: new Date(Math.floor(Date.now() / 1000) * 1000 + 35 * 60 * 1000),
      },
    });
    await tx.flightSeat.createMany({ data: payload.selectedSeats.map((number) => ({ flightId: flight.id, number, orderId: order.id })) });
    return order;
  }, { maxWait: 10000, timeout: 15000 });
};

export const belongsToThisApp = (session: Stripe.Checkout.Session) =>
  session.metadata?.app === 'yellow-airline-web' && session.metadata.environment === env.environment();

export const validatePaidSession = (session: Stripe.Checkout.Session, order: CheckoutOrder) =>
  session.mode === 'payment' && session.payment_status === 'paid'
  && session.amount_total === order.amountTotal && session.currency === order.currency
  && session.metadata?.orderId === order.id && belongsToThisApp(session)
  && order.environment === env.environment()
  && session.livemode === (order.environment === 'production')
  && (!order.stripeSessionId || order.stripeSessionId === session.id);

export const syncCheckoutSession = async (session: Stripe.Checkout.Session) => {
  if (!belongsToThisApp(session)) return;
  if (!env.settlementsEnabled()) throw new CheckoutError('Confirmaciones pausadas para mantenimiento.', 503);
  const orderId = session.metadata?.orderId;
  if (!orderId) throw new CheckoutError('Falta referencia de compra.', 400);
  const order = await prisma.checkoutOrder.findUnique({ where: { id: orderId } });
  if (!order) throw new CheckoutError('Compra no encontrada.', 503);
  if (order.environment !== env.environment() || session.livemode !== (order.environment === 'production')) {
    throw new CheckoutError('Entorno de compra incorrecto.', 400);
  }
  const review = await prisma.$transaction(async (tx) => {
    await lockFlight(tx, order.flightId);
    const current = await tx.checkoutOrder.findUniqueOrThrow({ where: { id: order.id } });
    if (current.status === 'PAID') {
      if (current.stripeSessionId !== session.id) throw new CheckoutError('Sesion duplicada: requiere conciliacion.', 500);
      return false;
    }
    if (current.status === 'REVIEW') return true;
    if (session.status === 'expired' && session.payment_status !== 'paid') {
      if (current.stripeSessionId && current.stripeSessionId !== session.id) throw new CheckoutError('Sesion incorrecta.', 400);
      await tx.flightSeat.deleteMany({ where: { orderId: order.id } });
      await tx.checkoutOrder.update({ where: { id: order.id }, data: { status: 'EXPIRED', stripeSessionId: session.id } });
      return false;
    }
    if (session.payment_status !== 'paid') {
      if (session.status === 'open' && current.status === 'CREATING' && !current.stripeSessionId
        && session.mode === 'payment' && session.amount_total === current.amountTotal && session.currency === current.currency) {
        await tx.checkoutOrder.update({
          where: { id: current.id }, data: { status: 'OPEN', stripeSessionId: session.id },
        });
      }
      return false;
    }
    const duplicate = await tx.booking.findUnique({ where: { userId_flightId: { userId: current.userId, flightId: current.flightId } } });
    if (!validatePaidSession(session, current) || current.status === 'EXPIRED' || duplicate) {
      await tx.checkoutOrder.update({ where: { id: order.id }, data: { status: 'REVIEW' } });
      return true;
    }
    const occupied = await tx.booking.aggregate({
      where: { flightId: current.flightId, status: 'PAID' }, _sum: { adults: true, children: true },
    });
    const flight = await tx.flight.findUniqueOrThrow({ where: { id: current.flightId } });
    if ((occupied._sum.adults ?? 0) + (occupied._sum.children ?? 0) + current.adults + current.children > flight.capacity) {
      await tx.checkoutOrder.update({ where: { id: order.id }, data: { status: 'REVIEW' } });
      return true;
    }
    const booking = await tx.booking.create({
      data: {
        userId: current.userId, flightId: current.flightId, adults: current.adults, children: current.children, infants: current.infants,
        basePrice: current.basePrice, finalPrice: current.unitAmount / 100, currency: current.currency, totalAmount: current.amountTotal,
        status: 'PAID', bookingReference: `YA-${randomBytes(10).toString('hex').toUpperCase()}`,
        stripeSessionId: session.id, selectedSeats: current.selectedSeats,
      },
    });
    await tx.checkoutOrder.update({
      where: { id: order.id }, data: { status: 'PAID', stripeSessionId: session.id, bookingId: booking.id },
    });
    return false;
  }, { maxWait: 10000, timeout: 15000 });
  if (review) {
    console.error('checkout_requires_review', { orderId: order.id, sessionId: session.id });
    throw new CheckoutError('Compra en revision. No repitas el pago.', 503);
  }
};

export const createCheckoutSession = async (payload: CheckoutPayload & { userId: number }) => {
  const stripe = stripeClient();
  const order = await reserveCheckout(payload);
  let session: Stripe.Checkout.Session;
  if (order.stripeSessionId) {
    session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
  } else {
    // Do not issue a new charge when an earlier create had an ambiguous network failure.
    if (order.expiresAt.getTime() <= Date.now() + 30 * 60 * 1000) {
      throw new CheckoutError('Compra pendiente de conciliacion. Intentalo mas tarde.', 503);
    }
    const flight = await prisma.flight.findUniqueOrThrow({ where: { id: order.flightId } });
    session = await stripe.checkout.sessions.create({
      mode: 'payment', payment_method_types: ['card'], expires_at: Math.floor(order.expiresAt.getTime() / 1000),
      line_items: [{
        price_data: { currency: order.currency, product_data: { name: `Yellow Airline · ${flight.origin} → ${flight.destination}` }, unit_amount: order.amountTotal },
        quantity: 1,
      }],
      success_url: `${order.appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${order.appUrl}/cancel?session_id={CHECKOUT_SESSION_ID}`,
      client_reference_id: order.id,
      metadata: { app: 'yellow-airline-web', environment: order.environment, orderId: order.id },
    }, { idempotencyKey: `checkout:${order.id}` });
    // Webhook may have already fulfilled the order. Never overwrite its state.
    await prisma.checkoutOrder.updateMany({
      where: { id: order.id, status: 'CREATING' }, data: { status: 'OPEN', stripeSessionId: session.id },
    });
  }
  await syncCheckoutSession(session);
  if (session.status !== 'open' || !session.url) throw new CheckoutError('Compra finalizada o expirada. Consulta tus reservas.');
  return { checkoutUrl: session.url, sessionId: session.id, amountTotal: order.amountTotal, currency: order.currency, unitPrice: order.unitAmount / 100, selectedSeats: order.selectedSeats };
};

export const handleStripeWebhook = async (rawBody: string, signature: string) => {
  const stripe = stripeClient();
  const secret = env.stripeWebhookSecret();
  if (!secret) throw new CheckoutError('Webhook no configurado.', 503);
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(rawBody, signature, secret); }
  catch { throw new CheckoutError('Firma de Stripe invalida.', 400); }
  if (['checkout.session.completed', 'checkout.session.expired', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
    await syncCheckoutSession(event.data.object as Stripe.Checkout.Session);
  }
  return { received: true };
};

export const getOwnedSession = async (sessionId: string, userId: number) => {
  if (!/^cs_(test_|live_)?[A-Za-z0-9_]{8,250}$/.test(sessionId)) throw new CheckoutError('Sesion no valida.', 400);
  const order = await prisma.checkoutOrder.findFirst({ where: { stripeSessionId: sessionId, userId } });
  // Support historical paid reservations, but never adopt an unowned Stripe session.
  if (!order) {
    const booking = await prisma.booking.findFirst({ where: { stripeSessionId: sessionId, userId, status: 'PAID' } });
    if (booking) return { status: 'PAID', bookingReference: booking.bookingReference };
    throw new CheckoutError('Compra no encontrada.', 404);
  }
  if (env.settlementsEnabled()) await syncCheckoutSession(await stripeClient().checkout.sessions.retrieve(sessionId));
  const updated = await prisma.checkoutOrder.findUniqueOrThrow({ where: { id: order.id }, include: { booking: true } });
  return { status: updated.status, bookingReference: updated.booking?.bookingReference ?? null };
};

export const expireOwnedSession = async (sessionId: string, userId: number) => {
  const order = await prisma.checkoutOrder.findFirst({ where: { stripeSessionId: sessionId, userId } });
  if (!order) throw new CheckoutError('Compra no encontrada.', 404);
  const stripe = stripeClient();
  let session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.status === 'open') session = await stripe.checkout.sessions.expire(sessionId);
  await syncCheckoutSession(session);
  return { status: session.status };
};
