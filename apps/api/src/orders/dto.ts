import { z } from 'zod';

export const refundSchema = z.object({
  amountMinor: z.number().int().positive().optional(),
  reason: z.string().trim().optional(),
});
export type RefundInput = z.infer<typeof refundSchema>;

export const fulfillSchema = z.object({
  trackingNumber: z.string().trim().optional(),
  carrier: z.string().trim().optional(),
});
export type FulfillInput = z.infer<typeof fulfillSchema>;
