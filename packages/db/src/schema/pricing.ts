import { bigint, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createdAt, primaryId, storeIdColumn } from './_shared';
import { store } from './platform';
import { productVariant } from './catalog';

const storeRef = () => storeIdColumn().references(() => store.id, { onDelete: 'cascade' });

/** A named set of prices in one currency (e.g. "EUR retail"). */
export const priceList = pgTable(
  'price_list',
  {
    id: primaryId(),
    storeId: storeRef(),
    name: text('name').notNull(),
    currency: text('currency').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('price_list_store_currency_idx').on(t.storeId, t.currency)],
);

/**
 * A price for a variant within a price list. Supports scheduled/sale windows
 * (starts_at/ends_at) and quantity breaks (min_quantity). Amount is minor units.
 */
export const price = pgTable(
  'price',
  {
    id: primaryId(),
    storeId: storeRef(),
    priceListId: uuid('price_list_id')
      .notNull()
      .references(() => priceList.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariant.id, { onDelete: 'cascade' }),
    amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
    compareAtAmountMinor: bigint('compare_at_amount_minor', { mode: 'number' }),
    minQuantity: integer('min_quantity').notNull().default(1),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index('price_store_variant_idx').on(t.storeId, t.variantId),
    index('price_store_list_idx').on(t.storeId, t.priceListId),
  ],
);

export type PriceList = typeof priceList.$inferSelect;
export type Price = typeof price.$inferSelect;
