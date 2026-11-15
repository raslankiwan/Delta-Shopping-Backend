import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import {
  cart,
  cartLine,
  product,
  productVariant,
  store,
  withStore,
  type DbHandle,
  type Tx,
} from '@mercato/db';
import { DB_HANDLE } from '../db/database.module';
import { resolveVariantPrice } from '../pricing/price-resolver';
import { PromotionsService } from '../promotions/promotions.service';

const CART_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface CartView {
  id: string;
  currency: string;
  status: string;
  lines: Array<{
    id: string;
    variant_id: string;
    sku: string;
    title: string;
    quantity: number;
    unit_price: { amount_minor: number; currency: string };
    line_total: { amount_minor: number; currency: string };
  }>;
  subtotal: { amount_minor: number; currency: string };
  discount_code: string | null;
  discount: { amount_minor: number; currency: string };
  total: { amount_minor: number; currency: string };
}

@Injectable()
export class CartService {
  constructor(
    @Inject(DB_HANDLE) private readonly app: DbHandle,
    private readonly promotions: PromotionsService,
  ) {}

  async applyDiscount(storeId: string, cartId: string, code: string): Promise<CartView> {
    return withStore(this.app.db, storeId, async (tx) => {
      await this.loadOpenCart(tx, cartId);
      const subtotal = await this.subtotalOf(tx, cartId);
      const resolved = await this.promotions.validateAndResolve(tx, code, subtotal);
      await tx.update(cart).set({ discountCodeId: resolved.discountCodeId }).where(eq(cart.id, cartId));
      return this.view(tx, cartId);
    });
  }

  async removeDiscount(storeId: string, cartId: string): Promise<CartView> {
    return withStore(this.app.db, storeId, async (tx) => {
      await this.loadOpenCart(tx, cartId);
      await tx.update(cart).set({ discountCodeId: null }).where(eq(cart.id, cartId));
      return this.view(tx, cartId);
    });
  }

  async createCart(
    storeId: string,
    opts: { currency?: string; locale?: string; customerId?: string },
  ): Promise<{ id: string; currency: string }> {
    return withStore(this.app.db, storeId, async (tx) => {
      const currency = (opts.currency ?? (await storeDefaultCurrency(tx))).toUpperCase();
      const [c] = await tx
        .insert(cart)
        .values({
          storeId,
          currency,
          locale: opts.locale,
          customerId: opts.customerId ?? null,
          expiresAt: new Date(Date.now() + CART_TTL_MS),
        })
        .returning({ id: cart.id, currency: cart.currency });
      return { id: c!.id, currency: c!.currency };
    });
  }

  getCart(storeId: string, cartId: string): Promise<CartView> {
    return withStore(this.app.db, storeId, (tx) => this.view(tx, cartId));
  }

  async addLine(storeId: string, cartId: string, variantId: string, quantity: number): Promise<CartView> {
    return withStore(this.app.db, storeId, async (tx) => {
      const c = await this.loadOpenCart(tx, cartId);
      const price = await resolveVariantPrice(tx, variantId, c.currency);
      if (!price) {
        throw new UnprocessableEntityException({
          code: 'no_price',
          detail: `No ${c.currency} price for that variant.`,
        });
      }
      await tx
        .insert(cartLine)
        .values({ storeId, cartId, variantId, quantity, unitPriceMinor: price.amount_minor })
        .onConflictDoUpdate({
          target: [cartLine.storeId, cartLine.cartId, cartLine.variantId],
          set: {
            quantity: sql`${cartLine.quantity} + ${quantity}`,
            unitPriceMinor: price.amount_minor, // refresh to current price
          },
        });
      return this.view(tx, cartId);
    });
  }

