import jwt from 'jsonwebtoken';
import type { SessionUser } from '@/types/auth';
import { env } from './env';

export const SESSION_COOKIE_NAME = 'yellow_airline_session';

export const signSessionToken = (payload: SessionUser) => {
  return jwt.sign(payload, env.jwtSecret(), { expiresIn: '8h' });
};

export const verifySessionToken = (token: string) => {
  return jwt.verify(token, env.jwtSecret()) as SessionUser;
};
