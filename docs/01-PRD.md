# Product Requirements Document — Multi-Tenant Commerce Platform

**Codename:** Mercato
**Version:** 1.0 (draft)
**Date:** 2026-06-19
**Owner:** Raslan
**Status:** For review

---

## 1. Summary

Mercato is a multi-tenant, headless commerce platform. A single backend and database serve many independent merchants. Each merchant (an **Organization**) can run **one or many Stores**, and every store is fully isolated from every other store's data. Merchants manage their business through an **Admin Dashboard**; shoppers buy through a **Storefront** delivered as a responsive web app and an installable PWA, with a shared API that also powers native mobile apps.

The platform is multi-language and multi-currency from day one, and ships with the full set of core online-commerce capabilities: catalog and pricing, promotions, inventory, orders and fulfillment, customers and accounts, payments, and reporting.

---

## 2. Goals and non-goals

### 2.1 Goals

- **One platform, many stores.** A single deployment serves unlimited tenants with strict data isolation, configurable per store.
- **Works for one store or a portfolio.** The same admin works whether a merchant has a single store or manages dozens under one organization, with cross-store roll-ups.
- **API-first / headless.** Every capability is exposed via a documented API so the web storefront, PWA, native mobile apps, and third-party integrations all consume the same backend.
- **Internationalized by default.** Multi-language content, multi-currency pricing, locale-aware formatting, and right-to-left (RTL) layout support.
- **Complete commerce feature set.** Products, variants, prices, promotions, inventory, orders, fulfillment, refunds, customers, roles, and reporting.
- **Operable and secure.** Tenant isolation enforced at the database layer, auditable admin actions, and observability built in.

### 2.2 Non-goals (for this version)

- Building a visual drag-and-drop page builder / CMS (the storefront ships as themeable code; a no-code builder is a later phase).
- Marketplace mechanics with independent third-party sellers inside one store (multi-vendor) — the model here is multi-*store*, not multi-*vendor*. Noted as a future extension.
- Native point-of-sale (POS) hardware integration.
- Building our own payment processing — we integrate processors (Stripe, etc.), we do not become one.

---

## 3. Key concepts and glossary

| Term | Definition |
|------|------------|
| **Organization** | The merchant account that signs up for the platform. Owns billing, the subscription plan, and one or more stores. The unit of customer ownership. |
| **Store** | A single storefront with its own catalog, pricing, domain, locales, currency, theme, and settings. **The primary data-isolation boundary (the "tenant").** |
| **Tenant** | Synonym for Store in the isolation model — every business data row carries a `store_id` and is invisible to other stores. |
| **Staff user** | A person who logs into the Admin Dashboard. Belongs to an Organization, holds roles scoped to the org and/or specific stores. |
| **Customer** | A shopper account. Scoped to a single store (the same email can be a customer in multiple stores independently). |
| **Catalog** | The set of products, variants, categories/collections, and attributes for a store. |
| **Variant / SKU** | A purchasable version of a product (e.g., size/color). Carries its own price and inventory. |
| **Channel** | A surface a store sells through (web, PWA, native app, future: marketplace feeds). One catalog can publish to multiple channels. |

**Hierarchy:** `Organization → Store(s) → Catalog / Orders / Customers / Inventory`. Staff and billing live at the Organization level; commerce data is isolated at the Store level.

---

## 4. Personas

1. **Platform Operator (us).** Runs the SaaS: provisions organizations, monitors health, manages plans and global config, handles abuse. Needs a super-admin console and strong tenant isolation guarantees.
2. **Organization Owner / Admin.** Owns the merchant account. Creates stores, invites staff, sets billing, sees cross-store performance. May run one store or many.
3. **Store Manager.** Day-to-day operator of one store: adds products, sets prices, runs promotions, manages inventory and orders, reads reports. May be scoped to a single store.
4. **Staff (limited roles).** Catalog editor, order/fulfillment clerk, customer-support agent, finance/reporting viewer — each with least-privilege access.
5. **Shopper / Customer.** Browses, searches, adds to cart, checks out, tracks orders, manages their account — on web, PWA, or native app, in their language and currency.
6. **Developer / Integrator.** Builds custom storefronts, native apps, or integrations against the API; configures webhooks and API keys.

---

## 5. User stories (by epic)

Stories are written as `As a <persona>, I want <capability> so that <value>`. This is the source list the backlog (doc 05) sequences.

### 5.1 Tenancy & onboarding
- As an **Org Owner**, I can sign up and create my organization so that I can start selling.
- As an **Org Owner**, I can create and configure a new store (name, domain, default locale, currency, timezone) so that each brand/region is independent.
- As an **Org Owner**, I can invite staff and assign roles scoped to the org or to specific stores so that access follows least privilege.
- As a **Platform Operator**, I can suspend or delete an organization and be confident its data is fully isolated and removable.

### 5.2 Catalog & pricing
- As a **Store Manager**, I can create products with variants, images, attributes, and descriptions so shoppers can buy them.
- As a **Store Manager**, I can organize products into categories and collections so the store is browsable.
- As a **Store Manager**, I can set and schedule prices per currency (and per customer group) so pricing matches my markets.
- As a **Store Manager**, I can bulk import/export the catalog via CSV so migration and mass edits are fast.
- As a **Store Manager**, I can translate product content into the store's languages so shoppers read in their language.

