import { z } from 'zod';

export const webhookMetadataNumberSchema = z.string().regex(/^\d+$/);

export const checkoutSessionSchema = z.object({
  flightId: z.coerce.number().int().positive(),
  adults: z.coerce.number().int().nonnegative().default(1),
  children: z.coerce.number().int().nonnegative().default(0),
  infants: z.coerce.number().int().nonnegative().default(0),
});
