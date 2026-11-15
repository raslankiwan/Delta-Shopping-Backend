import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createdAt, primaryId, storeIdColumn } from './_shared';
import { store } from './platform';

/** Transactional outbox: domain events written alongside state changes. */
export const outboxEvent = pgTable(
  'outbox_event',
  {
    id: primaryId(),
    storeId: storeIdColumn().references(() => store.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    payload: jsonb('payload').notNull(),
    createdAt: createdAt(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => [index('outbox_unpublished_idx').on(t.storeId, t.createdAt)],
);

export type OutboxEvent = typeof outboxEvent.$inferSelect;
