# Revised Plan & Improvements — Mercato

**Version:** 1.1 · **Date:** 2026-07-17 · Supersedes decisions in `README.md` / `01-PRD.md §10`

This document records the improvements made to the v1.0 spec set and the concrete
build executed in the first implementation session. The v1.0 documents (`01`–`05`)
remain the reference for vision, architecture, data model, API, and backlog.

---

## 1. Decisions locked (previously open)

| # | Question (from `01-PRD.md §10`) | Decision |
|---|----------------------------------|----------|
| 1 | Billing model | **Deferred to Phase 2.** Not on the MVP critical path. |
| 2 | Custom domains at MVP | **Subdomains first.** `store.platform.com`; managed custom-domain TLS is Phase 2. Removes cert/DNS complexity from MVP. |
| 3 | Search at MVP | **Postgres FTS.** `tsvector` + GIN, `simple` config (language-agnostic). Meilisearch/OpenSearch stays Phase 2. |
| 4 | Native app at MVP | **Open.** PWA is the guaranteed MVP surface; whether the Expo app ships in MVP is undecided and does not affect the catalog slice. Revisit before the storefront epic closes. |

**Toolchain change from spec:** the monorepo uses **Bun workspaces + Turborepo**
(the spec said pnpm). Bun is the package manager and runtime; the API is written
Node-compatible so a fallback to Node is a one-line change. All packages are
**source-first** (workspace packages export their `.ts` entrypoints; Bun and the
bundlers transpile them) — no per-package `dist` build, which removes the classic
monorepo TS-emit friction.

---

## 2. Improvements over v1.0

These harden the parts that are cheap to get right early and expensive to retrofit.

1. **RLS lives beside the schema, with a registry.** Every tenant table is listed
   once in `packages/db`'s `TENANT_TABLES`. Both the isolation test and (future)
   the CI RLS-presence check iterate that list, so a new tenant table cannot be
   added without being covered by the isolation guarantee. Policies are
   `ENABLE` + **`FORCE`** + default-deny, keyed to `current_store_id()`.

2. **Native `uuidv7()` (Postgres 18).** PKs default to the database's built-in
   `uuidv7()` — time-ordered, index-friendly, zero app dependency. (The v1.0 data
   model assumed app-generated v7 ids.)

3. **One zod schema → DTO type + validation.** Request bodies are validated by a
   small `ZodValidationPipe`; the same schema yields the TypeScript type. No drift
   between the type, the validation, and (later) the OpenAPI schema. `nestjs-zod`
   + full OpenAPI generation is a clean follow-up once the surface stabilizes.

4. **The isolation test is a day-one, real-Postgres citizen.** `packages/testing`
   seeds two independent tenants and asserts, across every tenant table, that a
   non-privileged (`app_user`) session bound to store A sees exactly A's rows,
   that an unbound session sees nothing (fail-closed), and that `WITH CHECK`
   forbids writing a row targeting another store.

5. **`Money` value object.** `packages/core` `Money` — integer minor units +
   ISO-4217, currency-mismatch guard, `allocate()` that never loses units,
   `Intl` formatting. Money is never a float anywhere.

6. **Tenant context via `withStore(db, storeId, fn)`.** Opens a transaction, sets
   `app.current_store_id` transaction-locally (`set_config(..., true)` — the
   parameterized `SET LOCAL`), and runs the work on that connection. Safe with
   transaction-mode pooling; isolation cannot leak across pooled connections.

