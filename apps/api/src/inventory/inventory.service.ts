import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import {
  inventoryItem,
  inventoryMovement,
  location,
  productVariant,
  withStore,
  type DbHandle,
  type Tx,
} from '@mercato/db';
import { DB_HANDLE } from '../db/database.module';
import type { AdjustmentInput, CreateLocationInput } from './dto';

export interface ReservationLine {
  variantId: string;
  quantity: number;
}

@Injectable()
export class InventoryService {
  constructor(@Inject(DB_HANDLE) private readonly app: DbHandle) {}

  // --- admin -------------------------------------------------------------

  listInventory(storeId: string) {
    return withStore(this.app.db, storeId, async (tx) => {
      const rows = await tx
        .select({
          variant_id: inventoryItem.variantId,
          sku: productVariant.sku,
          location_id: inventoryItem.locationId,
          on_hand: inventoryItem.onHand,
          reserved: inventoryItem.reserved,
          reorder_point: inventoryItem.reorderPoint,
        })
        .from(inventoryItem)
        .innerJoin(productVariant, eq(inventoryItem.variantId, productVariant.id));
      return { data: rows.map((r) => ({ ...r, available: r.on_hand - r.reserved })) };
    });
  }

  lowStock(storeId: string) {
    return withStore(this.app.db, storeId, async (tx) => {
      const rows = await tx
        .select({
          variant_id: inventoryItem.variantId,
          sku: productVariant.sku,
          on_hand: inventoryItem.onHand,
          reserved: inventoryItem.reserved,
          reorder_point: inventoryItem.reorderPoint,
        })
        .from(inventoryItem)
        .innerJoin(productVariant, eq(inventoryItem.variantId, productVariant.id))
        .where(sql`${inventoryItem.onHand} - ${inventoryItem.reserved} <= ${inventoryItem.reorderPoint}`);
      return { data: rows };
    });
  }

  /** Adjust on-hand at the store's default location, recording an audited movement. */
  async adjust(storeId: string, input: AdjustmentInput): Promise<{ on_hand: number }> {
    return withStore(this.app.db, storeId, async (tx) => {
      const loc = await this.ensureDefaultLocation(tx, storeId);
      const item = await this.ensureItem(tx, storeId, input.variantId, loc);
      const nextOnHand = item.onHand + input.delta;
      if (nextOnHand < 0) {
        throw new BadRequestException({ code: 'negative_stock', detail: 'Adjustment would make on-hand negative.' });
      }
      await tx
        .update(inventoryItem)
        .set({ onHand: nextOnHand, reorderPoint: input.reorderPoint ?? item.reorderPoint, updatedAt: new Date() })
        .where(eq(inventoryItem.id, item.id));
      await tx.insert(inventoryMovement).values({
        storeId,
        inventoryItemId: item.id,
        delta: input.delta,
        reason: 'adjustment',
      });
      return { on_hand: nextOnHand };
    });
  }

  listLocations(storeId: string) {
    return withStore(this.app.db, storeId, async (tx) => {
      const rows = await tx
        .select({ id: location.id, name: location.name, is_default: location.isDefault })
        .from(location);
      return { data: rows };
    });
  }

  async createLocation(storeId: string, input: CreateLocationInput): Promise<{ id: string }> {
    return withStore(this.app.db, storeId, async (tx) => {
      if (input.isDefault) {
        await tx.update(location).set({ isDefault: false }).where(eq(location.storeId, storeId));
      }
      const [row] = await tx
        .insert(location)
        .values({ storeId, name: input.name, isDefault: input.isDefault ?? false })
        .returning({ id: location.id });
      return { id: row!.id };
    });
  }

  // --- reservation (called by checkout within its own transaction) --------

