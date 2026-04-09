import { prisma } from '@/lib/prisma';

export const getMyBookings = async (userId: number) => {
  return prisma.booking.findMany({
    where: { userId },
    include: { flight: true },
    orderBy: { createdAt: 'desc' },
  });
};