  async updateLine(storeId: string, cartId: string, lineId: string, quantity: number): Promise<CartView> {
    return withStore(this.app.db, storeId, async (tx) => {
      await this.loadOpenCart(tx, cartId);
      if (quantity <= 0) {
        await tx.delete(cartLine).where(and(eq(cartLine.id, lineId), eq(cartLine.cartId, cartId)));
      } else {
        await tx
          .update(cartLine)
          .set({ quantity })
          .where(and(eq(cartLine.id, lineId), eq(cartLine.cartId, cartId)));
      }
      return this.view(tx, cartId);
    });
  }

  async removeLine(storeId: string, cartId: string, lineId: string): Promise<CartView> {
    return withStore(this.app.db, storeId, async (tx) => {
      await this.loadOpenCart(tx, cartId);
      await tx.delete(cartLine).where(and(eq(cartLine.id, lineId), eq(cartLine.cartId, cartId)));
      return this.view(tx, cartId);
    });
  }

  // --- helpers -----------------------------------------------------------

  private async loadOpenCart(tx: Tx, cartId: string): Promise<{ currency: string }> {
    const [c] = await tx
      .select({ status: cart.status, currency: cart.currency })
      .from(cart)
      .where(eq(cart.id, cartId))
      .limit(1);
    if (!c) throw new NotFoundException({ code: 'cart_not_found', detail: 'Cart not found.' });
    if (c.status !== 'open') {
      throw new ConflictException({ code: 'cart_closed', detail: 'This cart is no longer open.' });
    }
    return { currency: c.currency };
  }

  private async subtotalOf(tx: Tx, cartId: string): Promise<number> {
    const rows = await tx
      .select({ quantity: cartLine.quantity, unit: cartLine.unitPriceMinor })
      .from(cartLine)
      .where(eq(cartLine.cartId, cartId));
    return rows.reduce((sum, r) => sum + r.unit * r.quantity, 0);
  }

  private async view(tx: Tx, cartId: string): Promise<CartView> {
    const [c] = await tx
      .select({ id: cart.id, currency: cart.currency, status: cart.status, discountCodeId: cart.discountCodeId })
      .from(cart)
      .where(eq(cart.id, cartId))
      .limit(1);
    if (!c) throw new NotFoundException({ code: 'cart_not_found', detail: 'Cart not found.' });

    const rows = await tx
      .select({
        id: cartLine.id,
        variantId: cartLine.variantId,
        sku: productVariant.sku,
        title: product.title,
        quantity: cartLine.quantity,
        unit: cartLine.unitPriceMinor,
      })
      .from(cartLine)
      .innerJoin(productVariant, eq(cartLine.variantId, productVariant.id))
      .innerJoin(product, eq(productVariant.productId, product.id))
      .where(eq(cartLine.cartId, cartId));

    let subtotal = 0;
    const lines = rows.map((r) => {
      const lineTotal = r.unit * r.quantity;
      subtotal += lineTotal;
      return {
        id: r.id,
        variant_id: r.variantId,
        sku: r.sku,
        title: r.title,
        quantity: r.quantity,
        unit_price: { amount_minor: r.unit, currency: c.currency },
        line_total: { amount_minor: lineTotal, currency: c.currency },
      };
    });

    let discount = 0;
    let discountCode: string | null = null;
    if (c.discountCodeId) {
      const resolved = await this.promotions.resolveById(tx, c.discountCodeId, subtotal);
      if (resolved) {
        discount = resolved.discountMinor;
        discountCode = resolved.code;
      }
    }

    return {
      id: c.id,
      currency: c.currency,
      status: c.status,
      lines,
      subtotal: { amount_minor: subtotal, currency: c.currency },
      discount_code: discountCode,
      discount: { amount_minor: discount, currency: c.currency },
      total: { amount_minor: subtotal - discount, currency: c.currency },
    };
  }
}

async function storeDefaultCurrency(tx: Tx): Promise<string> {
  const [s] = await tx.select({ currency: store.defaultCurrency }).from(store).limit(1);
  return s?.currency ?? 'USD';
}
