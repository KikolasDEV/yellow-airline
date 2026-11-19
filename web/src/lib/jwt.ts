import jwt from 'jsonwebtoken';
import type { SessionUser } from '@/types/auth';
import { env } from './env';
import { z } from 'zod';

export const SESSION_COOKIE_NAME = 'yellow_airline_session';

export const signSessionToken = (payload: SessionUser) => {
  const secret = env.jwtSecret();
  if (secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  return jwt.sign(payload, secret, { expiresIn: '8h', algorithm: 'HS256', issuer: 'yellow-airline-web', audience: env.environment() });
};

export const verifySessionToken = (token: string) => {
  const payload = jwt.verify(token, env.jwtSecret(), {
    algorithms: ['HS256'], issuer: 'yellow-airline-web', audience: env.environment(),
  });
  return z.object({ userId: z.number().int().positive(), email: z.string().email(), isVip: z.boolean() }).parse(payload);
};
