import { boolean, index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { createdAt, primaryId, storeIdColumn } from './_shared';
import { store } from './platform';

const storeRef = () => storeIdColumn().references(() => store.id, { onDelete: 'cascade' });

export const promotion = pgTable(
  'promotion',
  {
    id: primaryId(),
    storeId: storeRef(),
    name: text('name').notNull(),
    type: text('type').notNull().default('code'),
    rules: jsonb('rules').notNull().default({}),
    actions: jsonb('actions').notNull(),
    priority: integer('priority').notNull().default(0),
    stackable: boolean('stackable').notNull().default(false),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    status: text('status').notNull().default('active'),
    createdAt: createdAt(),
  },
  (t) => [index('promotion_store_idx').on(t.storeId)],
);

export const discountCode = pgTable(
  'discount_code',
  {
    id: primaryId(),
    storeId: storeRef(),
    promotionId: uuid('promotion_id')
      .notNull()
      .references(() => promotion.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    usageLimit: integer('usage_limit'),
    perCustomerLimit: integer('per_customer_limit'),
    usedCount: integer('used_count').notNull().default(0),
    status: text('status').notNull().default('active'),
    createdAt: createdAt(),
  },
  (t) => [unique('discount_code_unique').on(t.storeId, t.code), index('discount_code_store_idx').on(t.storeId)],
);

export type Promotion = typeof promotion.$inferSelect;
export type DiscountCode = typeof discountCode.$inferSelect;

/** Shape stored in promotion.actions. */
export interface PromotionAction {
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // percent (0-100) for percentage; minor units for fixed; ignored for free_shipping
}
