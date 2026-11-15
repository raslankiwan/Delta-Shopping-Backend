# Build Backlog — Subtasks by Epic & Phase — Mercato

**Version:** 1.0 (draft) · **Date:** 2026-06-19 · Companion to all specs

This is the sequenced work breakdown. Epics group related tasks; tasks are sized and carry dependencies. Phases match `01-PRD.md §7`. Import-ready: each task is one issue/ticket.

**Sizing:** `S` ≤ 2 days · `M` ≈ 3–5 days · `L` ≈ 1–2 weeks · `XL` > 2 weeks (split before starting).
**Dependency notation:** `↳ after X.Y` means blocked by that task. The **critical path** runs through Phase 0 → core MVP commerce.

---

## Phase 0 — Foundations
*Goal: a provisioned, isolated "hello tenant" store with auth, CI/CD, and i18n scaffolding. Nothing user-facing sells yet.*

### EPIC FND — Repo & delivery
- `FND-1` Monorepo setup (pnpm + Turborepo, apps/packages skeleton). **S**
- `FND-2` Shared config packages (tsconfig, eslint, prettier, tailwind preset). **S** ↳ after FND-1
- `FND-3` CI pipeline: lint, typecheck, test, build (GitHub Actions). **M** ↳ after FND-1
- `FND-4` Dockerization + local dev stack (Postgres, Redis) via compose. **M**
- `FND-5` IaC baseline (Terraform: managed Postgres, Redis, object storage, container service). **L** ↳ after FND-4
- `FND-6` Staging + preview-env deploy with health-gated rollout. **M** ↳ after FND-3, FND-5

### EPIC DB — Database & tenancy core
- `DB-1` Drizzle setup, migration runner, forward-only policy. **S** ↳ after FND-1
- `DB-2` Base schema conventions (UUIDv7, money type, timestamps, soft delete). **S** ↳ after DB-1
- `DB-3` Organization + store + store_locale + store_currency tables. **M** ↳ after DB-2
- `DB-4` **RLS framework**: `app_user`/`app_owner` roles, `current_store_id()` helper, policy template. **L** ↳ after DB-3
- `DB-5` Transaction-scoped tenant context (SET LOCAL) + PgBouncer transaction pooling. **M** ↳ after DB-4
- `DB-6` **CI isolation test harness** (store A cannot read store B across all tables). **M** ↳ after DB-4
- `DB-7` Migration lint: fail build if a `store_id` table lacks an RLS policy. **S** ↳ after DB-6

### EPIC SEC — Identity, access, tenancy resolution
- `SEC-1` Staff auth: login, JWT access + rotating refresh, password reset. **L** ↳ after DB-3
- `SEC-2` Tenant resolution middleware (domain → store; token scope; X-Store-Id validation). **M** ↳ after DB-5, SEC-1
- `SEC-3` RBAC: roles, permissions matrix, store-scoped memberships, guards. **L** ↳ after SEC-1
- `SEC-4` Audit log (actor, store, action, before/after) + write hooks. **M** ↳ after SEC-3
- `SEC-5` API key issuance + scopes for integrations. **M** ↳ after SEC-3

### EPIC API — API framework
- `API-1` NestJS app skeleton, module boundaries, error model (problem+json). **M** ↳ after FND-1
- `API-2` OpenAPI generation + typed SDK build into packages/api-client. **M** ↳ after API-1
- `API-3` Cross-cutting: request-id, structured logging, pagination, idempotency, rate limiting. **L** ↳ after API-1
- `API-4` Validation pipeline (DTO/zod), CORS allow-list per store domain, security headers. **M** ↳ after API-1

### EPIC I18N — Internationalization scaffolding
- `I18N-1` i18next setup + ICU MessageFormat; shared `packages/i18n` catalogs. **M** ↳ after FND-2
- `I18N-2` `translation` table + resolution/fallback service. **M** ↳ after DB-4
- `I18N-3` `Intl`-based money/date/number formatting utilities; minor-unit money lib. **S** ↳ after DB-2
- `I18N-4` RTL strategy (logical CSS, dir switching) in shared UI package. **S** ↳ after FND-2

