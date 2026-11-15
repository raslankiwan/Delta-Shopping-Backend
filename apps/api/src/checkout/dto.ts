import { z } from 'zod';
import { currencyCode, PALESTINE_PAYMENT_METHODS } from '@mercato/core';

export const createCartSchema = z.object({
  currency: currencyCode.optional(),
  locale: z.string().trim().optional(),
});
export type CreateCartInput = z.infer<typeof createCartSchema>;

export const addLineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});
export type AddLineInput = z.infer<typeof addLineSchema>;

export const updateLineSchema = z.object({
  quantity: z.number().int(),
});
export type UpdateLineInput = z.infer<typeof updateLineSchema>;

const addressSchema = z.object({
  name: z.string().trim().optional(),
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  region: z.string().trim().optional(),
  /** West Bank governorate code — drives the shipping rate. */
  governorate: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  country: z.string().trim().length(2).default('PS'),
  phone: z.string().trim().optional(),
});

export const completeCheckoutSchema = z.object({
  cartId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  /** Payment rail: cash on delivery (default) or a local gateway. */
  paymentMethod: z.enum(PALESTINE_PAYMENT_METHODS).default('cod'),
});
export type CompleteCheckoutInput = z.infer<typeof completeCheckoutSchema>;
