import { prisma } from '@/lib/prisma';
import { calculateOccupiedSeats, calculatePricingSnapshot } from '@/lib/pricing';
import { ACTIVE_ORDER_STATES } from '@/modules/payments/payments.service';

export const listFlights = async ({ origin, destination, date }: { origin?: string; destination?: string; date?: string }) => {
  const now = new Date();
  const start = date ? new Date(`${date}T00:00:00Z`) : now;
  const end = date ? new Date(start.getTime() + 86400000) : undefined;
  const flights = await prisma.flight.findMany({
    where: {
      origin: origin ? { contains: origin, mode: 'insensitive' } : undefined,
      destination: destination ? { contains: destination, mode: 'insensitive' } : undefined,
      departureTime: { gt: now, gte: start, ...(end ? { lt: end } : {}) },
    },
    orderBy: { departureTime: 'asc' },
    take: 200,
  });

  const occupiedSeatsByFlight = await prisma.booking.groupBy({
    by: ['flightId'],
    where: { status: 'PAID', flightId: { in: flights.map((flight) => flight.id) } },
    _sum: {
      adults: true,
      children: true,
    },
  });
  const held = await prisma.checkoutOrder.groupBy({
    by: ['flightId'],
    where: { flightId: { in: flights.map((flight) => flight.id) }, status: { in: ACTIVE_ORDER_STATES } },
    _sum: { adults: true, children: true },
  });
  const holds = new Map(held.map((entry) => [entry.flightId, (entry._sum.adults ?? 0) + (entry._sum.children ?? 0)]));

  const occupancyMap = new Map(
    occupiedSeatsByFlight.map((entry) => {
      const occupiedSeats = calculateOccupiedSeats({
        adults: entry._sum.adults || 0,
        children: entry._sum.children || 0,
      });

      return [entry.flightId, occupiedSeats] as const;
    }),
  );

  return flights.map((flight) => {
    const occupiedSeats = occupancyMap.get(flight.id) || 0;
    const pricingSnapshot = calculatePricingSnapshot({
      basePrice: flight.price,
      occupiedSeats,
      capacity: flight.capacity,
      departureTime: flight.departureTime,
    });

    return {
      ...flight,
      ...pricingSnapshot,
      availableSeats: Math.max(0, pricingSnapshot.availableSeats - (holds.get(flight.id) ?? 0)),
    };
  });
};
