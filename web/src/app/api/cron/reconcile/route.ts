import { timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { getStripeClient } from '@/lib/stripe';
import { syncCheckoutSession } from '@/modules/payments/payments.service';
import { jsonError, jsonOk } from '@/utils/responses';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET ?? '';
  const supplied = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (secret.length < 32 || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return jsonError('No autorizado.', 401);
  if (!env.settlementsEnabled()) return jsonError('Confirmaciones pausadas.', 503);
  try {
    const stripe = getStripeClient();
    if (!stripe) return jsonError('Stripe no configurado.', 503);
    const orders = await prisma.checkoutOrder.findMany({
      where: { environment: env.environment(), stripeSessionId: { not: null }, status: { in: ['OPEN', 'CREATING'] }, expiresAt: { lt: new Date() } },
      orderBy: { updatedAt: 'asc' }, take: 10,
    });
    const results = await Promise.allSettled(orders.map(async (order) => {
      // Unknown session IDs need the explicitly approved operator reconciliation script.
      if (!order.stripeSessionId) throw new Error('Unknown Stripe session');
      await syncCheckoutSession(await stripe.checkout.sessions.retrieve(order.stripeSessionId));
    }));
    await prisma.rateLimitBucket.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    const review = await prisma.checkoutOrder.count({ where: { environment: env.environment(), status: 'REVIEW' } });
    const unknown = await prisma.checkoutOrder.count({
      where: { environment: env.environment(), status: 'CREATING', stripeSessionId: null, expiresAt: { lt: new Date() } },
    });
    const failures = results.filter((result) => result.status === 'rejected').length;
    if (failures || review || unknown) {
      console.error('reconciliation_attention_required', { failures, review, unknown, orderIds: orders.map((order) => order.id) });
      return jsonError('Conciliacion requiere revision del operador.', 503);
    }
    return jsonOk({ checked: orders.length, morePossible: orders.length === 10 });
  } catch { return jsonError('Conciliacion fallida.', 503); }
}
