import { z } from 'zod';

export const createDiscountCodeSchema = z
  .object({
    code: z.string().trim().min(1),
    type: z.enum(['percentage', 'fixed', 'free_shipping']),
    value: z.number().int().nonnegative().optional(),
    name: z.string().trim().optional(),
    usageLimit: z.number().int().positive().optional(),
    perCustomerLimit: z.number().int().positive().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
  })
  .refine((v) => v.type === 'free_shipping' || (v.value ?? 0) > 0, {
    message: 'percentage/fixed codes require a positive value',
    path: ['value'],
  });
export type CreateDiscountCodeInput = z.infer<typeof createDiscountCodeSchema>;

export const applyDiscountSchema = z.object({ code: z.string().trim().min(1) });
export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>;
