import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'llave-secreta-ultra-segura';

// POST: /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscamos al usuario por su email único
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // 2. Comparamos la contraseña plana con el Hash guardado
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // 3. Generamos el Pase de Abordar Digital (JWT)
    const token = jwt.sign(
      { userId: user.id, email: user.email, isVip: user.isVip },
      JWT_SECRET,
      { expiresIn: '8h' } // El token expira en 8 horas
    );

    // 4. Enviamos el token al cliente
    res.json({
      message: "¡Bienvenido de nuevo!",
      token,
      user: {
        name: user.name,
        email: user.email,
        isVip: user.isVip
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// POST: /api/users/register
router.post('/register', async (req, res) => {
  const { name, email, passport, password } = req.body;

  try {
    // 1. Verificar si el email ya está en uso
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // 2. Encriptar la contraseña (Salt = 10 es el estándar de la industria)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear el usuario con la contraseña protegida
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passport,
        password: hashedPassword,
        isVip: true // Por ahora todos son VIP en Yellow Airline
      }
    });

    res.status(201).json({ 
      message: `¡Bienvenido a bordo, ${newUser.name}!`,
      user: { id: newUser.id, name: newUser.name, email: newUser.email } 
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor al registrar" });
  }
});

export default router;