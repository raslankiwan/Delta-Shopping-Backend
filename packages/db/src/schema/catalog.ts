import { boolean, index, integer, jsonb, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core';
import { createdAt, primaryId, storeIdColumn, timestamps } from './_shared';
import { store } from './platform';

const storeRef = () => storeIdColumn().references(() => store.id, { onDelete: 'cascade' });

/** A merchandising category (supports one level of nesting via `parentId`). */
export const category = pgTable(
  'category',
  {
    id: primaryId(),
    storeId: storeRef(),
    slug: text('slug').notNull(),
    name: text('name').notNull(), // base (default-locale) label; translations override
    parentId: uuid('parent_id'),
    position: integer('position').notNull().default(0),
    ...timestamps,
  },
  (t) => [
    unique('category_slug_unique').on(t.storeId, t.slug),
    index('category_store_idx').on(t.storeId),
  ],
);

/** Product — a sellable concept in a store's catalog. Variants carry price & stock. */
export const product = pgTable(
  'product',
  {
    id: primaryId(),
    storeId: storeRef(),
    slug: text('slug').notNull(),
    title: text('title').notNull(), // base (default-locale) value; translations override
    subtitle: text('subtitle'),
    description: text('description'),
    /** physical | digital | service — drives whether the item ships. */
    type: text('type').notNull().default('physical'),
    /** false for digital/service items — checkout skips shipping for them. */
    requiresShipping: boolean('requires_shipping').notNull().default(true),
    categoryId: uuid('category_id').references(() => category.id, { onDelete: 'set null' }),
    /** Service-only: nominal duration in minutes and where it's delivered. */
    serviceDurationMinutes: integer('service_duration_minutes'),
    serviceLocation: text('service_location'),
    vendor: text('vendor'),
    tags: text('tags').array().notNull().default([]),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    status: text('status').notNull().default('draft'),
    ...timestamps,
  },
  (t) => [
    unique('product_slug_unique').on(t.storeId, t.slug),
    index('product_store_status_idx').on(t.storeId, t.status),
    index('product_store_category_idx').on(t.storeId, t.categoryId),
  ],
);

/** Product (or variant-specific) image. `url` points at object storage or /uploads. */
export const productImage = pgTable(
  'product_image',
  {
    id: primaryId(),
    storeId: storeRef(),
    productId: uuid('product_id')
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id').references(() => productVariant.id, { onDelete: 'set null' }),
    url: text('url').notNull(),
    alt: text('alt'),
    position: integer('position').notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index('product_image_product_idx').on(t.storeId, t.productId)],
);

/** An option axis for a product, e.g. "Size". */
export const productOption = pgTable(
  'product_option',
  {
    id: primaryId(),
    storeId: storeRef(),
    productId: uuid('product_id')
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index('product_option_store_product_idx').on(t.storeId, t.productId)],
);

/** A concrete value on an option axis, e.g. "M". */
export const productOptionValue = pgTable(
  'product_option_value',
  {
    id: primaryId(),
    storeId: storeRef(),
    optionId: uuid('option_id')
      .notNull()
      .references(() => productOption.id, { onDelete: 'cascade' }),
    value: text('value').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index('product_option_value_store_option_idx').on(t.storeId, t.optionId)],
);

/** A purchasable variant/SKU of a product. */
export const productVariant = pgTable(
  'product_variant',
  {
    id: primaryId(),
    storeId: storeRef(),
    productId: uuid('product_id')
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull(),
    barcode: text('barcode'),
    /** Map of option name -> value, e.g. { "Size": "M", "Color": "Blue" }. */
    optionValues: jsonb('option_values').notNull().default({}),
    weightGrams: integer('weight_grams'),
    position: integer('position').notNull().default(0),
    status: text('status').notNull().default('active'),
    ...timestamps,
  },
  (t) => [
    unique('variant_sku_unique').on(t.storeId, t.sku),
    index('variant_store_product_idx').on(t.storeId, t.productId),
  ],
);

export type Category = typeof category.$inferSelect;
export type Product = typeof product.$inferSelect;
export type ProductOption = typeof productOption.$inferSelect;
export type ProductOptionValue = typeof productOptionValue.$inferSelect;
export type ProductVariant = typeof productVariant.$inferSelect;
export type ProductImage = typeof productImage.$inferSelect;
