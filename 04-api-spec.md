# API Design — Mercato

**Version:** 1.0 (draft) · **Date:** 2026-06-19 · Companion to `02-architecture.md`

REST over HTTPS, documented with OpenAPI 3.1, from which typed SDKs are generated for the storefront, admin, and mobile clients. This document defines conventions, auth, and the resource map. It is not the full OpenAPI file — it is the contract that file implements.

---

## 1. Principles & conventions

- **Base URL:** `https://api.{platform}.com/v1` (URI versioning; additive changes within a version).
- **Two audiences, one API:** a **Storefront** surface (public, read-mostly, edge-cached) and an **Admin** surface (authenticated, RBAC-gated). Operator endpoints are a separate, internal namespace.
- **JSON** request/response; `Content-Type: application/json`; UTF-8.
- **Resource naming:** plural nouns, kebab where needed (`/product-variants`). Nested only one level (`/orders/{id}/refunds`).
- **Pagination:** cursor-based — `?limit=50&cursor=...`; responses return `{ data: [...], page: { next_cursor, has_more } }`.
- **Filtering/sorting:** `?status=active&sort=-created_at&q=shirt`.
- **Idempotency:** mutations accept `Idempotency-Key` header; replays return the original result.
- **Errors:** RFC 9457 problem+json — `{ type, title, status, detail, code, errors[] }`. Stable machine-readable `code`.
- **Money:** always `{ amount_minor, currency }`; never floats.
- **Localization:** `Accept-Language` and/or `?locale=` select content language; `?currency=` selects pricing currency from the store's enabled set.
- **Rate limiting:** per IP, API key, and store; `429` with `Retry-After` and `RateLimit-*` headers.
- **Concurrency:** `ETag`/`If-Match` on mutable admin resources for optimistic concurrency.

---

## 2. Authentication & tenant resolution

### 2.1 Token model
- **Access token (JWT, short TTL ~15 min)** carries `sub` (user/customer id), `organization_id`, `store_ids` (authorized scope), `role`, `type` (`staff` | `customer` | `api`).
- **Refresh token (rotating, long TTL)** exchanges for new access tokens; reuse detection revokes the family.
- **Web:** tokens in `Secure`, `HttpOnly`, `SameSite` cookies (CSRF token paired). **Mobile/API:** `Authorization: Bearer <token>`.

### 2.2 Which store am I acting on? (resolution order)
1. **Storefront:** the request host (custom domain/subdomain) → `store_id`. Public catalog needs no user token.
2. **Admin/API:** the `store_id` is taken from the token scope; when a user has multiple stores, the active one is passed as `X-Store-Id` and **must** be within the token's `store_ids`.
3. Server validates the store is active and the caller is authorized; otherwise `403`. The resolved `store_id` is bound to the DB session (RLS) for the request.

### 2.3 Auth endpoints
```
POST /v1/auth/staff/login            -> { access, refresh }      (staff)
POST /v1/auth/customer/register      -> creates store-scoped customer
POST /v1/auth/customer/login         -> { access, refresh }      (customer)
POST /v1/auth/refresh                -> rotates tokens
POST /v1/auth/logout                 -> revokes refresh
POST /v1/auth/password/forgot|reset  -> localized email flow
GET  /v1/auth/me                     -> current principal + permissions
```
SSO/OIDC for staff and OAuth social login for customers are added in Phase 2.

---

## 3. Storefront API (public, per-store)

Read-optimized and cacheable; cart/checkout are dynamic. All responses localized + priced per the requested locale/currency.

```
# Catalog & search
GET  /v1/storefront/products                 # list/filter/paginate, facets
GET  /v1/storefront/products/{slug}          # detail incl. variants, prices, media
GET  /v1/storefront/collections/{slug}
GET  /v1/storefront/categories               # tree
GET  /v1/storefront/search?q=...             # FTS (MVP) / engine (P2)

# Store meta
GET  /v1/storefront/config                   # locales, currencies, theme, policies

# Cart (guest or customer; cart token cookie for guests)
POST   /v1/storefront/carts                  # create
GET    /v1/storefront/carts/{id}
POST   /v1/storefront/carts/{id}/lines       # add line
PATCH  /v1/storefront/carts/{id}/lines/{lid} # change qty
DELETE /v1/storefront/carts/{id}/lines/{lid}
POST   /v1/storefront/carts/{id}/discount    # apply promo code
POST   /v1/storefront/carts/{id}/estimate    # tax + shipping quote

# Checkout
POST /v1/storefront/checkout/sessions        # init: contact, addresses, shipping
POST /v1/storefront/checkout/sessions/{id}/payment-intent  # processor client secret
POST /v1/storefront/checkout/sessions/{id}/complete        # place order (idempotent)

# Customer account (auth)
GET  /v1/storefront/account/orders
GET  /v1/storefront/account/orders/{id}
GET/PUT /v1/storefront/account/addresses
GET/PUT /v1/storefront/account/profile
```

Inventory is reserved at checkout-session start and committed on order completion; payment is captured via the processor with card data collected client-side (PCI SAQ-A).

---

## 4. Admin API (authenticated, RBAC)

Each endpoint requires a permission (e.g., `catalog:write`, `orders:read`, `promotions:write`). The active store comes from `X-Store-Id` within token scope.

