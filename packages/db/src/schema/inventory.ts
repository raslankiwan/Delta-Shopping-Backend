import { boolean, index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { createdAt, primaryId, storeIdColumn, updatedAt } from './_shared';
import { store } from './platform';
import { productVariant } from './catalog';

const storeRef = () => storeIdColumn().references(() => store.id, { onDelete: 'cascade' });

export const location = pgTable(
  'location',
  {
    id: primaryId(),
    storeId: storeRef(),
    name: text('name').notNull(),
    address: jsonb('address'),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index('location_store_idx').on(t.storeId)],
);

export const inventoryItem = pgTable(
  'inventory_item',
  {
    id: primaryId(),
    storeId: storeRef(),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariant.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id')
      .notNull()
      .references(() => location.id, { onDelete: 'cascade' }),
    onHand: integer('on_hand').notNull().default(0),
    reserved: integer('reserved').notNull().default(0),
    reorderPoint: integer('reorder_point').notNull().default(0),
    backorderPolicy: text('backorder_policy').notNull().default('deny'),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique('inventory_item_unique').on(t.storeId, t.variantId, t.locationId),
    index('inventory_item_variant_idx').on(t.storeId, t.variantId),
  ],
);

export const inventoryMovement = pgTable(
  'inventory_movement',
  {
    id: primaryId(),
    storeId: storeRef(),
    inventoryItemId: uuid('inventory_item_id')
      .notNull()
      .references(() => inventoryItem.id, { onDelete: 'cascade' }),
    delta: integer('delta').notNull(),
    reason: text('reason').notNull(),
    referenceType: text('reference_type'),
    referenceId: uuid('reference_id'),
    createdAt: createdAt(),
  },
  (t) => [index('inventory_movement_item_idx').on(t.storeId, t.inventoryItemId)],
);

export type Location = typeof location.$inferSelect;
export type InventoryItem = typeof inventoryItem.$inferSelect;
export type InventoryMovement = typeof inventoryMovement.$inferSelect;
