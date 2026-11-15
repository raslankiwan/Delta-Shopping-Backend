import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'password must be at least 8 characters'),
  name: z.string().trim().min(1).optional(),
  acceptsMarketing: z.boolean().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const customerLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1),
    locale: z.string().trim(),
    acceptsMarketing: z.boolean(),
  })
  .partial();
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const addressSchema = z.object({
  name: z.string().trim().optional(),
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  region: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  country: z.string().trim().length(2, 'ISO 3166-1 alpha-2 country code'),
  phone: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof addressSchema>;
