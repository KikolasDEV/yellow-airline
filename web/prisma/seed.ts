import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_DEMO_SEED !== 'true' || !['development', 'staging', 'test'].includes(process.env.APP_ENV ?? '')) {
    throw new Error('Seed bloqueado. Solo entornos no productivos con ALLOW_DEMO_SEED=true.');
  }
  const routes = [
    { origin: 'Madrid', destination: 'Barcelona', price: 45.99 },
    { origin: 'Madrid', destination: 'Paris', price: 99.99 },
    { origin: 'Barcelona', destination: 'Roma', price: 89.50 },
    { origin: 'Sevilla', destination: 'Londres', price: 120 },
  ];
  for (const [index, route] of routes.entries()) {
    const existing = await prisma.flight.findFirst({
      where: { origin: route.origin, destination: route.destination, departureTime: { gt: new Date() } },
    });
    if (existing) continue;
    const departureTime = new Date();
    departureTime.setUTCDate(departureTime.getUTCDate() + 7 + index);
    departureTime.setUTCHours(10, 0, 0, 0);
    await prisma.flight.create({ data: { ...route, departureTime, capacity: 180 } });
  }
  const password = process.env.DEMO_USER_PASSWORD;
  if (password) {
    if (password.length < 10 || Buffer.byteLength(password) > 72) throw new Error('DEMO_USER_PASSWORD no valida');
    await prisma.user.upsert({
      where: { email: 'demo@example.invalid' }, update: {},
      create: { name: 'Demo Traveller', email: 'demo@example.invalid', passport: 'DEMO-ONLY', password: await bcrypt.hash(password, 12) },
    });
  }
  console.log('Datos demo añadidos sin borrar ni reemplazar datos existentes.');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
