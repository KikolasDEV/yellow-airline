import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });
config({ quiet: true });

async function main() {
  const { prisma } = await import('../src/lib/prisma');
  try {
    const [users, flights, bookings, totals, migrations, sequences, duplicateEmails, fingerprints] = await Promise.all([
      prisma.user.count(), prisma.flight.count(), prisma.booking.count(),
      prisma.$queryRaw`SELECT "status", COUNT(*)::int AS count,
        SUM(COALESCE((to_jsonb("Booking")->>'totalAmount')::numeric,
          ROUND("finalPrice"::numeric * 100) * ("adults" + "children")))::text AS total_cents
        FROM "Booking" GROUP BY "status" ORDER BY "status"`,
      prisma.$queryRaw<Array<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }>>`SELECT migration_name, finished_at, rolled_back_at
        FROM "_prisma_migrations" ORDER BY migration_name`,
      prisma.$queryRaw<Array<{ name: string; last_value: string; max_id: string }>>`SELECT 'User' AS name, last_value::text, (SELECT COALESCE(MAX(id), 0)::text FROM "User") AS max_id FROM "User_id_seq"
        UNION ALL SELECT 'Flight', last_value::text, (SELECT COALESCE(MAX(id), 0)::text FROM "Flight") FROM "Flight_id_seq"
        UNION ALL SELECT 'Booking', last_value::text, (SELECT COALESCE(MAX(id), 0)::text FROM "Booking") FROM "Booking_id_seq"`,
      prisma.$queryRaw<Array<{ groups: number }>>`SELECT COUNT(*)::int AS groups FROM
        (SELECT LOWER(email) FROM "User" GROUP BY LOWER(email) HAVING COUNT(*) > 1) duplicates`,
      prisma.$queryRaw`SELECT 'User' AS name,
        encode(sha256(convert_to(COALESCE(string_agg(row_to_json(r)::text, E'\n' ORDER BY r.id), ''), 'UTF8')), 'hex') AS digest
        FROM (SELECT id, name, email, passport, password, "isVip", "createdAt" FROM "User") r
        UNION ALL SELECT 'Flight',
        encode(sha256(convert_to(COALESCE(string_agg(row_to_json(r)::text, E'\n' ORDER BY r.id), ''), 'UTF8')), 'hex')
        FROM (SELECT id, origin, destination, "departureTime", price, capacity FROM "Flight") r
        UNION ALL SELECT 'Booking',
        encode(sha256(convert_to(COALESCE(string_agg(row_to_json(r)::text, E'\n' ORDER BY r.id), ''), 'UTF8')), 'hex')
        FROM (SELECT id, "userId", "flightId", adults, children, infants, "basePrice", "finalPrice", currency,
          status, "bookingReference", "stripeSessionId", "seatNumber", gate, "boardingGroup", "createdAt" FROM "Booking") r`,
    ]);
    // Counts and aggregates only. No credentials or personal records.
    console.log(JSON.stringify({ users, flights, bookings, totals, migrations, sequences, duplicateEmails, fingerprints }, null, 2));
    if (sequences.some((sequence) => Number(sequence.last_value) < Number(sequence.max_id))
      || duplicateEmails.some((entry) => entry.groups > 0)
      || migrations.some((migration) => !migration.finished_at && !migration.rolled_back_at)) {
      console.error('Revision requerida: secuencias, emails duplicados o migraciones fallidas.');
      process.exitCode = 1;
    }
  } finally { await prisma.$disconnect(); }
}
main().catch(() => { console.error('Verificacion fallida. Comprueba conexion y migraciones.'); process.exitCode = 1; });
