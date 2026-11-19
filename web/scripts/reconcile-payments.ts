import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });
config({ quiet: true });

async function main() {
  if (process.env.RECONCILIATION_APPROVED !== 'true') throw new Error('Revisa el destino y usa RECONCILIATION_APPROVED=true.');
  const { prisma } = await import('../src/lib/prisma');
  const { getStripeClient } = await import('../src/lib/stripe');
  const { syncCheckoutSession } = await import('../src/modules/payments/payments.service');
  try {
    const stripe = getStripeClient();
    if (!stripe) throw new Error('Stripe no configurado.');
    const orders = await prisma.checkoutOrder.findMany({
      where: { environment: process.env.APP_ENV, status: { in: ['CREATING', 'OPEN', 'REVIEW'] } },
      orderBy: { id: 'asc' }, take: 100,
      ...(process.env.RECONCILIATION_CURSOR ? { cursor: { id: process.env.RECONCILIATION_CURSOR }, skip: 1 } : {}),
    });
    let failures = 0;
    for (const order of orders) {
      try {
        if (order.environment !== process.env.APP_ENV) throw new Error('Entorno incorrecto');
        if (order.stripeSessionId) {
          await syncCheckoutSession(await stripe.checkout.sessions.retrieve(order.stripeSessionId));
        } else {
          // A network timeout may have hidden a successfully created Stripe session.
          // Search a bounded time range; never release a hold on absence alone.
          const sessions = stripe.checkout.sessions.list({
            created: { gte: Math.floor(order.createdAt.getTime() / 1000) - 60, lte: Math.floor(order.expiresAt.getTime() / 1000) },
            limit: 100,
          });
          let found = false;
          for await (const session of sessions) {
            if (session.metadata?.orderId !== order.id || session.metadata?.app !== 'yellow-airline-web') continue;
            found = true;
            await syncCheckoutSession(session);
          }
          if (!found) throw new Error('Sesion desconocida: revisar manualmente en Stripe; no liberar automaticamente.');
        }
        console.log('Comprobada:', order.id);
      } catch (error) {
        failures++;
        console.error('Revisar:', order.id, error instanceof Error ? error.message : 'Error');
      }
    }
    await prisma.rateLimitBucket.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    if (orders.length === 100) console.log('Continuar con RECONCILIATION_CURSOR=', orders[orders.length - 1].id);
    if (failures || orders.length === 100) process.exitCode = 1;
  } finally { await prisma.$disconnect(); }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
