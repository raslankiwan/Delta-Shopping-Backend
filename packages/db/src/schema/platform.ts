import { bigint, boolean, index, integer, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core';
import { createdAt, primaryId, storeIdColumn, timestamps, updatedAt } from './_shared';

/**
 * Organization — the merchant account. Owns billing, staff, and one or more stores.
 * Account-level (not store-scoped): guarded by organization_id, not RLS store policy.
 */
export const organization = pgTable('organization', {
  id: primaryId(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan').notNull().default('trial'),
  billingStatus: text('billing_status').notNull().default('active'),
  ...timestamps,
});

/**
 * Store — the primary data-isolation boundary (the "tenant"). Belongs to exactly
 * one organization. Every business row carries this store's id.
 */
export const store = pgTable(
  'store',
  {
    id: primaryId(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    primaryDomain: text('primary_domain'),
    name: text('name').notNull(),
    defaultLocale: text('default_locale').notNull().default('en'),
    defaultCurrency: text('default_currency').notNull().default('USD'),
    timezone: text('timezone').notNull().default('UTC'),
    status: text('status').notNull().default('active'),
    taxRateBps: integer('tax_rate_bps').notNull().default(0),
    shippingFlatMinor: bigint('shipping_flat_minor', { mode: 'number' }).notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique('store_slug_unique').on(t.slug),
    unique('store_primary_domain_unique').on(t.primaryDomain),
    index('store_organization_idx').on(t.organizationId),
  ],
);

const storeRef = () => storeIdColumn().references(() => store.id, { onDelete: 'cascade' });

/** Enabled languages for a store, with one default. */
export const storeLocale = pgTable(
  'store_locale',
  {
    id: primaryId(),
    storeId: storeRef(),
    locale: text('locale').notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    enabled: boolean('enabled').notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [unique('store_locale_unique').on(t.storeId, t.locale), index('store_locale_store_idx').on(t.storeId)],
);

/** Enabled currencies for a store, with one default. Prices are stored per currency. */
export const storeCurrency = pgTable(
  'store_currency',
  {
    id: primaryId(),
    storeId: storeRef(),
    currency: text('currency').notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    enabled: boolean('enabled').notNull().default(true),
    roundingRule: text('rounding_rule').notNull().default('none'),
    createdAt: createdAt(),
  },
  (t) => [
    unique('store_currency_unique').on(t.storeId, t.currency),
    index('store_currency_store_idx').on(t.storeId),
  ],
);

export type Organization = typeof organization.$inferSelect;
export type Store = typeof store.$inferSelect;
export type StoreLocale = typeof storeLocale.$inferSelect;
export type StoreCurrency = typeof storeCurrency.$inferSelect;
