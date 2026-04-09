import { Prisma } from '@prisma/client';
import { getStripeClient } from '@/lib/stripe';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import {
  calculateCurrentSeats,
  calculateRequestedSeats,
  hasDuplicateBooking,
  hasEnoughCapacity,
  normalizeFlightId,
  normalizePassengerCount,
} from '@/lib/booking-rules';
import { calculatePricingSnapshot } from '@/lib/pricing';

export const createCheckoutSession = async ({
  flightId,
  adults,
  children,
  infants,
  userId,
}: {
  flightId: number;
  adults: number;
  children: number;
  infants: number;
  userId: number;
}) => {
  const normalizedFlightId = normalizeFlightId(flightId);
  const normalizedAdults = normalizePassengerCount(adults);
  const normalizedChildren = normalizePassengerCount(children);
  const normalizedInfants = normalizePassengerCount(infants);
  const requestedSeats = calculateRequestedSeats(normalizedAdults, normalizedChildren);
  const stripe = getStripeClient();

  if (!stripe) {
    return { error: 'Stripe no esta configurado en el servidor.', status: 500 } as const;
  }

  if (normalizedFlightId < 1) {
    return { error: 'Identificador de vuelo no valido.', status: 400 } as const;
  }

  if (requestedSeats < 1) {
    return { error: 'Debes reservar al menos un asiento (adulto o nino).', status: 400 } as const;
  }

  const existingBooking = await prisma.booking.findUnique({
    where: { userId_flightId: { userId, flightId: normalizedFlightId } },
  });

  if (hasDuplicateBooking(existingBooking)) {
    return { error: 'Ya tienes una reserva para este vuelo.', status: 400 } as const;
  }

  const flight = await prisma.flight.findUnique({
    where: { id: normalizedFlightId },
  });

  if (!flight) {
    return { error: 'Vuelo no encontrado.', status: 404 } as const;
  }

  const totalOccupied = await prisma.booking.aggregate({
    where: { flightId: normalizedFlightId, status: 'PAID' },
    _sum: { adults: true, children: true },
  });

  const currentSeats = calculateCurrentSeats(totalOccupied._sum.adults || 0, totalOccupied._sum.children || 0);

  if (!hasEnoughCapacity({ currentSeats, requestedSeats, capacity: flight.capacity })) {
    return { error: 'Vuelo completo. No hay suficientes asientos.', status: 400 } as const;
  }

  const pricingSnapshot = calculatePricingSnapshot({
    basePrice: flight.price,
    occupiedSeats: currentSeats,
    capacity: flight.capacity,
    departureTime: flight.departureTime,
  });

  const amountTotal = Math.round(pricingSnapshot.finalPrice * requestedSeats * 100);
  const appUrl = env.appUrl();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Yellow Airline · ${flight.origin} -> ${flight.destination}`,
            description: `${requestedSeats} pasajero(s) con asiento`,
          },
          unit_amount: Math.round(pricingSnapshot.finalPrice * 100),
        },
        quantity: requestedSeats,
      },
    ],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cancel`,
    metadata: {
      userId: String(userId),
      flightId: String(normalizedFlightId),
      adults: String(normalizedAdults),
      children: String(normalizedChildren),
      infants: String(normalizedInfants),
      basePrice: String(pricingSnapshot.basePrice),
      finalPrice: String(pricingSnapshot.finalPrice),
      currency: 'eur',
    },
  });

  return {
    checkoutUrl: checkoutSession.url,
    sessionId: checkoutSession.id,
    amountTotal,
    currency: 'eur',
    unitPrice: pricingSnapshot.finalPrice,
  } as const;
};

const createBookingReference = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let value = 'YA-';

  for (let index = 0; index < 8; index += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    value += alphabet[randomIndex];
  }

  return value;
};

const parseMetadataNumber = (metadata: Record<string, string> | null | undefined, key: string) => {
  const rawValue = metadata?.[key];

  if (!rawValue) {
    return null;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
};

export const handleStripeWebhook = async (rawBody: string, signature: string) => {
  const stripe = getStripeClient();
  const webhookSecret = env.stripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return { error: 'Stripe webhook no configurado.', status: 500 } as const;
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return { error: 'No se pudo validar el webhook de Stripe.', status: 400 } as const;
  }

  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.expired') {
    return { received: true } as const;
  }

  if (event.type === 'checkout.session.expired') {
    return { received: true } as const;
  }

  const session = event.data.object;

  if (session.payment_status !== 'paid') {
    return { received: true } as const;
  }

  const existingBookingBySession = await prisma.booking.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existingBookingBySession) {
    return { received: true } as const;
  }

  const userId = parseMetadataNumber(session.metadata, 'userId');
  const flightId = parseMetadataNumber(session.metadata, 'flightId');
  const adults = parseMetadataNumber(session.metadata, 'adults') || 0;
  const children = parseMetadataNumber(session.metadata, 'children') || 0;
  const infants = parseMetadataNumber(session.metadata, 'infants') || 0;
  const basePrice = parseMetadataNumber(session.metadata, 'basePrice') || 0;
  const finalPrice = parseMetadataNumber(session.metadata, 'finalPrice') || 0;
  const currency = session.metadata?.currency || 'eur';

  if (!userId || !flightId) {
    return { error: 'Metadata incompleta para crear reserva.', status: 400 } as const;
  }

  const existingBookingByRoute = await prisma.booking.findUnique({
    where: {
      userId_flightId: {
        userId,
        flightId,
      },
    },
  });

  if (existingBookingByRoute) {
    return { received: true } as const;
  }

  let reservationCreated = false;

  for (let attempt = 0; attempt < 3 && !reservationCreated; attempt += 1) {
    try {
      await prisma.booking.create({
        data: {
          userId,
          flightId,
          adults,
          children,
          infants,
          basePrice,
          finalPrice,
          currency,
          status: 'PAID',
          bookingReference: createBookingReference(),
          stripeSessionId: session.id,
        },
      });

      reservationCreated = true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        continue;
      }

      throw error;
    }
  }

  if (!reservationCreated) {
    return { error: 'No se pudo asignar un localizador unico.', status: 500 } as const;
  }

  return { received: true } as const;
};
