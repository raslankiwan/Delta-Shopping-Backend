import { boolean, index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core';
import { createdAt, primaryId, storeIdColumn, timestamps } from './_shared';
import { store } from './platform';

const storeRef = () => storeIdColumn().references(() => store.id, { onDelete: 'cascade' });

/** A shopper account, scoped to one store. Unique by (store, email). */
export const customer = pgTable(
  'customer',
  {
    id: primaryId(),
    storeId: storeRef(),
    email: text('email').notNull(),
    passwordHash: text('password_hash'),
    name: text('name'),
    locale: text('locale'),
    acceptsMarketing: boolean('accepts_marketing').notNull().default(false),
    status: text('status').notNull().default('active'),
    ...timestamps,
  },
  (t) => [unique('customer_store_email_unique').on(t.storeId, t.email), index('customer_store_idx').on(t.storeId)],
);

export const address = pgTable(
  'address',
  {
    id: primaryId(),
    storeId: storeRef(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customer.id, { onDelete: 'cascade' }),
    name: text('name'),
    line1: text('line1').notNull(),
    line2: text('line2'),
    city: text('city').notNull(),
    region: text('region'),
    /** West Bank governorate code (see WEST_BANK_GOVERNORATES); drives shipping. */
    governorate: text('governorate'),
    postalCode: text('postal_code'),
    country: text('country').notNull().default('PS'),
    phone: text('phone'),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index('address_store_customer_idx').on(t.storeId, t.customerId)],
);

export type Customer = typeof customer.$inferSelect;
export type Address = typeof address.$inferSelect;
