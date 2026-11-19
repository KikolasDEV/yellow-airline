import Stripe from 'stripe';
import { env } from './env';

export const getStripeClient = () => {
  const secretKey = env.stripeSecretKey();

  if (!secretKey) {
    return null;
  }
  const expectedPrefix = env.environment() === 'production' ? 'sk_live_' : 'sk_test_';
  if (!secretKey.startsWith(expectedPrefix)) {
    throw new Error('Stripe key does not match APP_ENV');
  }
  // Keep retries inside the function budget; a later request reuses the persisted idempotency key.
  return new Stripe(secretKey, { maxNetworkRetries: 1, timeout: 10000 });
};
