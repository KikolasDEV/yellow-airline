import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  calculateCurrentSeats,
  calculateRequestedSeats,
  hasDuplicateBooking,
  hasEnoughCapacity,
  normalizeFlightId,
  normalizePassengerCount,
} from '../lib/bookingRules.js';

const router = Router();

router.get('/my-bookings', authenticateToken, async (req: any, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      include: { flight: true } // Traemos la info del vuelo asociada
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tus reservas" });
  }
});

// POST: Crear una reserva (Solo usuarios logueados)
router.post('/', authenticateToken, async (req: any, res) => {
  const { flightId, adults, children, infants } = req.body;
  const normalizedFlightId = normalizeFlightId(Number(flightId));
  const userId = req.user.userId;

  try {
    // 1. Verificar si ya tiene ESTE vuelo (Evitar duplicados)
    const existingBooking = await prisma.booking.findUnique({
      where: { userId_flightId: { userId, flightId: normalizedFlightId } }
    });

    if (hasDuplicateBooking(existingBooking)) {
      return res.status(400).json({ error: "Ya tienes una reserva para este vuelo." });
    }

    // 2. Verificar disponibilidad de asientos
    const flight = await prisma.flight.findUnique({
      where: { id: normalizedFlightId },
      include: { _count: { select: { bookings: true } } } // Esto es ultra eficiente
    });

    const totalOccupied = await prisma.booking.aggregate({
      where: { flightId: normalizedFlightId },
      _sum: { adults: true, children: true }
    });

    const currentSeats = calculateCurrentSeats(totalOccupied._sum.adults || 0, totalOccupied._sum.children || 0);
    const requestedSeats = calculateRequestedSeats(Number(adults), Number(children));
    const normalizedAdults = normalizePassengerCount(Number(adults));
    const normalizedChildren = normalizePassengerCount(Number(children));
    const normalizedInfants = normalizePassengerCount(Number(infants));

    if (!hasEnoughCapacity({
      currentSeats,
      requestedSeats,
      capacity: flight?.capacity || 0,
    })) {
      return res.status(400).json({ error: "Vuelo completo. No hay suficientes asientos." });
    }

    // 3. Crear reserva con desglose
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        flightId: normalizedFlightId,
        adults: normalizedAdults,
        children: normalizedChildren,
        infants: normalizedInfants,
      }
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: "Error al procesar la reserva" });
  }
});

export default router;
