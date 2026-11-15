export * from './platform';
export * from './catalog';
export * from './pricing';
export * from './i18n';
export * from './identity';
export * from './customers';
export * from './inventory';
export * from './commerce';
export * from './promotions';
export * from './outbox';

import { category, productImage, productOption, productOptionValue, product, productVariant } from './catalog';
import { translation } from './i18n';
import { price, priceList } from './pricing';
import { store, storeCurrency, storeLocale } from './platform';
import { apiKey, auditLog, refreshToken, role, staffMembership, staffUser } from './identity';
import { address, customer } from './customers';
import { inventoryItem, inventoryMovement, location } from './inventory';
import {
  cart,
  cartLine,
  fulfillment,
  fulfillmentLine,
  orderCounter,
  orderLine,
  orders,
  payment,
  refund,
  shippingZone,
} from './commerce';
import { discountCode, promotion } from './promotions';
import { outboxEvent } from './outbox';

/**
 * The tenant-table registry — the single source of truth for "which tables are
 * store-scoped and how isolation is keyed". Both the RLS presence check and the
 * cross-tenant isolation test iterate this list, so a new tenant table cannot be
 * added without also being covered by the isolation guarantees.
 *
 * `isolationColumn` is `store_id` for business tables; the `store` table isolates
 * on its own `id` (a store may see only itself).
 */
export interface TenantTable {
  readonly name: string;
  readonly isolationColumn: 'store_id' | 'id';
}

export const TENANT_TABLES: readonly TenantTable[] = [
  { name: 'store', isolationColumn: 'id' },
  { name: 'store_locale', isolationColumn: 'store_id' },
  { name: 'store_currency', isolationColumn: 'store_id' },
  { name: 'category', isolationColumn: 'store_id' },
  { name: 'product', isolationColumn: 'store_id' },
  { name: 'product_option', isolationColumn: 'store_id' },
  { name: 'product_option_value', isolationColumn: 'store_id' },
  { name: 'product_variant', isolationColumn: 'store_id' },
  { name: 'product_image', isolationColumn: 'store_id' },
  { name: 'price_list', isolationColumn: 'store_id' },
  { name: 'price', isolationColumn: 'store_id' },
  { name: 'translation', isolationColumn: 'store_id' },
  { name: 'api_key', isolationColumn: 'store_id' },
  { name: 'audit_log', isolationColumn: 'store_id' },
  { name: 'customer', isolationColumn: 'store_id' },
  { name: 'address', isolationColumn: 'store_id' },
  { name: 'location', isolationColumn: 'store_id' },
  { name: 'inventory_item', isolationColumn: 'store_id' },
  { name: 'inventory_movement', isolationColumn: 'store_id' },
  { name: 'cart', isolationColumn: 'store_id' },
  { name: 'cart_line', isolationColumn: 'store_id' },
  { name: 'order_counter', isolationColumn: 'store_id' },
  { name: 'orders', isolationColumn: 'store_id' },
  { name: 'order_line', isolationColumn: 'store_id' },
  { name: 'payment', isolationColumn: 'store_id' },
  { name: 'refund', isolationColumn: 'store_id' },
  { name: 'fulfillment', isolationColumn: 'store_id' },
  { name: 'fulfillment_line', isolationColumn: 'store_id' },
  { name: 'shipping_zone', isolationColumn: 'store_id' },
  { name: 'promotion', isolationColumn: 'store_id' },
  { name: 'discount_code', isolationColumn: 'store_id' },
  { name: 'outbox_event', isolationColumn: 'store_id' },
] as const;

/**
 * Organization-scoped tables — isolated by `current_organization_id()` rather than
 * store. The org-isolation test iterates this list.
 */
export const ORG_TABLES: readonly string[] = [
  'staff_user',
  'role',
  'staff_membership',
  'refresh_token',
] as const;

/** Drizzle table objects, handy for typed queries and test seeding. */
export const tables = {
  store,
  storeLocale,
  storeCurrency,
  category,
  product,
  productOption,
  productOptionValue,
  productVariant,
  productImage,
  priceList,
  price,
  translation,
  staffUser,
  role,
  staffMembership,
  refreshToken,
  apiKey,
  auditLog,
  customer,
  address,
  location,
  inventoryItem,
  inventoryMovement,
  cart,
  cartLine,
  orderCounter,
  orders,
  orderLine,
  payment,
  refund,
  fulfillment,
  fulfillmentLine,
  shippingZone,
  promotion,
  discountCode,
  outboxEvent,
};