  /**
   * Reserve stock for lines at the default location. Throws on insufficient stock
   * unless the item's backorder policy allows it. Increments `reserved`.
   */
  async reserveInTx(tx: Tx, storeId: string, lines: ReservationLine[], orderRef?: string): Promise<void> {
    const loc = await this.ensureDefaultLocation(tx, storeId);
    for (const line of lines) {
      const item = await this.ensureItem(tx, storeId, line.variantId, loc);
      const available = item.onHand - item.reserved;
      if (available < line.quantity && item.backorderPolicy !== 'allow') {
        throw new ConflictException({
          code: 'insufficient_stock',
          detail: `Only ${available} available for variant ${line.variantId}.`,
        });
      }
      await tx
        .update(inventoryItem)
        .set({ reserved: item.reserved + line.quantity, updatedAt: new Date() })
        .where(eq(inventoryItem.id, item.id));
      await tx.insert(inventoryMovement).values({
        storeId,
        inventoryItemId: item.id,
        delta: -line.quantity,
        reason: 'reservation',
        referenceType: orderRef ? 'order' : undefined,
        referenceId: orderRef,
      });
    }
  }

  /** Commit a reservation on fulfillment/payment: decrement both on_hand and reserved. */
  async commitInTx(tx: Tx, storeId: string, lines: ReservationLine[]): Promise<void> {
    const loc = await this.ensureDefaultLocation(tx, storeId);
    for (const line of lines) {
      const item = await this.ensureItem(tx, storeId, line.variantId, loc);
      await tx
        .update(inventoryItem)
        .set({
          onHand: item.onHand - line.quantity,
          reserved: Math.max(0, item.reserved - line.quantity),
          updatedAt: new Date(),
        })
        .where(eq(inventoryItem.id, item.id));
      await tx.insert(inventoryMovement).values({
        storeId,
        inventoryItemId: item.id,
        delta: -line.quantity,
        reason: 'commit',
      });
    }
  }

  /** Restock committed units (order cancel/return): increment on_hand back. */
  async restockInTx(tx: Tx, storeId: string, lines: ReservationLine[]): Promise<void> {
    const loc = await this.ensureDefaultLocation(tx, storeId);
    for (const line of lines) {
      const item = await this.ensureItem(tx, storeId, line.variantId, loc);
      await tx
        .update(inventoryItem)
        .set({ onHand: item.onHand + line.quantity, updatedAt: new Date() })
        .where(eq(inventoryItem.id, item.id));
      await tx.insert(inventoryMovement).values({
        storeId,
        inventoryItemId: item.id,
        delta: line.quantity,
        reason: 'restock',
      });
    }
  }

  /** Release a reservation (cart expiry / order cancel): decrement reserved only. */
  async releaseInTx(tx: Tx, storeId: string, lines: ReservationLine[]): Promise<void> {
    const loc = await this.ensureDefaultLocation(tx, storeId);
    for (const line of lines) {
      const item = await this.ensureItem(tx, storeId, line.variantId, loc);
      await tx
        .update(inventoryItem)
        .set({ reserved: Math.max(0, item.reserved - line.quantity), updatedAt: new Date() })
        .where(eq(inventoryItem.id, item.id));
      await tx.insert(inventoryMovement).values({
        storeId,
        inventoryItemId: item.id,
        delta: line.quantity,
        reason: 'release',
      });
    }
  }

  // --- helpers -----------------------------------------------------------

  private async ensureDefaultLocation(tx: Tx, storeId: string): Promise<string> {
    const [existing] = await tx
      .select({ id: location.id })
      .from(location)
      .where(eq(location.isDefault, true))
      .limit(1);
    if (existing) return existing.id;
    const [created] = await tx
      .insert(location)
      .values({ storeId, name: 'Default', isDefault: true })
      .returning({ id: location.id });
    return created!.id;
  }

  private async ensureItem(tx: Tx, storeId: string, variantId: string, locationId: string) {
    const [existing] = await tx
      .select()
      .from(inventoryItem)
      .where(and(eq(inventoryItem.variantId, variantId), eq(inventoryItem.locationId, locationId)))
      .limit(1);
    if (existing) return existing;
    const [created] = await tx
      .insert(inventoryItem)
      .values({ storeId, variantId, locationId })
      .returning();
    return created!;
  }
}
