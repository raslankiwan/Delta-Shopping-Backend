# CLAUDE.md — Mercato

Guidance for working in this repo. Read before making changes; update after.

## What this is

Mercato is a **multi-tenant commerce platform**. One backend + one Postgres serve
many independent stores. Tenant isolation is enforced by **PostgreSQL Row-Level
Security**, not just app code. See `docs/` for the full spec set; `docs/06-revised-plan.md`
records what was built and why, `docs/07-orchestration-plan.md` the build strategy.

## Stack & toolchain

- **Bun** workspaces + **Turborepo**. Bun is the package manager AND runtime.
- **NestJS 11** API (modular monolith) on Bun · **PostgreSQL 18** + **Drizzle** (RLS)
  · **Redis 7** (later: BullMQ) · **Next.js 16** storefront · **React 19 + Vite** admin.
- **All client↔API traffic is GraphQL.** The API is a code-first Apollo Server
  (`@nestjs/graphql` + `@nestjs/apollo`) at `POST /graphql`; the apps use **Apollo
  Client** with typed operations from **`@mercato/graphql`** (graphql-codegen →
  `XxxDocument` TypedDocumentNodes). REST is retired — the only HTTP route left is
  `GET /v1/health`. File uploads go through a base64 `mediaUpload` mutation.
- **Arabic-default, bilingual (AR/EN + RTL)** via `@mercato/i18n`. Primary market is
  **Palestine (West Bank)**: ILS pricing (+JOD/USD), 16% VAT, governorate shipping,
  cash-on-delivery. See "Palestine market" below.
- TypeScript strict everywhere. Packages are **source-first**: `@mercato/*` export
  their `.ts` entrypoints; Bun and the bundlers transpile them. No per-package `dist`.

## Layout

```
apps/      api (NestJS + GraphQL) · storefront (Next) · admin (Vite)
packages/  core (Money/ids/Result/enums/palestine) · db (Drizzle schema + RLS + migrations)
           graphql (Apollo Client factory + codegen'd operations) · i18n (AR/EN catalogs)
           testing (RLS isolation harness) · config (eslint/prettier presets)
infra/     docker-compose (Postgres 18 + Redis 7) · postgres/init (two-role bootstrap)
scripts/   dev.sh (one-command e2e: infra → migrate → seed → run all) · stop.sh
docs/      spec set (01–05) + revised plan (06) + orchestration (07) + history.md
```

`@mercato/graphql` is the single home for client GraphQL: `.graphql` operation
documents in `src/operations/{storefront,admin}.graphql` → `bun run --cwd
packages/graphql codegen` (needs the API running) regenerates
`src/generated/graphql.ts`. Both apps import `createMercatoClient` + the typed
`XxxDocument`s from it. **Edit an operation → rerun codegen → the apps see new types.**

## Commands (run from repo root)

```bash
bun install
./scripts/dev.sh          # one command: infra up → migrate → seed → run api+storefront+admin
./scripts/stop.sh         # tear down

# or piecemeal:
bun run infra:up          # Postgres 18 + Redis 7 (needs Docker Hub access)
bun run db:migrate        # apply drizzle/*.sql (DDL + RLS) as app_owner
bun run db:seed           # demo Palestine org + two isolated stores (idempotent)
bun run typecheck         # turbo, all packages
bun run lint              # turbo, all packages (shared preset: @mercato/config/eslint)
bun test packages/core                                  # unit tests
bun --env-file=.env test packages/testing/src/rls-isolation.test.ts   # RLS proof
bun run --cwd packages/graphql codegen                  # regen typed ops (API must be up)
```

## Local ports (apps on 9xxx to avoid clashes; Postgres on default 5432)

| Service | Port |
|---------|------|
| API | 9000 (`/v1`) |
| Storefront | 9001 (`/ar` default, `/en`) |
| Admin | 9002 |
| Postgres (host) | 5432 |
| Redis (host) | 9003 |

API port is `API_PORT` in `.env`; the app URLs live in `.env` (`NEXT_PUBLIC_API_URL`,
`VITE_API_URL`) + `apps/storefront/package.json` (Next `-p`) + `apps/admin/vite.config.ts`;
DB/Redis host ports in `infra/docker-compose.yml` + `.env`.

## API surface (current)

**GraphQL-only** (`POST /graphql`, code-first). Each NestJS module exposes a **thin
resolver** (`src/*/graphql/*.ts`) over the existing service — resolvers hold no
business logic; `@ObjectType` field names are snake_case to mirror service output.
The `@StoreId` param decorator reads `X-Store-Id` and is the sole tenant selector;
the shared guards/decorators work under GraphQL via `getRequest(ctx)` (see
`common/request-context.ts`). Guards + RLS still enforce auth/RBAC/isolation.