### EPIC OBS — Observability
- `OBS-1` OpenTelemetry tracing + metrics (RED per endpoint, per-tenant tags). **M** ↳ after API-3
- `OBS-2` Dashboards + alerting (error budget, DB connections, queue depth). **M** ↳ after OBS-1
- `OBS-3` Backups/PITR config + restore drill runbook. **M** ↳ after FND-5

**Phase 0 exit criteria:** provision an org + store via operator API; a request resolves its tenant and is RLS-isolated (proven by CI test); CI/CD deploys to staging; i18n + logging/tracing in place.

---

## Phase 1 — MVP (sellable)
*Goal: a merchant launches a real store, in multiple languages and currencies, and takes real orders.*

### EPIC PROV — Provisioning & store settings
- `PROV-1` Operator API: create organization, create store, suspend/resume. **M** ↳ after SEC-5, DB-3
- `PROV-2` Org owner onboarding flow (signup → org → first store wizard). **L** ↳ after PROV-1, SEC-1
- `PROV-3` Store settings: locales, currencies, timezone, policies, theme selection. **M** ↳ after PROV-1, I18N-2
- `PROV-4` Subdomain routing + (optional) custom domain mapping. **L** ↳ after SEC-2

### EPIC CAT — Catalog
- `CAT-1` Products + variants + options/values CRUD (admin API). **L** ↳ after API-2, DB-4
- `CAT-2` Categories + collections (manual) CRUD + product assignment. **M** ↳ after CAT-1
- `CAT-3` Media upload (signed URLs to object storage) + ordering/alt text. **M** ↳ after CAT-1
- `CAT-4` Product content translations (admin localize UI + API). **M** ↳ after CAT-1, I18N-2
- `CAT-5` CSV import/export (async job, validation report). **L** ↳ after CAT-1, JOBS-1
- `CAT-6` Storefront catalog read APIs (list, detail, category tree) localized/priced. **L** ↳ after CAT-1, PRC-1
- `CAT-7` Postgres FTS search (tsvector, GIN) per store. **M** ↳ after CAT-1

### EPIC PRC — Pricing & promotions (MVP)
- `PRC-1` Price lists per currency + variant prices (incl. scheduled/sale). **L** ↳ after CAT-1
- `PRC-2` Price resolution service (currency, schedule, fallback). **M** ↳ after PRC-1
- `PRC-3` Discount codes (%, fixed, free shipping) with limits + date windows. **L** ↳ after PRC-2
- `PRC-4` Cart discount application + validation. **M** ↳ after PRC-3, CART-1

### EPIC INV — Inventory (MVP, single location)
- `INV-1` Inventory items per SKU (single default location) + adjustments (audited). **M** ↳ after CAT-1
- `INV-2` Reservation on checkout start; commit on order; release on expiry/cancel. **L** ↳ after INV-1, CHK-1
- `INV-3` Back-order/pre-order policy per item. **S** ↳ after INV-1
- `INV-4` Low-stock report + threshold flag. **S** ↳ after INV-1

### EPIC CART — Cart & checkout
- `CART-1` Cart lifecycle (guest + customer), lines, totals, persistence. **L** ↳ after PRC-2
- `CHK-1` Checkout session (contact, addresses, shipping selection). **L** ↳ after CART-1
- `CHK-2` Tax (configurable rates) + shipping (flat/weight/free) calculation. **L** ↳ after CHK-1
- `CHK-3` Order placement (idempotent), number generation, totals snapshot. **L** ↳ after CHK-2, INV-2

