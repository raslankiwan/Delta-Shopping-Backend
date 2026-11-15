import { sql } from 'drizzle-orm';
import { timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Time-ordered primary key backed by Postgres 18's native `uuidv7()`.
 * No app-side id generation needed — the database is the source.
 */
export const primaryId = () =>
  uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`);

/** `store_id` — the tenant isolation boundary. Present on every business table. */
export const storeIdColumn = () => uuid('store_id').notNull();

export const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

/** Standard timestamps spread into a table definition. */
export const timestamps = {
  createdAt: createdAt(),
  updatedAt: updatedAt(),
};