Modules under `apps/api/src/`: `auth` (staff JWT + RBAC + refresh rotation),
`provisioning` (operator + org store creation), `catalog` (admin CRUD + storefront
read + FTS + **categories** + **product type/service**), `customers` (shopper
accounts + addresses), `inventory`, `checkout` (cart + idempotent order placement +
**payment method** + **governorate shipping**), `payments` (provider port:
**cod**/test/Stripe/**PalPay/JawwalPay/BankOfPalestine** skeletons), `orders`,
`promotions`, `reports`, `shipping` (**West Bank governorate zones** + Wassel carrier
skeleton), `media` (`mediaUpload`), plus the transactional `outbox`. Migrations
`0000`–`0011` in `packages/db/drizzle/`.

The sellable path works end-to-end: signup → create store → add catalog (physical/
digital/service, categorized) → shopper adds to cart → applies a discount → checks
out (stock reserved, governorate shipping quoted, COD authorized or gateway captured,
order placed, idempotent) → merchant fulfils/refunds/reports.

## The tenancy model — the one thing to get right

- Every business row carries `store_id`. Every tenant table has `ENABLE` + **`FORCE`**
  RLS and a default-deny `tenant_isolation` policy keyed to `current_store_id()`.
- **Two DB roles:** `app_owner` (BYPASSRLS — migrations/seeds/tests only) and
  `app_user` (no BYPASSRLS — ALL tenant traffic). The API connects as `app_user`.
- Bind the tenant with **`withStore(db, storeId, fn)`** (packages/db): opens a
  transaction, `set_config('app.current_store_id', …, true)`, runs the work. Every
  query inside is transparently store-scoped. Never serve tenant traffic on `app_owner`.
- **Adding a tenant table?** Add it to `TENANT_TABLES` in `packages/db/src/schema`,
  give it `store_id` + FK to `store(id) ON DELETE CASCADE`, and RLS (enable+force+policy).
  The isolation test iterates `TENANT_TABLES` and will fail if a table isn't covered.

## Conventions

- **Money is never a float.** Integer minor units + ISO-4217, via `Money` (`@mercato/core`).
  Exponents: most currencies 2, `JOD`/`KWD`/… 3, `JPY`/… 0. ILS is the default currency.
- **One zod schema → DTO type.** `dto.ts` per domain holds the zod schemas; services +
  GraphQL resolvers share those types. GraphQL enforces required/typed inputs at the
  schema layer; resolvers are thin and delegate straight to services.
- **Migrations are forward-only** hand-authored SQL in `packages/db/drizzle/`, applied
  by `src/migrate.ts` (tracked in `_migrations`). Keep the Drizzle schema (`src/schema/*`)
  **and** `TENANT_TABLES`/`tables` (`src/schema/index.ts`) in sync with the SQL.
- **Adding client-facing data?** Add/adjust the operation in `packages/graphql/src/operations`,
  rerun codegen, then use the new `XxxDocument`/types in the apps. Don't hand-write query strings.
- Never commit without an explicit ask.

## Palestine market

The primary market is the West Bank; sane defaults + reference data live in
`@mercato/core`'s `palestine.ts` (governorates, VAT bps, currencies, payment methods).
- **Currency** ILS default (+JOD/USD) per store (`store.default_currency`,
  `store_currency`). **VAT** 16% via `store.tax_rate_bps` (1600); checkout adds it.
- **Products** have a `type` (physical|digital|service); digital/service set
  `requires_shipping=false` and skip shipping. Services carry duration + location.
  Categories are a `category` table (`product.category_id`).
- **Shipping** is a flat rate per West Bank governorate (`shipping_zone`, keyed to a
  governorate code); checkout resolves the rate from `shippingAddress.governorate`.
  `ShippingService.quoteInTx` does the math; `WasselCarrier` is a courier skeleton.
- **Payments** default to **cash on delivery** (`CashOnDeliveryProvider` → order stays
  `financial_status='pending'` until collected). PalPay/JawwalPay/BankOfPalestine are
  gateway skeletons that activate when their API key env var is set (like Stripe).

## Lint

Every TypeScript workspace has an `eslint.config.js` that re-exports the shared preset
from `@mercato/config/eslint` and lists `eslint` as its own devDependency (Bun only links
binaries of a workspace's direct dependencies). The API uses the `nest` variant, which
keeps injected classes as value imports so decorator metadata (and DI) keeps working.
The storefront lints with ESLint on `eslint-config-next`'s flat configs (Next 16 removed
`next lint`); the admin keeps its own React config. Generated GraphQL code is ignored.

## Local stack notes

Real `postgres:18` runs on host :5432 via `infra/docker-compose.yml`. The `uuidv7()` shim
in `drizzle/0000_compat.sql` stays (native on PG18). The demo seed is the Palestine org
(`owner@demo.test` / `password123`, local only).

## History

This repo holds the whole line of work from 2019: the earlier shopping projects were
joined in as history and are reachable through `legacy/*` tags. None of that code is in
the current tree; see `docs/history.md` before reaching for it.
