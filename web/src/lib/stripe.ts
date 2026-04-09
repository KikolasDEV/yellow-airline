import Stripe from 'stripe';
import { env } from './env';

export const getStripeClient = () => {
  const secretKey = env.stripeSecretKey();

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
};
