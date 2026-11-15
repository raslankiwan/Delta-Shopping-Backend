import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lte, ne, sql } from 'drizzle-orm';
import { inventoryItem, orderLine, orders, productVariant, withStore, type DbHandle, type Tx } from '@mercato/db';
import { DB_HANDLE } from '../db/database.module';

@Injectable()
export class ReportsService {
  constructor(@Inject(DB_HANDLE) private readonly app: DbHandle) {}

  /** Sales summary over a date range: order count, revenue, AOV (paid, non-cancelled). */
  sales(storeId: string, from?: string, to?: string) {
    return withStore(this.app.db, storeId, async (tx) => {
      const conds = [ne(orders.status, 'cancelled'), eq(orders.financialStatus, 'paid')];
      if (from) conds.push(gte(orders.placedAt, new Date(from)));
      if (to) conds.push(lte(orders.placedAt, new Date(to)));
      const [row] = await tx
        .select({
          orders_count: sql<number>`count(*)::int`,
          revenue_minor: sql<number>`coalesce(sum(${orders.totalMinor}), 0)::bigint`,
        })
        .from(orders)
        .where(and(...conds));
      const count = Number(row?.orders_count ?? 0);
      const revenue = Number(row?.revenue_minor ?? 0);
      return {
        orders_count: count,
        revenue_minor: revenue,
        aov_minor: count > 0 ? Math.round(revenue / count) : 0,
      };
    });
  }

  /** Top products by units sold (and revenue), from order lines of non-cancelled orders. */
  topProducts(storeId: string, limit = 10) {
    return withStore(this.app.db, storeId, async (tx) => {
      const rows = await tx
        .select({
          sku: orderLine.sku,
          title: orderLine.titleSnapshot,
          units: sql<number>`sum(${orderLine.quantity})::int`,
          revenue_minor: sql<number>`sum(${orderLine.totalMinor})::bigint`,
        })
        .from(orderLine)
        .innerJoin(orders, eq(orderLine.orderId, orders.id))
        .where(ne(orders.status, 'cancelled'))
        .groupBy(orderLine.sku, orderLine.titleSnapshot)
        .orderBy(desc(sql`sum(${orderLine.quantity})`))
        .limit(Math.min(limit, 50));
      return { data: rows.map((r) => ({ ...r, units: Number(r.units), revenue_minor: Number(r.revenue_minor) })) };
    });
  }

  /** Inventory snapshot: totals and low-stock count. */
  inventory(storeId: string) {
    return withStore(this.app.db, storeId, async (tx: Tx) => {
      const rows = await tx
        .select({
          sku: productVariant.sku,
          on_hand: inventoryItem.onHand,
          reserved: inventoryItem.reserved,
          reorder_point: inventoryItem.reorderPoint,
        })
        .from(inventoryItem)
        .innerJoin(productVariant, eq(inventoryItem.variantId, productVariant.id));
      const totalOnHand = rows.reduce((s, r) => s + r.on_hand, 0);
      const totalReserved = rows.reduce((s, r) => s + r.reserved, 0);
      const lowStock = rows.filter((r) => r.on_hand - r.reserved <= r.reorder_point).length;
      return { skus: rows.length, total_on_hand: totalOnHand, total_reserved: totalReserved, low_stock: lowStock };
    });
  }
}
