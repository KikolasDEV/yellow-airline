import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import { SESSION_COOKIE_NAME } from '@/lib/jwt';
import { getSessionUser } from '@/middleware/auth';
import { parseJsonBody } from '@/utils/http';
import { jsonError, jsonOk } from '@/utils/responses';
import { loginSchema, registerSchema } from './auth.schemas';
import { loginUser, registerUser } from './auth.service';

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.isProduction(),
  path: '/',
  maxAge: 60 * 60 * 8,
};

export const loginController = async (request: Request) => {
  const body = await parseJsonBody<unknown>(request);
  const parsedBody = loginSchema.safeParse(body);

  if (!parsedBody.success) {
    return jsonError('Invalid login payload.', 400, parsedBody.error.flatten());
  }

  try {
    const session = await loginUser(parsedBody.data);

    if (!session) {
      return jsonError('Credenciales incorrectas', 401);
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.token, sessionCookieOptions);

    return jsonOk({
      message: 'Bienvenido de nuevo',
      user: session.user,
    });
  } catch {
    return jsonError('Error al iniciar sesion', 500);
  }
};

export const registerController = async (request: Request) => {
  const body = await parseJsonBody<unknown>(request);
  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    return jsonError('Invalid register payload.', 400, parsedBody.error.flatten());
  }

  try {
    const user = await registerUser(parsedBody.data);

    if (!user) {
      return jsonError('El correo ya esta registrado', 400);
    }

    return jsonOk({
      message: `Bienvenido a bordo, ${user.name}!`,
      user,
    }, { status: 201 });
  } catch {
    return jsonError('Error en el servidor al registrar', 500);
  }
};

export const logoutController = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  return jsonOk({ message: 'Sesion cerrada.' });
};

export const sessionController = async () => {
  const user = await getSessionUser();
  return jsonOk({ user });
};
