import { z } from 'zod';

export const checkoutSessionSchema = z.object({
  flightId: z.number().int().positive(),
  adults: z.number().int().nonnegative(),
  children: z.number().int().nonnegative(),
  infants: z.number().int().nonnegative(),
});
