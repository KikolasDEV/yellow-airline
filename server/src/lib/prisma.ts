import { PrismaClient } from '@prisma/client';

// PROBANDO WORKFLOW RELEASE-NOTES
// Usamos una constante global para evitar múltiples conexiones en desarrollo
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
