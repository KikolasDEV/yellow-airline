import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_DEMO_SEED !== 'true' || !['development', 'staging', 'test'].includes(process.env.APP_ENV ?? '')) {
    throw new Error('Seed legacy bloqueado. Usa web/ para nuevos datos demo; nunca seedear produccion.');
  }
  const departureTime = new Date(Date.now() + 7 * 86400000);
  const existing = await prisma.flight.findFirst({
    where: { origin: 'Madrid', destination: 'Barcelona', departureTime: { gt: new Date() } },
  });
  if (!existing) await prisma.flight.create({ data: { origin: 'Madrid', destination: 'Barcelona', departureTime, price: 45.99, capacity: 180 } });
  console.log('Seed no destructivo completado.');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Seed failed');
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
