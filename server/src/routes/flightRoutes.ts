import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { calculateOccupiedSeats, calculatePricingSnapshot } from '../lib/pricing.js';

const router = Router();

// GET: Obtener vuelos con filtros opcionales
router.get('/', async (req, res) => {
  const { origin, destination } = req.query;

  try {
    const flights = await prisma.flight.findMany({
      where: {
        // Si existe el parámetro, filtra; si no, trae todos
        origin: origin ? { contains: String(origin), mode: 'insensitive' } : undefined,
        destination: destination ? { contains: String(destination), mode: 'insensitive' } : undefined,
      },
      orderBy: { departureTime: 'asc' }
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
      })
    );

    const flightsWithDynamicPricing = flights.map((flight) => {
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

    res.json(flightsWithDynamicPricing);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar vuelos" });
  }
});

// POST: Crear un nuevo vuelo
router.post('/', async (req, res) => {
  const { origin, destination, departureTime, price, capacity } = req.body;
  
  try {
    const newFlight = await prisma.flight.create({
      data: {
        origin,
        destination,
        departureTime: new Date(departureTime),
        price: parseFloat(price),
        capacity: capacity ? Number(capacity) : 180,
      }
    });
    res.status(201).json(newFlight);
  } catch (error) {
    res.status(400).json({ error: "No se pudo crear el vuelo. Revisa los datos." });
  }
});

// UPDATE: Editar un vuelo existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { origin, destination, departureTime, price, capacity } = req.body;

  try {
    const updatedFlight = await prisma.flight.update({
      where: { id: Number(id) },
      data: {
        origin,
        destination,
        departureTime: departureTime ? new Date(departureTime) : undefined,
        price: price ? parseFloat(price) : undefined,
        capacity: capacity ? Number(capacity) : undefined,
      }
    });
    res.json(updatedFlight);
  } catch (error) {
    res.status(404).json({ error: "Vuelo no encontrado o datos inválidos" });
  }
});

// DELETE: Cancelar/Eliminar un vuelo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.flight.delete({
      where: { id: Number(id) }
    });
    res.status(204).send(); // 204 significa "Éxito, pero no hay contenido que devolver"
  } catch (error) {
    res.status(404).json({ error: "No se pudo eliminar el vuelo. ¿Ya fue eliminado?" });
  }
});

export default router;
