import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// POST: Registrar nuevo usuario
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: { name, email, password }
    });
    res.status(201).json({ message: "Usuario VIP registrado", user: newUser });
  } catch (error) {
    res.status(400).json({ error: "El email ya está registrado" });
  }
});

export default router;