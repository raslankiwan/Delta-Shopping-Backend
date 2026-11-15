import { z } from 'zod';

export const adjustmentSchema = z.object({
  variantId: z.string().uuid(),
  delta: z.number().int(),
  reorderPoint: z.number().int().nonnegative().optional(),
});
export type AdjustmentInput = z.infer<typeof adjustmentSchema>;

export const createLocationSchema = z.object({
  name: z.string().trim().min(1),
  isDefault: z.boolean().optional(),
});
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
