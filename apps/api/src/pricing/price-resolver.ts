import { and, asc, eq, gte, isNull, lte, or } from 'drizzle-orm';
import { price, priceList, productVariant, type Tx } from '@mercato/db';
import type { MoneyLike } from '@mercato/core';

/**
 * Resolve the current effective unit price (minor units) for a variant in a
 * currency: the active (schedule-windowed), base-quantity price, lowest amount.
 * Runs on an already store-bound transaction, so RLS scopes it to the tenant.
 */
export async function resolveVariantPrice(
  tx: Tx,
  variantId: string,
  currency: string,
): Promise<MoneyLike | null> {
  return (await resolveVariantPricing(tx, variantId, currency)).price;
}

/** Resolve both the current price and the optional compare-at ("was") price. */
export async function resolveVariantPricing(
  tx: Tx,
  variantId: string,
  currency: string,
): Promise<{ price: MoneyLike | null; compare_at: MoneyLike | null }> {
  const now = new Date();
  const [row] = await tx
    .select({ amount: price.amountMinor, compareAt: price.compareAtAmountMinor })
    .from(price)
    .innerJoin(priceList, eq(price.priceListId, priceList.id))
    .where(
      and(
        eq(price.variantId, variantId),
        eq(priceList.currency, currency),
        lte(price.minQuantity, 1),
        or(isNull(price.startsAt), lte(price.startsAt, now)),
        or(isNull(price.endsAt), gte(price.endsAt, now)),
      ),
    )
    .orderBy(asc(price.amountMinor))
    .limit(1);
  if (!row) return { price: null, compare_at: null };
  return {
    price: { amount_minor: row.amount, currency },
    compare_at: row.compareAt != null ? { amount_minor: row.compareAt, currency } : null,
  };
}

/** Lowest active price across a product's variants in a currency (a "from" price). */
export async function resolveProductFromPrice(
  tx: Tx,
  productId: string,
  currency: string,
): Promise<MoneyLike | null> {
  const now = new Date();
  const [row] = await tx
    .select({ amount: price.amountMinor })
    .from(price)
    .innerJoin(productVariant, eq(price.variantId, productVariant.id))
    .innerJoin(priceList, eq(price.priceListId, priceList.id))
    .where(
      and(
        eq(productVariant.productId, productId),
        eq(priceList.currency, currency),
        lte(price.minQuantity, 1),
        or(isNull(price.startsAt), lte(price.startsAt, now)),
        or(isNull(price.endsAt), gte(price.endsAt, now)),
      ),
    )
    .orderBy(asc(price.amountMinor))
    .limit(1);
  return row ? { amount_minor: row.amount, currency } : null;
}