```
# Catalog
GET/POST           /v1/admin/products
GET/PATCH/DELETE    /v1/admin/products/{id}
POST                /v1/admin/products/{id}/variants
GET/PATCH/DELETE     /v1/admin/variants/{id}
GET/POST            /v1/admin/categories | /collections
POST                /v1/admin/catalog/import      # CSV (async job -> 202 + job id)
GET                 /v1/admin/catalog/export
POST                /v1/admin/media               # upload (signed URL)
PUT                 /v1/admin/translations        # bulk localize entities

# Pricing & promotions
GET/POST            /v1/admin/price-lists
PUT                 /v1/admin/variants/{id}/prices         # per currency, scheduled
GET/POST            /v1/admin/promotions                    # automatic promos
GET/POST            /v1/admin/discount-codes

# Inventory
GET                 /v1/admin/inventory                     # by location/variant
POST                /v1/admin/inventory/adjustments         # +/- with reason (audited)
GET/POST            /v1/admin/locations
GET                 /v1/admin/inventory/low-stock

# Orders & fulfillment
GET                 /v1/admin/orders                        # filter/search
GET                 /v1/admin/orders/{id}
POST                /v1/admin/orders/{id}/refunds           # full/partial
POST                /v1/admin/orders/{id}/fulfillments      # ship, tracking
POST                /v1/admin/orders/{id}/cancel
POST                /v1/admin/draft-orders                  # manual orders (P2)
POST                /v1/admin/orders/{id}/returns           # RMA (P2)

# Customers
GET                 /v1/admin/customers                     # search/segment
GET/PATCH            /v1/admin/customers/{id}
GET/POST            /v1/admin/customer-groups

# Reporting
GET                 /v1/admin/reports/sales?from&to&granularity
GET                 /v1/admin/reports/products/top
GET                 /v1/admin/reports/inventory
GET                 /v1/admin/reports/cross-store           # org roll-up (authorized stores)
POST                /v1/admin/reports/export                # async -> emailed/download

# Store settings & access
GET/PATCH            /v1/admin/store                         # locales, currencies, theme, policies
GET/POST            /v1/admin/staff | /roles | /api-keys
GET                 /v1/admin/audit-log
GET/POST/DELETE      /v1/admin/webhooks
```

---

## 5. Operator / platform API (internal, super-admin)

```
POST   /v1/platform/organizations            # provision merchant
POST   /v1/platform/organizations/{id}/stores
PATCH  /v1/platform/stores/{id}/status       # suspend/resume
GET    /v1/platform/health | /metrics
POST   /v1/platform/organizations/{id}/export | /erase   # GDPR jobs
```
Protected by separate operator credentials and network controls; not exposed to merchants.

---

## 6. Webhooks (outbound)

Stores subscribe to events; deliveries are signed (HMAC over body with the webhook secret), retried with backoff, and idempotent on the receiver via `event_id`.

| Event | Fired when |
|-------|-----------|
| `order.created` / `order.paid` / `order.cancelled` | order lifecycle |
| `order.fulfilled` / `order.refunded` | fulfillment / refund |
| `payment.succeeded` / `payment.failed` | processor result |
| `inventory.low_stock` | stock ≤ reorder point |
| `product.created` / `product.updated` | catalog change |
| `customer.created` | new account |

Delivery payload: `{ id, type, store_id, created_at, data }`. Inbound **processor** webhooks (Stripe etc.) hit `/v1/webhooks/stripe`, signature-verified, and drive payment state.

---

## 7. Example exchanges

**Add to cart**
```http
POST /v1/storefront/carts/8f.../lines
X-Store-Id: 7b3f...
Content-Type: application/json

{ "variant_id": "c1a2...", "quantity": 2 }
```
```json
{
  "data": {
    "cart_id": "8f...",
    "currency": "EUR",
    "lines": [{ "id": "ln_1", "variant_id": "c1a2...", "quantity": 2,
                "unit_price": { "amount_minor": 2499, "currency": "EUR" } }],
    "totals": { "subtotal": { "amount_minor": 4998, "currency": "EUR" } }
  }
}
```

**Create a scheduled sale price (admin)**
```http
PUT /v1/admin/variants/c1a2.../prices
X-Store-Id: 7b3f...
Authorization: Bearer <staff access>
Idempotency-Key: 2f9c...

{ "price_list_id": "pl_eur", "amount_minor": 1999, "currency": "EUR",
  "starts_at": "2026-07-01T00:00:00Z", "ends_at": "2026-07-08T00:00:00Z" }
```

**Error (validation)**
```json
{
  "type": "https://errors.platform.com/validation",
  "title": "Validation failed", "status": 422, "code": "validation_error",
  "errors": [{ "field": "quantity", "code": "min", "message": "must be >= 1" }]
}
```

---

## 8. Cross-cutting

- **Permissions matrix** maps each endpoint to required scopes; enforced by a guard before handlers.
- **Every response** carries `X-Request-Id`; logs/traces correlate by it plus `store_id`.
- **Backwards compatibility:** additive changes only within `/v1`; breaking changes ship as `/v2` with an overlap + deprecation window.
- **SDKs** are generated from OpenAPI and published to the monorepo's `packages/api-client` for web, admin, and mobile to share.
