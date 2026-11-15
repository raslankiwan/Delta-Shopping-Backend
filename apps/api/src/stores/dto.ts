import { z } from 'zod';
import { currencyCode, localeCode } from '@mercato/core';

export const createStoreSchema = z.object({
  name: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a kebab-case slug'),
  defaultLocale: localeCode.default('en'),
  defaultCurrency: currencyCode.default('USD'),
  timezone: z.string().default('UTC'),
  locales: z.array(localeCode).optional(),
  currencies: z.array(currencyCode).optional(),
});
export type CreateStoreInput = z.infer<typeof createStoreSchema>;

export const updateStoreSchema = z
  .object({
    name: z.string().trim().min(1),
    defaultLocale: localeCode,
    defaultCurrency: currencyCode,
    timezone: z.string(),
    status: z.enum(['active', 'suspended']),
  })
  .partial();
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
