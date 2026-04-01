import { PrismaClient } from '@prisma/client';
// Usamos una constante global para evitar múltiples conexiones en desarrollo
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
//# sourceMappingURL=prisma.js.map