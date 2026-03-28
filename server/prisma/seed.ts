import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('✈️ Iniciando el seeding de Yellow Airline...');

  // 1. Limpiamos los datos existentes para no duplicar
  await prisma.flight.deleteMany();

  // 2. Creamos una lista de vuelos realistas
  const flights = [
    { number: 'YW-101', origin: 'Madrid', destination: 'Barcelona', departureTime: new Date('2026-05-10T10:00:00Z'), price: 45.99 },
    { number: 'YW-202', origin: 'Barcelona', destination: 'Paris', departureTime: new Date('2026-05-10T15:30:00Z'), price: 89.50 },
    { number: 'YW-303', origin: 'Sevilla', destination: 'Londres', departureTime: new Date('2026-05-11T08:00:00Z'), price: 120.00 },
    { number: 'YW-404', origin: 'Madrid', destination: 'Roma', departureTime: new Date('2026-05-12T12:00:00Z'), price: 65.25 },
    { number: 'YW-505', origin: 'Valencia', destination: 'Berlín', departureTime: new Date('2026-05-13T18:45:00Z'), price: 95.00 },
    { number: 'YW-606', origin: 'Madrid', destination: 'Tokio', departureTime: new Date('2026-06-01T22:00:00Z'), price: 550.00 },
  ];

  for (const flight of flights) {
    await prisma.flight.create({ data: flight });
  }

  console.log('✅ Seeding completado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });