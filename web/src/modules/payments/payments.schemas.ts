import { z } from 'zod';

export const webhookMetadataNumberSchema = z.string().regex(/^\d+$/);
