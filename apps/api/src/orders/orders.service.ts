import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import {
  fulfillment,
  fulfillmentLine,
  orderLine,
  orders,
  payment,
  refund,
  withStore,
  type DbHandle,
  type Tx,
} from '@mercato/db';
import { DB_HANDLE } from '../db/database.module';
import { InventoryService, type ReservationLine } from '../inventory/inventory.service';
import { PaymentService } from '../payments/payment.service';
import type { FulfillInput, RefundInput } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DB_HANDLE) private readonly app: DbHandle,
    private readonly inventory: InventoryService,
    private readonly payments: PaymentService,
  ) {}

  list(storeId: string, opts: { status?: string; limit?: number }) {
    return withStore(this.app.db, storeId, async (tx) => {
      const limit = Math.min(opts.limit ?? 50, 100);
      const base = tx
        .select({
          id: orders.id,
          number: orders.number,
          email: orders.email,
          currency: orders.currency,
          status: orders.status,
          financial_status: orders.financialStatus,
          fulfillment_status: orders.fulfillmentStatus,
          total_minor: orders.totalMinor,
          placed_at: orders.placedAt,
        })
        .from(orders)
        .orderBy(desc(orders.placedAt))
        .limit(limit);
      const rows = opts.status ? await base.where(eq(orders.status, opts.status)) : await base;
      return { data: rows };
    });
  }

  get(storeId: string, id: string) {
    return withStore(this.app.db, storeId, async (tx) => {
      const o = await this.loadOrder(tx, id);
      const [lines, payments, fulfillments, refunds] = await Promise.all([
        tx
          .select({
            sku: orderLine.sku,
            title: orderLine.titleSnapshot,
            quantity: orderLine.quantity,
            unit_price_minor: orderLine.unitPriceMinor,
            total_minor: orderLine.totalMinor,
          })
          .from(orderLine)
          .where(eq(orderLine.orderId, id)),
        tx
          .select({ provider: payment.provider, status: payment.status, amount_minor: payment.amountMinor })
          .from(payment)
          .where(eq(payment.orderId, id)),
        tx
          .select({
            status: fulfillment.status,
            tracking_number: fulfillment.trackingNumber,
            carrier: fulfillment.carrier,
          })
          .from(fulfillment)
          .where(eq(fulfillment.orderId, id)),
        tx
          .select({ amount_minor: refund.amountMinor, reason: refund.reason, status: refund.status })
          .from(refund)
          .where(eq(refund.orderId, id)),
      ]);
      return {
        order: {
          id: o.id,
          number: o.number,
          email: o.email,
          currency: o.currency,
          status: o.status,
          financial_status: o.financialStatus,
          fulfillment_status: o.fulfillmentStatus,
          subtotal_minor: o.subtotalMinor,
          tax_minor: o.taxMinor,
          shipping_minor: o.shippingMinor,
          total_minor: o.totalMinor,
          placed_at: o.placedAt,
        },
        lines,
        payments,
        fulfillments,
        refunds,
      };
    });
  }

  /** Cancel an open order: refund captured payment, restock, mark cancelled. */
  async cancel(storeId: string, id: string): Promise<void> {
    await withStore(this.app.db, storeId, async (tx) => {
      const order = await this.loadOrder(tx, id);
      if (order.status !== 'open') {
        throw new ConflictException({ code: 'not_open', detail: 'Only open orders can be cancelled.' });
      }
      const lines = await tx
        .select({ variantId: orderLine.variantId, quantity: orderLine.quantity })
        .from(orderLine)
        .where(eq(orderLine.orderId, id));
      const restock: ReservationLine[] = lines
        .filter((l): l is { variantId: string; quantity: number } => l.variantId !== null)
        .map((l) => ({ variantId: l.variantId, quantity: l.quantity }));
      if (restock.length) await this.inventory.restockInTx(tx, storeId, restock);

      if (order.financialStatus === 'paid') {
        await this.refundPayment(tx, storeId, id, order.totalMinor, 'order_cancelled');
      }
      await tx
        .update(orders)
        .set({ status: 'cancelled', financialStatus: order.financialStatus === 'paid' ? 'refunded' : order.financialStatus })
        .where(eq(orders.id, id));
    });
  }

  async refund(storeId: string, id: string, input: RefundInput): Promise<{ id: string }> {
    return withStore(this.app.db, storeId, async (tx) => {
      const order = await this.loadOrder(tx, id);
      const amount = input.amountMinor ?? order.totalMinor;
      if (amount <= 0 || amount > order.totalMinor) {
        throw new ConflictException({ code: 'invalid_amount', detail: 'Refund amount out of range.' });
      }
      const refundId = await this.refundPayment(tx, storeId, id, amount, input.reason);
      const financial = amount >= order.totalMinor ? 'refunded' : 'partially_refunded';
      await tx.update(orders).set({ financialStatus: financial }).where(eq(orders.id, id));
      return { id: refundId };
    });
  }

  async fulfill(storeId: string, id: string, input: FulfillInput): Promise<{ id: string }> {
    return withStore(this.app.db, storeId, async (tx) => {
      const order = await this.loadOrder(tx, id);
      if (order.status !== 'open') {
        throw new ConflictException({ code: 'not_open', detail: 'Only open orders can be fulfilled.' });
      }
      const [ful] = await tx
        .insert(fulfillment)
        .values({
          storeId,
          orderId: id,
          status: 'shipped',
          trackingNumber: input.trackingNumber,
          carrier: input.carrier,
          shippedAt: new Date(),
        })
        .returning({ id: fulfillment.id });
      const lines = await tx
        .select({ id: orderLine.id, quantity: orderLine.quantity })
        .from(orderLine)
        .where(eq(orderLine.orderId, id));
      if (lines.length) {
        await tx.insert(fulfillmentLine).values(
          lines.map((l) => ({ storeId, fulfillmentId: ful!.id, orderLineId: l.id, quantity: l.quantity })),
        );
      }
      await tx.update(orders).set({ fulfillmentStatus: 'fulfilled' }).where(eq(orders.id, id));
      return { id: ful!.id };
    });
  }

  // --- helpers -----------------------------------------------------------

  private async loadOrder(tx: Tx, id: string) {
    const [o] = await tx.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!o) throw new NotFoundException({ code: 'order_not_found', detail: `No order ${id}` });
    return o;
  }

  private async refundPayment(
    tx: Tx,
    storeId: string,
    orderId: string,
    amountMinor: number,
    reason: string | undefined,
  ): Promise<string> {
    const [pay] = await tx
      .select({ id: payment.id, providerRef: payment.providerRef })
      .from(payment)
      .where(and(eq(payment.orderId, orderId), eq(payment.status, 'captured')))
      .limit(1);
    await this.payments.refund({ providerRef: pay?.providerRef ?? null, amountMinor });
    const [r] = await tx
      .insert(refund)
      .values({ storeId, orderId, paymentId: pay?.id ?? null, amountMinor, reason, status: 'succeeded' })
      .returning({ id: refund.id });
    return r!.id;
  }
}
