import { prisma } from '@/lib/prisma';
import { calculateOccupiedSeats, calculatePricingSnapshot } from '@/lib/pricing';

export const listFlights = async ({ origin, destination }: { origin?: string; destination?: string }) => {
  const flights = await prisma.flight.findMany({
    where: {
      origin: origin ? { contains: origin, mode: 'insensitive' } : undefined,
      destination: destination ? { contains: destination, mode: 'insensitive' } : undefined,
    },
    orderBy: { departureTime: 'asc' },
  });

  const occupiedSeatsByFlight = await prisma.booking.groupBy({
    by: ['flightId'],
    where: { status: 'PAID' },
    _sum: {
      adults: true,
      children: true,
    },
  });

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
    };
  });
};
