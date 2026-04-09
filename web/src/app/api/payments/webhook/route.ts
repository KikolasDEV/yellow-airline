import { paymentsRouteHandlers } from '@/modules/payments/payments.routes';

export async function POST() {
  return paymentsRouteHandlers.WEBHOOK();
}
