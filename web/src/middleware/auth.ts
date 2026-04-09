import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/jwt';

export const getSessionUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return verifySessionToken(token);
  } catch {
    return null;
  }
};

export const requireSessionUser = async () => {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    throw new Error('UNAUTHORIZED');
  }

  return sessionUser;
};
