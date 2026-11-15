import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import {
  cart,
  cartLine,
  orderCounter,
  orderLine,
  orders,
  outboxEvent,
  payment,
  product,
  productVariant,
  store,
  withStore,
  type DbHandle,
  type Tx,
} from '@mercato/db';
import { uuidv7 } from '@mercato/core';
import { DB_HANDLE } from '../db/database.module';
import { isUniqueViolation } from '../common/pg-errors';
import { resolveVariantPrice } from '../pricing/price-resolver';
import { InventoryService, type ReservationLine } from '../inventory/inventory.service';
import { PaymentService } from '../payments/payment.service';
import { PromotionsService } from '../promotions/promotions.service';
import { ShippingService } from '../shipping/shipping.service';
import type { CompleteCheckoutInput } from './dto';

export interface OrderView {
  id: string;
  number: string;
  email: string;
  currency: string;
  status: string;
  financial_status: string;
  fulfillment_status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  lines: Array<{ sku: string; title: string; quantity: number; unit_price_minor: number; total_minor: number }>;
}

@Injectable()
export class CheckoutService {
  constructor(
    @Inject(DB_HANDLE) private readonly app: DbHandle,
    private readonly inventory: InventoryService,
    private readonly payments: PaymentService,
    private readonly promotions: PromotionsService,
  ) {}

