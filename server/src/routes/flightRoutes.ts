import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET: Obtener todos los vuelos de la DB
router.get('/', async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      orderBy: { departureTime: 'asc' } // Los ordenamos por hora de salida
    });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener vuelos" });
  }
});

// POST: Crear un nuevo vuelo
router.post('/', async (req, res) => {
  const { number, origin, destination, departureTime, price } = req.body;
  
  try {
    const newFlight = await prisma.flight.create({
      data: {
        number,
        origin,
        destination,
        departureTime: new Date(departureTime),
        price: parseFloat(price)
      }
    });
    res.status(201).json(newFlight);
  } catch (error) {
    res.status(400).json({ error: "No se pudo crear el vuelo. Revisa los datos." });
  }
});

export default router;