import { z } from 'zod';

export const checkoutSessionSchema = z.object({
  flightId: z.number().int().positive(),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(8),
  infants: z.number().int().min(0).max(9),
  selectedSeats: z.array(z.string().regex(/^[1-9]\d?[A-F]$/)).min(1).max(9),
}).strict().superRefine((value, ctx) => {
  if (value.adults + value.children + value.infants > 9 || value.infants > value.adults
    || value.selectedSeats.length !== value.adults + value.children
    || new Set(value.selectedSeats).size !== value.selectedSeats.length) {
    ctx.addIssue({ code: 'custom', message: 'Invalid passengers or seats.' });
  }
});

export type CheckoutPayload = z.infer<typeof checkoutSessionSchema>;
