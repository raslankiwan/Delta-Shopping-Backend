# Multi-store commerce

Delta now supports an invitation-only network of independent stores. The original community marketplace endpoints and data remain isolated for compatibility; active storefronts use the new `/api/commerce` domain.

## Roles and tenancy

- Platform administrators create stores, issue owner invitations, publish/suspend stores, configure per-store payment settlement, suspend accounts, and inspect audit events.
- Owners accept a one-time invitation while signed into the matching email. Owners manage their store settings and invite staff. Owners cannot create stores or change another store.
- Staff manage their store's catalog, discounts, orders, and customers. Owner-only settings, team operations, and refunds are rejected server-side.
- Buyers browse published stores, save favorites and carts, place orders, review verified purchases, track deliveries, and request returns.

Invitations expire after 7 days. Only their SHA-256 digest is stored. The admin receives a private invitation URL to share with the intended recipient. Email delivery is not configured; the UI explicitly offers copying the link. Sharing a link is not proof of account ownership; acceptance requires both the token and the matching signed-in email. Public signup never grants ownership or admin rights.

## Product model

Stores define their own category trees. Products have arbitrary descriptive attributes and up to 100 independently priced SKU variants. Physical goods, one-time digital downloads, and services use the same order pipeline. Variant names can represent sizes, colors, weights, packages, or service tiers. Services here are one-time orders, not booking calendars or recurring subscriptions.

Inventory is the available-to-sell quantity, excluding already reserved units. Each inventory edit carries an optimistic version, and sales increment that version. Stale dashboard edits cannot overwrite checkout reservations. Variants referenced by non-cancelled orders cannot be removed or have stock tracking changed. Archive a product to stop new sales while retaining fulfillment history.

Product images may be public HTTPS URLs or uploaded JPEG/PNG/WebP images (2 MiB each, up to 100 uploaded assets per store). Upload signatures are checked, SVG is refused, and upload permission is store-scoped. Binary image records are stored in MongoDB. For larger catalogs, use a dedicated object store/CDN; the free Atlas resource is intentionally bounded.

Digital delivery URLs are never returned by public catalog endpoints. The buyer can retrieve delivery URLs only from a paid order. The URLs themselves should be protected/signed by the external file host when ongoing access control or expiry is required.

## Money, inventory, and orders

All commerce prices use integer minor units. ILS/USD use 2 decimal places, JOD/KWD use 3, and JPY uses 0. Store currency becomes immutable after its first order. Customers check out one store at a time; unrelated currencies and settlements are never combined.

The server reloads prices, stock, store status, shipping, and coupon rules inside a MongoDB transaction. Clients send the total/currency they reviewed; changed totals are rejected. Stock reservation and coupon limits are atomic. A checkout UUID plus a request fingerprint makes retries idempotent and rejects reuse with a different cart. Store updates and suspension serialize against new order placement.

Store delivery countries, flat shipping, free-shipping thresholds, pickup, tax percentage, cash on delivery, return window, and policies are configurable. Tax is calculated on the discounted goods subtotal, excluding shipping. This is a configurable flat tax model, not an automated tax filing or cross-border tax engine.

Cash on delivery is supported for physical goods only. It stays unpaid until a store operator confirms collection after delivery. Digital goods/services require an approved online payment connector. Fulfillment follows unfulfilled → processing → shipped → delivered, with processing → delivered supported for pickup/digital/services. Shipped orders cannot be cancelled.

Cancellations and confirmed refunds release reserved stock and coupon usage once. Delivered orders need an approved, received return before a refund can be recorded. Cash refunds explicitly require the operator to confirm cash has already been returned. Card refunds require a provider-confirmed result or signed callback. Refunds performed directly at the provider are recorded even when goods have shipped; stock is restored only after a confirmed received return. The return-window policy is snapshotted when an order is placed. A return request is operational tracking, not a guarantee that every product is legally returnable; stores supply their own policy.

## Payments in Palestine

Country: Palestine (`PS`) initially, with configurable ISO country codes and store currencies for expansion.

Bank of Palestine offers a local e-commerce gateway for Visa/Mastercard and multi-currency payments. Its published onboarding requires a current account and a merchant agreement. PalPay also advertises merchant e-commerce services. Stripe's supported merchant country list does not include Palestine, so the app does not assume a Palestinian merchant can use Stripe.

Primary sources checked on 2026-10-20:

- https://www.bankofpalestine.com/en/business/electronic-services/payment-gateway
- https://www.palpay.ps/en/merchants/e-commerce-service
- https://stripe.com/global

**Live card processing is not connected.** The merchant credentials, bank integration pack, and approved multi-store settlement arrangement have not been supplied. No provider API was invented or treated as connected. The platform has a tested connector contract, described in `payment-connector.md`, for implementing the bank's approved integration. Until it is configured, card checkout is disabled in the UI and rejected server-side. COD remains available for real physical stores.

Payments settle to the merchant reference configured by a platform administrator for each store. This application does not pool customer funds, manufacture wallet balances, or assume an unapproved submerchant/payout arrangement. Confirm with the bank whether each store requires a separate merchant account or whether a platform arrangement is approved.

## Operations

- `/`: store directory
- `/s/:slug`: independent storefront
- `/dashboard`: owner/staff workspace
- `/orders`: buyer order history
- `/admin`: platform administration
- `/invite?token=…`: accept a matching invitation

The owner dashboard includes catalog, categories, inventory, orders, customer summaries, discounts, staff invitations, settings, low-stock alerts, paid revenue, and safe CSV export. Platform and fulfillment actions create audit/notification records.

`npm run test:integration` uses a disposable MongoDB replica set for transactional tests. `scripts/seed-commerce.ts` adds three explicitly labeled preview stores idempotently. Preview stores cannot take orders, even if a user bypasses the UI.

No real stores or owners are seeded. Create the platform administrator using the existing secure admin CLI, then create and invite stores through `/admin`. An administrator email/password is still needed; GitHub/Vercel deployment access is separate from a commerce administrator account.

## Limits and follow-on services

This release is a multi-store commerce core, not a claim of every feature in a mature commerce suite. Live bank payments, live transactional email/SMS, subscription billing, appointment/resource scheduling, custom domains, automated carrier labels, partial refunds, automated tax compliance, and jurisdiction-specific invoicing are not configured. These require product rules and/or external service accounts. Historical Firebase data and the old native app remain unmigrated, as documented in `migration.md`.


## Account recovery & email

Password recovery uses one-hour, hashed, single-use tokens, atomically consumes the reset, and revokes all prior sessions. Reset requests return a generic account-existence response. RESEND_API_KEY and a verified EMAIL_FROM must be configured to deliver messages; otherwise the endpoint explicitly reports that email recovery is not set up. Order receipt delivery is also wired to this provider and remains inactive without credentials. Invitations currently provide private links for manual delivery.