### EPIC PAY — Payments
- `PAY-1` Payment provider interface (authorize/capture/refund/vault/verify). **M** ↳ after API-1
- `PAY-2` Stripe adapter + client-side hosted fields (SAQ-A). **L** ↳ after PAY-1
- `PAY-3` Processor webhook intake (signature verify, idempotent) → payment state. **M** ↳ after PAY-2
- `PAY-4` Capture on order; refund (full/partial) from admin. **M** ↳ after PAY-3, ORD-1

### EPIC ORD — Orders & fulfillment (MVP)
- `ORD-1` Order model + admin list/search/detail. **L** ↳ after CHK-3
- `ORD-2` Fulfillment (mark shipped, tracking) + status transitions. **M** ↳ after ORD-1
- `ORD-3` Order confirmation + status emails (localized templates). **M** ↳ after ORD-1, NOTIF-1
- `ORD-4` Cancel order + release inventory + refund hook. **M** ↳ after ORD-1, PAY-4

### EPIC CUST — Customers
- `CUST-1` Customer accounts (register/login, store-scoped), addresses. **L** ↳ after SEC-1
- `CUST-2` Storefront account area: profile, addresses, order history. **M** ↳ after CUST-1, ORD-1
- `CUST-3` Saved payment methods via processor vault. **M** ↳ after PAY-2, CUST-1

### EPIC RPT — Reporting (MVP)
- `RPT-1` Read-model/aggregation pipeline from order events. **L** ↳ after ORD-1, JOBS-1
- `RPT-2` Sales report (revenue, orders, AOV, conversion) with date range. **M** ↳ after RPT-1
- `RPT-3` Top products + inventory report. **M** ↳ after RPT-1
- `RPT-4` CSV export of reports. **S** ↳ after RPT-2

### EPIC JOBS — Async backbone
- `JOBS-1` BullMQ setup + worker app + retry/backoff + dead-letter. **M** ↳ after FND-4
- `JOBS-2` Transactional outbox + relay publisher. **L** ↳ after DB-4, JOBS-1
- `NOTIF-1` Email/SMS provider adapter + localized template rendering. **M** ↳ after JOBS-1, I18N-1

### EPIC SF — Storefront app (web + PWA)
- `SF-1` Next.js storefront skeleton, theming from store config, locale routing. **L** ↳ after CAT-6
- `SF-2` Product listing + detail pages (SSR/ISR), search UI. **L** ↳ after SF-1, CAT-7
- `SF-3` Cart + checkout UI incl. Stripe fields, promo entry. **XL → split** ↳ after SF-1, CHK-3, PAY-2
- `SF-4` Account pages (orders, addresses, profile). **M** ↳ after SF-1, CUST-2
- `SF-5` PWA: manifest, service worker, offline catalog cache, installability. **M** ↳ after SF-2
- `SF-6` Locale + currency switcher; RTL verification (Arabic/Hebrew). **M** ↳ after SF-1, I18N-4

### EPIC ADM — Admin dashboard
- `ADM-1` React+Vite admin shell: auth, **store switcher**, role-aware nav. **L** ↳ after SEC-3, PROV-3
- `ADM-2` Catalog management UI (products, variants, media, translations). **XL → split** ↳ after ADM-1, CAT-4
- `ADM-3` Pricing + promotions UI. **L** ↳ after ADM-1, PRC-3
- `ADM-4` Inventory UI + low-stock view. **M** ↳ after ADM-1, INV-4
- `ADM-5` Orders UI (list, detail, refund, fulfill). **L** ↳ after ADM-1, ORD-2, PAY-4
- `ADM-6` Customers UI. **M** ↳ after ADM-1, CUST-1
- `ADM-7` Reports UI (sales, products, inventory). **M** ↳ after ADM-1, RPT-2
- `ADM-8` Settings UI (locales, currencies, shipping, tax, staff, audit log). **L** ↳ after ADM-1, PROV-3

**Phase 1 exit criteria:** an org owner signs up, creates a store, adds localized products with multi-currency prices and a promo, configures tax/shipping, and a shopper completes a real Stripe checkout in their language/currency; the merchant sees the order, refunds it, and reads sales/inventory reports — all tenant-isolated.