7. **Two-role database model, enforced.** `app_owner` (BYPASSRLS) runs migrations,
   seeds, and the test harness; `app_user` (no BYPASSRLS) serves all tenant
   traffic and can never escape RLS. Bootstrapped by `infra/postgres/init` locally
   and by a `psql` step in CI (GitHub service containers can't mount the init dir).

8. **`packages/testing` added** to the layout (absent from the v1.0 monorepo map):
   shared fixtures + the isolation harness.

---

## 3. What this session built — Phase 0 + catalog vertical slice

**Foundation**
- Bun workspaces + Turborepo; shared `tsconfig.base.json`, `@mercato/config`
  (eslint/prettier presets); `infra/docker-compose.yml` (Postgres 18 + Redis 7);
  `.env.example`; root scripts (`infra:up`, `db:migrate`, `db:seed`, `test`, `dev`).

**Packages**
- `@mercato/core` — `Money`, `uuidv7`, `Result`, currency/locale zod schemas +
  RTL helpers, catalog enums. (Unit-tested.)
- `@mercato/db` — Drizzle schema for the catalog slice (organization, store,
  store_locale, store_currency, product, product_option, product_option_value,
  product_variant, price_list, price, translation); hand-authored SQL migrations
  (DDL + `current_store_id()` + RLS + grants); `withStore`; app/admin clients;
  seed (one org, **two isolated stores**).
- `@mercato/testing` — isolation fixture + the cross-tenant RLS test.

**Apps**
- `apps/api` (NestJS 11 on Bun) — global `v1` prefix, problem+json filter,
  request-id, CORS; `TenantMiddleware` (X-Store-Id → `withStore`); **Catalog**
  module: admin CRUD (products, variants, prices) + storefront read
  (list, detail, FTS search) with per-locale titles and per-currency prices;
  `/v1/health`.
- `apps/storefront` (Next.js 16) and `apps/admin` (React 19 + Vite) — skeletons
  wired to the catalog API (scaffolded in parallel by subagents).

**Verified by:** workspace typecheck green; the RLS isolation test passing against
a real Postgres 18; API health + catalog endpoints exercised end-to-end.

---

## 3a. Build progress (autonomous slices)

Delivered and verified (typecheck + real-Postgres isolation tests + live API smoke) after the initial foundation:

| Slice | What shipped | Migration |
|-------|--------------|-----------|
| **Identity & Access** | staff auth (argon2 + JWT via jose), refresh rotation + reuse detection, RBAC guard, org-scoped RLS (`current_organization_id` + `withOrg`), `SECURITY DEFINER` pre-auth lookups, api_key/audit_log | `0002_identity` |
| **Provisioning** | operator API (token-guarded suspend/resume, org list), org-owner store creation via org-scoped RLS policies, full signup→store→catalog loop | `0003_provisioning` |
| **Customers** | store-scoped shopper accounts, customer JWT, register/login, profile + addresses, cross-store token pinning | `0004_customers` |
| **Inventory** | locations, inventory_item (on_hand/reserved), movement audit, admin adjustments + low-stock, reserve/commit/release helpers for checkout | `0005_inventory` |
| **Cart & Checkout** | guest/customer cart, line management, checkout that atomically reserves stock → captures payment → writes order → commits stock → closes cart; per-store order numbering; tax/shipping; **idempotent (no double-charge)** | `0006_commerce` |
| **Payments** | provider-agnostic port; test provider (works without keys); Stripe adapter skeleton (wired when `STRIPE_SECRET_KEY` set) | — |
| **Orders & fulfillment** | admin list/detail; fulfill (tracking); refund (full/partial); cancel → refund + restock | `0006_commerce` |
| **Promotions** | discount codes (percentage/fixed/free-shipping) with usage limits + windows; cart apply/remove; checkout applies discount (tax on discounted subtotal) + atomically consumes | `0007_promotions` |
| **Async + Reporting** | transactional outbox (`order.created` written in the order txn); sales / top-products / inventory reports. BullMQ worker + email delivery deferred (need Redis) | `0008_outbox` |
| **`@mercato/api-client` SDK** | typed client covering auth/storefront/cart/checkout/account/admin; shared by both apps | — |
| **Storefront UI** | Next 16 app — catalog, product detail, cart (qty/discount/totals, live badge), checkout, account — verified browser→API→RLS Postgres | — |
| **Admin dashboard** | React+Vite — staff login (RBAC), store switcher, catalog CRUD, orders (fulfil/refund/cancel), inventory, promotions, reports — verified live | — |

Isolation coverage: **32 store-scoped tables + 4 org-scoped tables**, all asserted on every test run (36 isolation tests, ~155 assertions). The two UIs were built in parallel by a Workflow fan-out (two Sonnet subagents) against the SDK, then verified in-browser (add-to-cart, login, store switch, reports all exercised).

## 3b. Feature additions (post-MVP)

| Feature | What shipped | Migration |
|---------|--------------|-----------|
| **Arabic-first i18n** | `@mercato/i18n` (AR/EN catalogs + `createT`/`dir`); Arabic is the default locale; storefront **and** admin fully bilingual with a locale switcher and genuine **RTL** (logical CSS, mirrored layouts); product content localized via the `translation` table; `/storefront/config` exposes supported locales/currencies | — (seed) |
| **Product details** | multiple **images** (local upload → `/uploads`, served static), **options → variant matrix** (Size×Color cartesian generation), **compare-at** ("was") pricing, **vendor + tags**, per-locale **subtitle + SEO**; storefront PDP gallery + size/color selector + strikethrough; admin product editor (images, options, variants, prices, AR/EN content) | `0009_product_details` |

Isolation coverage now: **33 store-scoped + 4 org-scoped tables**. Both features'
UIs were built by parallel Workflow fan-outs (Sonnet subagents) against the typed
SDK + `@mercato/i18n`, verified in-browser (Arabic RTL storefront + admin; Size×Color
variant matrix with compare-at).

### Deferred to follow-up (not blocking the sellable MVP)
- BullMQ relay/worker + localized email delivery (need Redis; Docker Hub was unreachable this session).
- Stripe adapter implementation (skeleton + selection wired; needs the Stripe SDK + keys).
- Minor: the admin promotions form treats a **fixed** discount's value as major units while the API stores fixed values as minor units — reconcile before using fixed-amount codes (percentage/free-shipping are correct and verified).
- OpenAPI JSON/Swagger UI generation (the hand-authored SDK covers the contract today).

## 4. Deliberately deferred (next sessions)

- Auth (staff JWT + refresh), RBAC, audit log — `SEC-*`.
- Provisioning/onboarding + operator API — `PROV-*`.
- Cart → checkout → payments (Stripe adapter) → orders — the rest of the MVP
  commerce core.
- OpenAPI generation + typed `@mercato/api-client` package for the frontends.
- CI RLS-presence lint (`DB-7`): fail the build if a `store_id` table lacks a
  policy — the `TENANT_TABLES` registry already makes this a small check.
- `@mercato/i18n` shared catalogs; storefront/admin real UI.
