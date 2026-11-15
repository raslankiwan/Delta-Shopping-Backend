import { eq, or } from 'drizzle-orm';
import { uuidv7 } from '@mercato/core';
import type { Database } from '@mercato/db';
import {
  address,
  apiKey,
  auditLog,
  cart,
  cartLine,
  category,
  customer,
  discountCode,
  fulfillment,
  fulfillmentLine,
  inventoryItem,
  inventoryMovement,
  location,
  orderCounter,
  orderLine,
  orders,
  organization,
  outboxEvent,
  payment,
  price,
  priceList,
  product,
  productImage,
  productOption,
  productOptionValue,
  productVariant,
  promotion,
  refreshToken,
  refund,
  role,
  shippingZone,
  staffMembership,
  staffUser,
  store,
  storeCurrency,
  storeLocale,
  translation,
} from '@mercato/db';

export interface IsolationFixture {
  orgAId: string;
  orgBId: string;
  storeAId: string;
  storeBId: string;
}

/**
 * Seed two fully independent tenants (separate organizations AND stores), each
 * with at least one row in every tenant table. This gives the isolation test
 * concrete "other tenant" rows to prove are invisible. Written via the admin
 * (BYPASSRLS) connection so it can populate both tenants.
 */
export async function seedIsolationFixture(db: Database): Promise<IsolationFixture> {
  const seedTenant = async (label: string): Promise<{ orgId: string; storeId: string }> => {
    const [org] = await db
      .insert(organization)
      .values({ name: `Org ${label}`, slug: `iso-org-${label.toLowerCase()}-${Date.now()}` })
      .returning();
    const orgId = org!.id;

    const [s] = await db
      .insert(store)
      .values({
        organizationId: orgId,
        slug: `iso-store-${label.toLowerCase()}-${Date.now()}`,
        name: `Store ${label}`,
        defaultLocale: 'en',
        defaultCurrency: 'USD',
      })
      .returning();
    const storeId = s!.id;

    await db.insert(storeLocale).values({ storeId, locale: 'en', isDefault: true });
    await db.insert(storeCurrency).values({ storeId, currency: 'USD', isDefault: true });

    const [list] = await db
      .insert(priceList)
      .values({ storeId, name: 'USD retail', currency: 'USD' })
      .returning();
    const [cat] = await db
      .insert(category)
      .values({ storeId, slug: `iso-cat-${label.toLowerCase()}`, name: `Category ${label}` })
      .returning();
    await db.insert(shippingZone).values({ storeId, governorate: 'ramallah', name: 'Ramallah', rateMinor: 1500 });
    const [prod] = await db
      .insert(product)
      .values({
        storeId,
        slug: `iso-product-${label.toLowerCase()}`,
        title: `Product ${label}`,
        categoryId: cat!.id,
        status: 'active',
      })
      .returning();
    const [opt] = await db
      .insert(productOption)
      .values({ storeId, productId: prod!.id, name: 'Size' })
      .returning();
    await db.insert(productOptionValue).values({ storeId, optionId: opt!.id, value: 'M' });
    const [variant] = await db
      .insert(productVariant)
      .values({ storeId, productId: prod!.id, sku: `ISO-${label}-001` })
      .returning();
    await db.insert(productImage).values({ storeId, productId: prod!.id, url: `/uploads/iso-${label}.png` });
    await db.insert(price).values({ storeId, priceListId: list!.id, variantId: variant!.id, amountMinor: 1000 });
    await db.insert(translation).values({
      storeId,
      entityType: 'product',
      entityId: prod!.id,
      field: 'title',
      locale: 'fr',
      value: `Produit ${label}`,
    });

    // Identity & access rows so every org- and store-scoped table has data for both tenants.
    const uniq = `${label}-${uuidv7()}`;
    const [r] = await db
      .insert(role)
      .values({ organizationId: orgId, name: `Owner ${label}`, permissions: ['*'] })
      .returning();
    const [su] = await db
      .insert(staffUser)
      .values({ organizationId: orgId, email: `owner-${uniq}@iso.test`, passwordHash: 'x', name: `Owner ${label}` })
      .returning();
    await db.insert(staffMembership).values({ organizationId: orgId, staffUserId: su!.id, storeId: null, roleId: r!.id });
    await db.insert(refreshToken).values({
      organizationId: orgId,
      staffUserId: su!.id,
      tokenHash: `hash-${uniq}`,
      familyId: uuidv7(),
      expiresAt: new Date(Date.now() + 1_000_000_000),
    });
    await db.insert(apiKey).values({ storeId, name: `key-${label}`, hashedKey: `key-${uniq}` });
    await db.insert(auditLog).values({ storeId, action: 'seed', entity: 'product', entityId: prod!.id, actorUserId: su!.id });

    const [cust] = await db
      .insert(customer)
      .values({ storeId, email: `shopper-${uniq}@iso.test`, name: `Shopper ${label}`, passwordHash: 'x' })
      .returning();
    await db.insert(address).values({
      storeId,
      customerId: cust!.id,
      line1: '1 Test St',
      city: 'Testville',
      country: 'US',
    });

    // inventory (store-scoped)
    const [loc] = await db
      .insert(location)
      .values({ storeId, name: 'Default', isDefault: true })
      .returning();
    const [item] = await db
      .insert(inventoryItem)
      .values({ storeId, variantId: variant!.id, locationId: loc!.id, onHand: 100 })
      .returning();
    await db.insert(inventoryMovement).values({
      storeId,
      inventoryItemId: item!.id,
      delta: 100,
      reason: 'adjustment',
    });

    // commerce (store-scoped): a cart and a complete order graph
    await db.insert(orderCounter).values({ storeId, nextNumber: 2 });
    const [cartRow] = await db.insert(cart).values({ storeId, currency: 'USD', status: 'open' }).returning();
    await db
      .insert(cartLine)
      .values({ storeId, cartId: cartRow!.id, variantId: variant!.id, quantity: 1, unitPriceMinor: 1000 });
    const [orderRow] = await db
      .insert(orders)
      .values({
        storeId,
        number: `ISO-${label}-1`,
        email: `order-${uniq}@iso.test`,
        currency: 'USD',
        subtotalMinor: 1000,
        totalMinor: 1000,
      })
      .returning();
    const [ol] = await db
      .insert(orderLine)
      .values({
        storeId,
        orderId: orderRow!.id,
        variantId: variant!.id,
        sku: `ISO-${label}-001`,
        titleSnapshot: `Product ${label}`,
        quantity: 1,
        unitPriceMinor: 1000,
        totalMinor: 1000,
      })
      .returning();
    const [pay] = await db
      .insert(payment)
      .values({ storeId, orderId: orderRow!.id, provider: 'test', amountMinor: 1000, currency: 'USD', status: 'captured' })
      .returning();
    await db.insert(refund).values({ storeId, orderId: orderRow!.id, paymentId: pay!.id, amountMinor: 0 });
    const [ful] = await db
      .insert(fulfillment)
      .values({ storeId, orderId: orderRow!.id, status: 'pending' })
      .returning();
    await db.insert(fulfillmentLine).values({ storeId, fulfillmentId: ful!.id, orderLineId: ol!.id, quantity: 1 });

    // promotions (store-scoped)
    const [promo] = await db
      .insert(promotion)
      .values({ storeId, name: `Promo ${label}`, actions: { type: 'percentage', value: 10 } })
      .returning();
    await db.insert(discountCode).values({ storeId, promotionId: promo!.id, code: `ISO-${label}-SAVE` });

    // outbox
    await db.insert(outboxEvent).values({ storeId, type: 'order.created', payload: { orderId: orderRow!.id } });

    return { orgId, storeId };
  };

  const a = await seedTenant('A');
  const b = await seedTenant('B');
  return { orgAId: a.orgId, orgBId: b.orgId, storeAId: a.storeId, storeBId: b.storeId };
}

/** Remove a fixture's data (cascades from organization). */
export async function cleanupIsolationFixture(db: Database, fx: IsolationFixture): Promise<void> {
  await db.delete(organization).where(or(eq(organization.id, fx.orgAId), eq(organization.id, fx.orgBId))!);
}
