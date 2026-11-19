import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().max(254).email(),
  password: z.string().min(1).max(72),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().max(254).email(),
  passport: z.string().trim().min(5).max(30),
  password: z.string().min(10).max(72).refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Maximum 72 UTF-8 bytes'),
});
