import { z } from 'zod';

export const listFlightsQuerySchema = z.object({
  origin: z.string().trim().optional(),
  destination: z.string().trim().optional(),
});

export const createFlightSchema = z.object({
  origin: z.string().trim().min(1),
  destination: z.string().trim().min(1),
  departureTime: z.string().trim().min(1),
  price: z.union([z.number(), z.string()]),
  capacity: z.union([z.number(), z.string()]).optional(),
});
