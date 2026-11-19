import { prisma } from '@/lib/prisma';
import { createSeatLayout } from '@/lib/seats';
import { jsonError, jsonOk } from '@/utils/responses';

export async function GET(request: Request) {
  const flightId = Number(new URL(request.url).searchParams.get('flightId'));
  if (!Number.isSafeInteger(flightId) || flightId < 1) return jsonError('Vuelo no valido.', 400);
  try {
    const flight = await prisma.flight.findUnique({ where: { id: flightId } });
    if (!flight) return jsonError('Vuelo no encontrado.', 404);
    const claims = await prisma.flightSeat.findMany({ where: { flightId }, select: { number: true } });
    const historical = await prisma.booking.findMany({
      where: { flightId, status: 'PAID' }, select: { seatNumber: true, selectedSeats: true },
    });
    const occupied = new Set([
      ...claims.map((seat) => seat.number),
      ...historical.flatMap((booking) => [...booking.selectedSeats, ...(booking.seatNumber ? [booking.seatNumber] : [])]),
    ]);
    return jsonOk(createSeatLayout(flight.capacity).map((seat) => ({ ...seat, available: !occupied.has(seat.number) })));
  } catch { return jsonError('No se pudo cargar la disponibilidad.', 503); }
}
