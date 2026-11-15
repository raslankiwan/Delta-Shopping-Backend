import { z } from 'zod';
import { productStatus, productType, serviceLocation } from '@mercato/core';

export const createProductSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a kebab-case slug'),
  title: z.string().trim().min(1),
  subtitle: z.string().trim().optional(),
  description: z.string().trim().optional(),
  type: productType.optional(),
  requiresShipping: z.boolean().optional(),
  categoryId: z.string().uuid().optional(),
  serviceDurationMinutes: z.number().int().positive().optional(),
  serviceLocation: serviceLocation.optional(),
  vendor: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
  status: productStatus.optional(),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const createCategorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a kebab-case slug'),
  name: z.string().trim().min(1),
  parentId: z.string().uuid().optional(),
  position: z.number().int().nonnegative().optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createVariantSchema = z.object({
  sku: z.string().trim().min(1),
  barcode: z.string().trim().optional(),
  optionValues: z.record(z.string(), z.string()).optional(),
  weightGrams: z.number().int().nonnegative().optional(),
  position: z.number().int().optional(),
});
export type CreateVariantInput = z.infer<typeof createVariantSchema>;

export const setPriceSchema = z.object({
  priceListId: z.string().uuid(),
  amountMinor: z.number().int(),
  compareAtAmountMinor: z.number().int().positive().optional(),
  minQuantity: z.number().int().positive().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});
export type SetPriceInput = z.infer<typeof setPriceSchema>;

export const addOptionSchema = z.object({
  name: z.string().trim().min(1),
  values: z.array(z.string().trim().min(1)).min(1),
});
export type AddOptionInput = z.infer<typeof addOptionSchema>;

export const addImageSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().trim().optional(),
  position: z.number().int().nonnegative().optional(),
  variantId: z.string().uuid().optional(),
});
export type AddImageInput = z.infer<typeof addImageSchema>;

export const setTranslationsSchema = z.object({
  locale: z.string().trim().min(2),
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  description: z.string().trim().optional(),
  seo_title: z.string().trim().optional(),
  seo_description: z.string().trim().optional(),
});
export type SetTranslationsInput = z.infer<typeof setTranslationsSchema>;