---

## Phase 2 — Growth

### EPIC GROW
- `P2-1` Automatic promotions engine (BOGO, tiered, stacking rules, priority). **XL → split**
- `P2-2` Customer groups + B2B/group pricing tiers. **L** ↳ after PRC-1
- `P2-3` Multi-location / multi-warehouse inventory + transfers. **XL → split** ↳ after INV-1
- `P2-4` Returns / RMA workflow. **L** ↳ after ORD-1
- `P2-5` Draft/manual orders. **M** ↳ after ORD-1
- `P2-6` Cross-store roll-up reporting (authorized multi-store context). **L** ↳ after RPT-1
- `P2-7` Wishlists. **M** ↳ after CUST-1
- `P2-8` Public API hardening + outbound webhooks + delivery dashboard. **L** ↳ after JOBS-2, SEC-5
- `P2-9` Billing & plan management per organization (usage/limits, invoices). **XL → split**
- `P2-10` Localized SEO (hreflang, localized URLs, sitemaps, metadata). **M** ↳ after SF-2
- `P2-11` Search engine upgrade (Meilisearch/OpenSearch) via event indexing. **L** ↳ after CAT-7, JOBS-2
- `P2-12` **Native mobile app (Expo)** consuming the API; push notifications; OTA. **XL → split** ↳ after API-2, I18N-1
- `P2-13` Customer social login (OAuth) + staff SSO/OIDC. **L** ↳ after SEC-1

---

## Phase 3 — Advanced / enterprise

### EPIC ADV
- `P3-1` Gift cards + store credit. **L**
- `P3-2` Loyalty / rewards. **L**
- `P3-3` Product bundles & kits. **L**
- `P3-4` Carrier-rate integration (Shippo/EasyPost) behind adapter. **L**
- `P3-5` Tax-service integration (Avalara/TaxJar) behind adapter. **L**
- `P3-6` Custom report builder + scheduled email exports. **XL → split**
- `P3-7` **Database-per-tenant** routing for enterprise/compliance (tenant→datasource registry). **XL → split** ↳ after DB-4
- `P3-8` Data residency / region pinning. **L** ↳ after P3-7
- `P3-9` Theme builder / no-code storefront customization. **XL → split**
- `P3-10` Digital/downloadable products. **M**
- `P3-11` Multi-vendor extension exploration (spike). **M**

---

## Critical path & sequencing

```
FND-1 → DB-1 → DB-2 → DB-3 → DB-4 (RLS) → DB-5/DB-6   ← isolation proven
                         │
        API-1 ───────────┤
                         ▼
   SEC-1 → SEC-2/SEC-3 → PROV-1 → PROV-2
                         │
   CAT-1 → PRC-1 → CART-1 → CHK-1 → CHK-2 → CHK-3 → ORD-1 → reporting
                         │                    │
                  PAY-1 → PAY-2 → PAY-3 ──────┘
                         │
        Storefront (SF-*) and Admin (ADM-*) build on the APIs above
```

**`DB-4` (RLS framework) is the highest-leverage task** — almost everything depends on tenant isolation working correctly. Do it early, prove it with `DB-6`, and never merge a tenant table without its policy (`DB-7`).

## Suggested staffing (rough)
- **2 backend** (tenancy/commerce core), **2 frontend** (storefront + admin), **1 full-stack/infra** (Phase 0 + CI/CD + payments). Phase 2 adds **1 mobile** for Expo.
- Parallelization: once Phase 0 lands, catalog/pricing/checkout (backend) and storefront/admin shells (frontend) proceed in parallel against the OpenAPI contract.

## Definition of done (every task)
Tests (unit + integration), **RLS isolation covered** where data is touched, OpenAPI updated, i18n strings externalized, audit log on admin mutations, observability (logs/metrics), docs/changelog, code review, green CI.
