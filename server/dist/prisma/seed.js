import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('✈️ Iniciando el seeding de Yellow Airline...');
    // 1. Limpiamos datos para evitar conflictos de IDs o Unique constraints
    // Es importante borrar primero Bookings si existen por la integridad referencial
    await prisma.booking.deleteMany();
    await prisma.flight.deleteMany();
    // 2. Lista de vuelos sin el campo 'number' y añadiendo 'capacity'
    const flights = [
        { origin: 'Madrid', destination: 'Barcelona', departureTime: new Date('2026-05-10T10:00:00Z'), price: 45.99, capacity: 180 },
        { origin: 'Barcelona', destination: 'Paris', departureTime: new Date('2026-05-10T15:30:00Z'), price: 89.50, capacity: 180 },
        { origin: 'Sevilla', destination: 'Londres', departureTime: new Date('2026-05-11T08:00:00Z'), price: 120.00, capacity: 150 },
        { origin: 'Madrid', destination: 'Roma', departureTime: new Date('2026-05-12T12:00:00Z'), price: 65.25, capacity: 180 },
        { origin: 'Valencia', destination: 'Berlín', departureTime: new Date('2026-05-13T18:45:00Z'), price: 95.00, capacity: 180 },
        { origin: 'Madrid', destination: 'Tokio', departureTime: new Date('2026-06-01T22:00:00Z'), price: 550.00, capacity: 300 }, // Avión más grande para largo radio
    ];
    for (const flight of flights) {
        await prisma.flight.create({ data: flight });
    }
    console.log(`✅ Seeding completado: ${flights.length} vuelos creados.`);
}
main()
    .catch((e) => {
    console.error("❌ Error en el seeding:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map