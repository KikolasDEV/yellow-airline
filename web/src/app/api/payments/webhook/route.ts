import { paymentsRouteHandlers } from '@/modules/payments/payments.routes';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  return paymentsRouteHandlers.WEBHOOK(request);
}
