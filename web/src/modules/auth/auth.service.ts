import { comparePassword, hashPassword } from '@/lib/bcrypt';
import { signSessionToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import type { LoginPayload, RegisterPayload, SessionUser } from '@/types/auth';

export const loginUser = async ({ email, password }: LoginPayload) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return null;
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  const sessionUser: SessionUser = {
    userId: user.id,
    email: user.email,
    isVip: user.isVip,
  };

  return {
    token: signSessionToken(sessionUser),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isVip: user.isVip,
    },
  };
};

export const registerUser = async ({ name, email, passport, password }: RegisterPayload) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return null;
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passport,
      password: hashedPassword,
      isVip: true,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isVip: user.isVip,
  };
};

export const getSessionUserDetails = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isVip: true,
    },
  });

  return user;
};
