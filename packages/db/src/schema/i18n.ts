import { index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core';
import { createdAt, primaryId, storeIdColumn } from './_shared';
import { store } from './platform';

/**
 * Polymorphic translation store. One row per (entity, field, locale). Resolution:
 * requested locale -> store default locale -> the base value on the entity itself.
 * Fully store-scoped, so it is covered by the same RLS policy as every tenant table.
 */
export const translation = pgTable(
  'translation',
  {
    id: primaryId(),
    storeId: storeIdColumn().references(() => store.id, { onDelete: 'cascade' }),
    entityType: text('entity_type').notNull(), // 'product' | 'product_option' | ...
    entityId: uuid('entity_id').notNull(),
    field: text('field').notNull(), // 'title' | 'description' | ...
    locale: text('locale').notNull(),
    value: text('value').notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    unique('translation_unique').on(t.storeId, t.entityType, t.entityId, t.field, t.locale),
    index('translation_lookup_idx').on(t.storeId, t.entityType, t.entityId, t.locale),
  ],
);

export type Translation = typeof translation.$inferSelect;
