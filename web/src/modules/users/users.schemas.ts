import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.number().int().positive(),
});
