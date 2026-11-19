import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { jsonError, jsonOk } from '@/utils/responses';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    env.appUrl();
    env.environment();
    if (env.jwtSecret().length < 32) throw new Error('Invalid configuration');
    await prisma.$queryRaw`SELECT "id" FROM "CheckoutOrder" LIMIT 1`;
    return jsonOk({ status: 'ok', writes: env.writesEnabled(), payments: env.paymentsEnabled(), settlements: env.settlementsEnabled() });
  } catch { return jsonError('Servicio no preparado.', 503); }
}