### 5.3 Promotions
- As a **Store Manager**, I can create discount codes (percentage, fixed, free shipping) with usage limits and date windows.
- As a **Store Manager**, I can create automatic cart-level promotions (e.g., "buy 2 get 1", tiered discounts) with stacking rules.
- As a **Shopper**, I can apply a valid promo code at checkout and see the discount reflected.

### 5.4 Inventory
- As a **Store Manager**, I can track stock per SKU across one or more locations/warehouses.
- As a **Store Manager**, I can set low-stock thresholds and receive alerts, and choose back-order/pre-order behavior.
- As the **system**, I reserve inventory at checkout and decrement on payment so overselling is prevented.

### 5.5 Cart, checkout & orders
- As a **Shopper**, I can add items to a cart that persists across devices when logged in.
- As a **Shopper**, I can check out as guest or logged in, choose shipping, pay, and receive confirmation.
- As a **Store Manager**, I can view, search, and filter orders; capture/refund payments; and update fulfillment status.
- As a **Shopper**, I can view order history and track fulfillment/shipping status.

### 5.6 Customers & accounts
- As a **Shopper**, I can register, log in, manage addresses, and save payment methods (via the processor's vault).
- As a **Store Manager**, I can view customer profiles, order history, and segment customers into groups.
- As a **Support Agent**, I can look up a customer and act on their behalf (with audit trail).

### 5.7 Reporting & analytics
- As a **Store Manager**, I can see sales, orders, AOV, conversion, top products, and inventory reports for a date range.
- As an **Org Owner**, I can see cross-store roll-up dashboards comparing my stores.
- As a **Finance viewer**, I can export sales and tax reports.

### 5.8 Internationalization
- As a **Shopper**, I can switch the storefront language and currency and have prices, dates, and numbers formatted for my locale.
- As a **Store Manager**, I can configure which languages and currencies a store supports and set a default.
- As a **Shopper** in an RTL language (Arabic, Hebrew), I get a correctly mirrored layout.

### 5.9 Platform / developer
- As a **Developer**, I can authenticate against the API, scoped to a store, and build a custom client.
- As a **Developer**, I can subscribe to webhooks (order created, payment captured, inventory low) to integrate external systems.
- As an **Org Owner**, I can manage API keys and see an audit log of admin actions.

---

## 6. Feature catalog (full vision)

Grouped by domain. Phase tags: **[MVP]**, **[P2]** (phase 2), **[P3]** (phase 3 / advanced).

### Catalog
- Products, variants/SKUs, attributes & option types **[MVP]**
- Categories, collections, smart collections (rule-based) **[MVP / P2]**
- Media management (images, alt text, ordering); video **[MVP / P2]**
- Digital/downloadable products **[P2]**
- Product bundles & kits **[P3]**
- CSV import/export, bulk edit **[MVP]**

### Pricing & promotions
- Multi-currency price lists **[MVP]**
- Scheduled price changes, sale prices **[MVP]**
- Customer-group / B2B pricing tiers **[P2]**
- Discount codes (%, fixed, free shipping) **[MVP]**
- Automatic promotions, BOGO, tiered, stacking rules **[P2]**
- Gift cards & store credit **[P3]**

### Inventory
- Per-SKU stock, single location **[MVP]**
- Multi-location / multi-warehouse **[P2]**
- Reservations, back-order, pre-order **[MVP / P2]**
- Low-stock alerts, restock workflows **[P2]**
- Stock transfers & adjustments with audit **[P3]**

### Orders & fulfillment
- Cart, checkout, order lifecycle **[MVP]**
- Payment capture, partial capture, refunds **[MVP]**
- Shipping methods (flat, weight-based, free) **[MVP]**, carrier-rate integration **[P3]**
- Tax: configurable rates **[MVP]**, tax-service integration (Avalara/TaxJar) **[P3]**
- Fulfillment statuses, partial fulfillment, returns/RMA **[P2]**
- Draft orders / manual orders **[P2]**

### Customers
- Accounts, addresses, order history **[MVP]**
- Saved payment methods via processor vault **[MVP]**
- Customer groups & segments **[P2]**
- Wishlists **[P2]**, loyalty **[P3]**

### Reporting
- Sales, orders, AOV, conversion, top products **[MVP]**
- Inventory & low-stock reports **[MVP]**
- Cross-store roll-ups **[P2]**
- Custom report builder, scheduled email exports **[P3]**

### Internationalization
- Multi-language UI + content translations **[MVP]**
- Multi-currency display & checkout **[MVP]**
- Locale formatting (date/number), RTL **[MVP]**
- Per-locale SEO (hreflang, localized URLs) **[P2]**
- Geo-based locale/currency suggestion **[P2]**

### Admin & platform
- Role-based access control, store-scoped roles **[MVP]**
- Audit log of admin actions **[MVP]**
- Multi-store switcher + org dashboard **[MVP]**
- API keys & webhooks **[MVP / P2]**
- Billing & plan management (per organization) **[P2]**
- Theme/branding settings per store **[MVP]**, theme builder **[P3]**
- Super-admin operator console **[MVP/P2]**

---

## 7. Scope and phased roadmap

The platform is specified in full, but delivery is phased. **MVP is the line that makes the platform sellable to a first real merchant.**

### Phase 0 — Foundations (infra, not user-facing)
Monorepo, CI/CD, database with RLS-based tenancy, auth, tenant resolution, base API framework, i18n scaffolding, observability. *Exit:* a "hello tenant" store can be provisioned and isolated.

### Phase 1 — MVP (single + multi-store, sellable)
Org/store provisioning, RBAC, catalog with variants, multi-currency pricing, basic promotions (codes), single-location inventory with reservations, cart, checkout, Stripe payments, orders + refunds, customer accounts, configurable tax/shipping, core sales/inventory reports, multi-language storefront + PWA, admin dashboard with store switcher. *Exit:* a merchant can launch a real store and take real orders in multiple languages and currencies.

### Phase 2 — Growth
Automatic promotions & stacking, customer groups/B2B pricing, multi-location inventory, returns/RMA, draft orders, cross-store roll-up reporting, wishlists, webhooks + public API hardening, billing/plans, localized SEO, native mobile app (Expo) consuming the API.

### Phase 3 — Advanced / enterprise
Gift cards & loyalty, bundles/kits, carrier-rate & tax-service integrations, custom report builder, theme builder, optional database-per-tenant for enterprise customers, multi-vendor extension exploration.

---

## 8. Non-functional requirements

| Area | Requirement |
|------|-------------|
| **Isolation** | No tenant can ever read or write another tenant's data. Enforced at the database layer (Postgres Row-Level Security), not just in app code. |
| **Performance** | Storefront product/listing API p95 < 200 ms (cached); checkout actions p95 < 500 ms. Admin list views paginated, < 1 s. |
| **Scalability** | Horizontally scalable stateless API; support thousands of stores and millions of products on shared schema before any tenant needs isolation. |
| **Availability** | 99.9% target for storefront/checkout. Graceful degradation if non-critical services (search, recommendations) are down. |
| **Security** | OWASP Top 10 controls, encryption in transit and at rest, PCI-DSS SAQ-A posture (no raw card data touches our servers; processor-hosted fields/tokens), secrets management, least-privilege roles, full admin audit log. |
| **Data** | Point-in-time recovery backups; per-tenant export and deletion (GDPR/CCPA right to erasure). |
| **i18n** | All user-facing strings externalized; no hard-coded copy. Support LTR and RTL. UTF-8 throughout. |
| **Accessibility** | Storefront targets WCAG 2.2 AA. |
| **Observability** | Structured logs with `store_id`/`request_id`, distributed tracing, metrics, and alerting. |
| **Compliance** | GDPR/CCPA data handling; configurable cookie consent; tax/invoice requirements per region. |

---

## 9. Success metrics

- **Time-to-launch:** a new merchant can go from signup to a live store taking orders in < 1 day.
- **Tenant isolation:** zero cross-tenant data-access incidents (hard requirement, tracked via automated tests + audits).
- **Storefront performance:** Core Web Vitals "good" on the reference theme; checkout completion p95 < 500 ms.
- **Platform scale:** N stores per database node before isolation needed (capacity target set in Phase 0 load tests).
- **Reliability:** 99.9% checkout availability; error budget tracked.
- **Adoption (product):** % of stores using multi-language, multi-currency, and promotions (validates the feature bets).

---

## 10. Assumptions, risks, and open questions

### Assumptions
- Payments via Stripe first, behind a provider-agnostic abstraction so others (Adyen, PayPal, regional gateways) can be added.
- Shared-schema multi-tenancy (one DB, `store_id` + RLS) is the default; database-per-tenant is a Phase 3 option for enterprise/compliance.
- Storefront ships as a themeable reference app (Next.js); merchants who want fully custom UIs use the API directly.

### Risks
- **Tenant data leakage** — mitigated by DB-level RLS, default-deny policies, and automated isolation tests in CI.
- **"Noisy neighbor"** on shared schema — mitigated by per-tenant rate limits, connection pooling, and read replicas; escalate hot tenants to dedicated resources.
- **Tax/shipping complexity per country** — start configurable, integrate specialist services later (Phase 3).
- **Scope creep** — the full feature catalog is large; the MVP line in §7 is the guardrail.

### Open questions
1. Billing model — do we charge per store, per org, usage-based, or transaction-fee? (Affects Phase 2 billing design.)
2. Do merchants need custom domains per store with managed TLS at MVP, or is a `store.platform.com` subdomain acceptable initially?
3. Search — start with Postgres full-text (cheaper) or commit to a search engine (Meilisearch/OpenSearch) at MVP?
4. Is a native mobile app needed at MVP, or is PWA sufficient until Phase 2?

> These four are the decisions most likely to change scope; recommend resolving 2 and 3 before Phase 1 starts.
