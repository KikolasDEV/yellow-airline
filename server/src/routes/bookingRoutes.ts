import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST: Crear una reserva (Solo usuarios logueados)
router.post('/', authenticateToken, async (req: any, res) => {
  const { flightId } = req.body;
  const userId = req.user.userId; // Extraído del JWT por el middleware

  try {
    const booking = await prisma.booking.create({
      data: {
        userId: Number(userId),
        flightId: Number(flightId)
      },
      include: { flight: true } // Para devolver info del vuelo reservado
    });
    res.status(201).json({ message: "¡Reserva confirmada!", booking });
  } catch (error) {
    res.status(500).json({ error: "Error al procesar la reserva" });
  }
});

export default router;