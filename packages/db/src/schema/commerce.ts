import { bigint, boolean, index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { createdAt, primaryId, storeIdColumn, timestamps } from './_shared';
import { store } from './platform';
import { customer } from './customers';
import { productVariant } from './catalog';
import { location } from './inventory';

const storeRef = () => storeIdColumn().references(() => store.id, { onDelete: 'cascade' });

export const cart = pgTable(
  'cart',
  {
    id: primaryId(),
    storeId: storeRef(),
    customerId: uuid('customer_id').references(() => customer.id, { onDelete: 'set null' }),
    currency: text('currency').notNull(),
    locale: text('locale'),
    status: text('status').notNull().default('open'),
    discountCodeId: uuid('discount_code_id'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index('cart_store_idx').on(t.storeId)],
);

export const cartLine = pgTable(
  'cart_line',
  {
    id: primaryId(),
    storeId: storeRef(),
    cartId: uuid('cart_id')
      .notNull()
      .references(() => cart.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariant.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    unitPriceMinor: bigint('unit_price_minor', { mode: 'number' }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    unique('cart_line_unique').on(t.storeId, t.cartId, t.variantId),
    index('cart_line_cart_idx').on(t.storeId, t.cartId),
  ],
);

/** Per-store monotonic order numbering (one row per store). */
export const orderCounter = pgTable('order_counter', {
  storeId: uuid('store_id')
    .primaryKey()
    .references(() => store.id, { onDelete: 'cascade' }),
  nextNumber: integer('next_number').notNull().default(1),
});

export const orders = pgTable(
  'orders',
  {
    id: primaryId(),
    storeId: storeRef(),
    number: text('number').notNull(),
    customerId: uuid('customer_id').references(() => customer.id, { onDelete: 'set null' }),
    email: text('email').notNull(),
    currency: text('currency').notNull(),
    locale: text('locale'),
    status: text('status').notNull().default('open'),
    financialStatus: text('financial_status').notNull().default('unpaid'),
    fulfillmentStatus: text('fulfillment_status').notNull().default('unfulfilled'),
    subtotalMinor: bigint('subtotal_minor', { mode: 'number' }).notNull(),
    discountMinor: bigint('discount_minor', { mode: 'number' }).notNull().default(0),
    taxMinor: bigint('tax_minor', { mode: 'number' }).notNull().default(0),
    shippingMinor: bigint('shipping_minor', { mode: 'number' }).notNull().default(0),
    totalMinor: bigint('total_minor', { mode: 'number' }).notNull(),
    billingAddress: jsonb('billing_address'),
    shippingAddress: jsonb('shipping_address'),
    idempotencyKey: text('idempotency_key'),
    placedAt: timestamp('placed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('orders_number_unique').on(t.storeId, t.number),
    index('orders_store_placed_idx').on(t.storeId, t.placedAt),
    index('orders_store_status_idx').on(t.storeId, t.status),
  ],
);

export const orderLine = pgTable(
  'order_line',
  {
    id: primaryId(),
    storeId: storeRef(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id').references(() => productVariant.id, { onDelete: 'set null' }),
    sku: text('sku').notNull(),
    titleSnapshot: text('title_snapshot').notNull(),
    quantity: integer('quantity').notNull(),
    unitPriceMinor: bigint('unit_price_minor', { mode: 'number' }).notNull(),
    taxMinor: bigint('tax_minor', { mode: 'number' }).notNull().default(0),
    totalMinor: bigint('total_minor', { mode: 'number' }).notNull(),
  },
  (t) => [index('order_line_order_idx').on(t.storeId, t.orderId)],
);

export const payment = pgTable(
  'payment',
  {
    id: primaryId(),
    storeId: storeRef(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerRef: text('provider_ref'),
    amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
    currency: text('currency').notNull(),
    status: text('status').notNull(),
    capturedAt: timestamp('captured_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index('payment_order_idx').on(t.storeId, t.orderId)],
);

export const refund = pgTable(
  'refund',
  {
    id: primaryId(),
    storeId: storeRef(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    paymentId: uuid('payment_id').references(() => payment.id, { onDelete: 'set null' }),
    amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
    reason: text('reason'),
    status: text('status').notNull().default('succeeded'),
    createdAt: createdAt(),
  },
  (t) => [index('refund_order_idx').on(t.storeId, t.orderId)],
);

export const fulfillment = pgTable(
  'fulfillment',
  {
    id: primaryId(),
    storeId: storeRef(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id').references(() => location.id, { onDelete: 'set null' }),
    status: text('status').notNull().default('pending'),
    trackingNumber: text('tracking_number'),
    carrier: text('carrier'),
    shippedAt: timestamp('shipped_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index('fulfillment_order_idx').on(t.storeId, t.orderId)],
);

export const fulfillmentLine = pgTable(
  'fulfillment_line',
  {
    id: primaryId(),
    storeId: storeRef(),
    fulfillmentId: uuid('fulfillment_id')
      .notNull()
      .references(() => fulfillment.id, { onDelete: 'cascade' }),
    orderLineId: uuid('order_line_id')
      .notNull()
      .references(() => orderLine.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
  },
  (t) => [index('fulfillment_line_idx').on(t.storeId, t.fulfillmentId)],
);

/**
 * A shipping zone — a flat courier rate for a West Bank governorate. Checkout
 * resolves the rate from the shipping address's governorate; COD availability is
 * per-zone so remote areas can be cash-only or delivery-restricted.
 */
export const shippingZone = pgTable(
  'shipping_zone',
  {
    id: primaryId(),
    storeId: storeRef(),
    governorate: text('governorate').notNull(), // governorate code (WEST_BANK_GOVERNORATES)
    name: text('name').notNull(),
    rateMinor: bigint('rate_minor', { mode: 'number' }).notNull().default(0),
    codAvailable: boolean('cod_available').notNull().default(true),
    etaDays: integer('eta_days'),
    enabled: boolean('enabled').notNull().default(true),
    ...timestamps,
  },
  (t) => [
    unique('shipping_zone_governorate_unique').on(t.storeId, t.governorate),
    index('shipping_zone_store_idx').on(t.storeId),
  ],
);

export type Cart = typeof cart.$inferSelect;
export type ShippingZone = typeof shippingZone.$inferSelect;
export type CartLine = typeof cartLine.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderLine = typeof orderLine.$inferSelect;
export type Payment = typeof payment.$inferSelect;
export type Refund = typeof refund.$inferSelect;
export type Fulfillment = typeof fulfillment.$inferSelect;
