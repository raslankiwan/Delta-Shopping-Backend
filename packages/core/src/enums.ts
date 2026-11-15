import { z } from 'zod';

export const productStatus = z.enum(['draft', 'active', 'archived']);
export type ProductStatus = z.infer<typeof productStatus>;

export const variantStatus = z.enum(['active', 'archived']);
export type VariantStatus = z.infer<typeof variantStatus>;

export const storeStatus = z.enum(['active', 'suspended', 'provisioning']);
export type StoreStatus = z.infer<typeof storeStatus>;

/**
 * What kind of thing a product is. `physical` ships; `digital` and `service` do
 * not (no courier, no shipping fee). Services additionally carry duration/location.
 */
export const productType = z.enum(['physical', 'digital', 'service']);
export type ProductType = z.infer<typeof productType>;

/** Where a service is delivered. */
export const serviceLocation = z.enum(['onsite', 'remote', 'customer']);
export type ServiceLocation = z.infer<typeof serviceLocation>;

/** Entity kinds that can carry localized field values in the `translation` table. */
export const translatableEntity = z.enum(['product', 'product_option', 'category', 'collection']);
export type TranslatableEntity = z.infer<typeof translatableEntity>;