  /**
   * Place an order from a cart. Atomic: reserve stock → capture payment → write
   * the order/lines/payment → commit stock → close the cart, all in one
   * transaction. Idempotent on `idempotencyKey` (a retry returns the same order,
   * never a second charge).
   */
  async complete(
    storeId: string,
    input: CompleteCheckoutInput,
    idempotencyKey: string | undefined,
  ): Promise<OrderView> {
    try {
      return await withStore(this.app.db, storeId, async (tx) => {
        if (idempotencyKey) {
          const existing = await this.findByIdempotencyKey(tx, idempotencyKey);
          if (existing) return existing;
        }

        const c = await this.loadOpenCart(tx, input.cartId);
        const lines = await this.loadPricedLines(tx, input.cartId, c.currency);
        if (lines.length === 0) {
          throw new UnprocessableEntityException({ code: 'empty_cart', detail: 'Cannot check out an empty cart.' });
        }

        const settings = await this.loadStoreSettings(tx);
        const subtotal = lines.reduce((sum, l) => sum + l.totalMinor, 0);

        // Shipping: a digital/service-only cart ships nothing; otherwise the rate
        // comes from the destination governorate's zone (fallback: store flat rate).
        const requiresShipping = lines.some((l) => l.requiresShipping);
        const quote = await ShippingService.quoteInTx(
          tx,
          input.shippingAddress?.governorate,
          requiresShipping,
          settings.shippingFlatMinor,
        );

        // Apply an attached discount code (and consume one use, respecting limits).
        let discount = 0;
        let shipping = quote.amountMinor;
        if (c.discountCodeId) {
          const resolved = await this.promotions.resolveById(tx, c.discountCodeId, subtotal);
          if (resolved) {
            discount = resolved.discountMinor;
            if (resolved.freeShipping) shipping = 0;
            await this.promotions.consume(tx, c.discountCodeId);
          }
        }
        const taxable = subtotal - discount;
        const tax = Math.floor((taxable * settings.taxRateBps) / 10000);
        const total = taxable + tax + shipping;

        const orderId = uuidv7();
        const reservation: ReservationLine[] = lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity }));

        // 1) Reserve stock (throws 409 insufficient_stock → whole tx rolls back).
        await this.inventory.reserveInTx(tx, storeId, reservation, orderId);

        // 2) Allocate a per-store order number.
        const number = await this.nextOrderNumber(tx, storeId);

        // 3) Authorize/capture via the chosen rail. Cash on delivery authorizes for
        // collection on delivery (order stays financially pending); gateways capture
        // now. A hard failure rolls back the reservation.
        const method = input.paymentMethod;
        const captured = await this.payments.authorizeAndCapture(
          { amountMinor: total, currency: c.currency, orderRef: number },
          method,
        );
        if (captured.status === 'failed') {
          throw new HttpException(
            { code: 'payment_failed', detail: 'Payment was not captured.' },
            HttpStatus.PAYMENT_REQUIRED,
          );
        }
        const paid = captured.status === 'captured';
        const financialStatus = paid ? 'paid' : 'pending';

        // 4) Persist the order, lines and payment.
        await tx.insert(orders).values({
          id: orderId,
          storeId,
          number,
          customerId: c.customerId,
          email: input.email,
          currency: c.currency,
          locale: c.locale,
          status: 'open',
          financialStatus,
          fulfillmentStatus: 'unfulfilled',
          subtotalMinor: subtotal,
          discountMinor: discount,
          taxMinor: tax,
          shippingMinor: shipping,
          totalMinor: total,
          billingAddress: input.billingAddress ?? input.shippingAddress,
          shippingAddress: input.shippingAddress,
          idempotencyKey: idempotencyKey ?? null,
        });
        await tx.insert(orderLine).values(
          lines.map((l) => ({
            storeId,
            orderId,
            variantId: l.variantId,
            sku: l.sku,
            titleSnapshot: l.title,
            quantity: l.quantity,
            unitPriceMinor: l.unitPriceMinor,
            totalMinor: l.totalMinor,
          })),
        );
        await tx.insert(payment).values({
          storeId,
          orderId,
          provider: this.payments.providerName(method),
          providerRef: captured.ref,
          amountMinor: total,
          currency: c.currency,
          status: paid ? 'captured' : 'authorized',
          capturedAt: paid ? new Date() : null,
        });

        // 5) Emit a domain event (transactional outbox), commit stock, close cart.
        await tx.insert(outboxEvent).values({
          storeId,
          type: 'order.created',
          payload: { order_id: orderId, number, total_minor: total, currency: c.currency },
        });
        await this.inventory.commitInTx(tx, storeId, reservation);
        await tx.update(cart).set({ status: 'completed', updatedAt: new Date() }).where(eq(cart.id, input.cartId));

        return this.buildView(orderId, number, input.email, c.currency, financialStatus, subtotal, tax, shipping, total, lines);
      });
    } catch (e) {
      // Concurrent retry with the same idempotency key: return the winner's order.
      if (isUniqueViolation(e) && idempotencyKey) {
        const existing = await withStore(this.app.db, storeId, (tx) =>
          this.findByIdempotencyKey(tx, idempotencyKey),
        );
        if (existing) return existing;
      }
      throw e;
    }
  }

  // --- helpers -----------------------------------------------------------

  private async loadOpenCart(
    tx: Tx,
    cartId: string,
  ): Promise<{ currency: string; locale: string | null; customerId: string | null; discountCodeId: string | null }> {
    const [c] = await tx
      .select({
        status: cart.status,
        currency: cart.currency,
        locale: cart.locale,
        customerId: cart.customerId,
        discountCodeId: cart.discountCodeId,
      })
      .from(cart)
      .where(eq(cart.id, cartId))
      .limit(1);
    if (!c) throw new NotFoundException({ code: 'cart_not_found', detail: 'Cart not found.' });
    if (c.status !== 'open') {
      throw new ConflictException({ code: 'cart_closed', detail: 'This cart is no longer open.' });
    }
    return { currency: c.currency, locale: c.locale, customerId: c.customerId, discountCodeId: c.discountCodeId };
  }

  private async loadPricedLines(tx: Tx, cartId: string, currency: string) {
    const rows = await tx
      .select({
        variantId: cartLine.variantId,
        sku: productVariant.sku,
        title: product.title,
        requiresShipping: product.requiresShipping,
        quantity: cartLine.quantity,
        storedUnit: cartLine.unitPriceMinor,
      })
      .from(cartLine)
      .innerJoin(productVariant, eq(cartLine.variantId, productVariant.id))
      .innerJoin(product, eq(productVariant.productId, product.id))
      .where(eq(cartLine.cartId, cartId));

    const out = [];
    for (const r of rows) {
      const current = await resolveVariantPrice(tx, r.variantId, currency);
      const unit = current?.amount_minor ?? r.storedUnit; // fall back to snapshot if price removed
      out.push({
        variantId: r.variantId,
        sku: r.sku,
        title: r.title,
        requiresShipping: r.requiresShipping,
        quantity: r.quantity,
        unitPriceMinor: unit,
        totalMinor: unit * r.quantity,
      });
    }
    return out;
  }

  private async loadStoreSettings(tx: Tx): Promise<{ taxRateBps: number; shippingFlatMinor: number }> {
    const [s] = await tx
      .select({ taxRateBps: store.taxRateBps, shippingFlatMinor: store.shippingFlatMinor })
      .from(store)
      .limit(1);
    return { taxRateBps: s?.taxRateBps ?? 0, shippingFlatMinor: s?.shippingFlatMinor ?? 0 };
  }

  private async nextOrderNumber(tx: Tx, storeId: string): Promise<string> {
    const [row] = await tx
      .insert(orderCounter)
      .values({ storeId, nextNumber: 1 })
      .onConflictDoUpdate({
        target: orderCounter.storeId,
        set: { nextNumber: sql`${orderCounter.nextNumber} + 1` },
      })
      .returning({ n: orderCounter.nextNumber });
    return `MER-${String(row!.n).padStart(5, '0')}`;
  }

  private async findByIdempotencyKey(tx: Tx, key: string): Promise<OrderView | null> {
    const [o] = await tx.select().from(orders).where(eq(orders.idempotencyKey, key)).limit(1);
    if (!o) return null;
    const lines = await tx
      .select({
        sku: orderLine.sku,
        title: orderLine.titleSnapshot,
        quantity: orderLine.quantity,
        unitPriceMinor: orderLine.unitPriceMinor,
        totalMinor: orderLine.totalMinor,
      })
      .from(orderLine)
      .where(eq(orderLine.orderId, o.id));
    return this.buildView(
      o.id,
      o.number,
      o.email,
      o.currency,
      o.financialStatus,
      o.subtotalMinor,
      o.taxMinor,
      o.shippingMinor,
      o.totalMinor,
      lines.map((l) => ({ ...l, variantId: '', title: l.title })),
    );
  }

  private buildView(
    id: string,
    number: string,
    email: string,
    currency: string,
    financialStatus: string,
    subtotal: number,
    tax: number,
    shipping: number,
    total: number,
    lines: Array<{ sku: string; title: string; quantity: number; unitPriceMinor: number; totalMinor: number }>,
  ): OrderView {
    return {
      id,
      number,
      email,
      currency,
      status: 'open',
      financial_status: financialStatus,
      fulfillment_status: 'unfulfilled',
      subtotal,
      tax,
      shipping,
      total,
      lines: lines.map((l) => ({
        sku: l.sku,
        title: l.title,
        quantity: l.quantity,
        unit_price_minor: l.unitPriceMinor,
        total_minor: l.totalMinor,
      })),
    };
  }
}
