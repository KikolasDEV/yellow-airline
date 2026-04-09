import { checkoutSessionController, webhookController } from './payments.controller';

export const paymentsRouteHandlers = {
  CHECKOUT_SESSION: checkoutSessionController,
  WEBHOOK: webhookController,
};
