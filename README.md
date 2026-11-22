# Mercato — Multi-Tenant Commerce Platform

[![CI](https://github.com/raslankiwan/mercato/actions/workflows/ci.yml/badge.svg)](https://github.com/raslankiwan/mercato/actions/workflows/ci.yml)

One backend and one database serve many independent stores. Tenant isolation is
enforced in PostgreSQL with Row-Level Security, not just in application code.

- **Full spec:** [`docs/`](docs/) — PRD, architecture, data model, API, backlog.
- **Revised plan & this build:** [`docs/06-revised-plan.md`](docs/06-revised-plan.md)
- **Orchestration strategy:** [`docs/07-orchestration-plan.md`](docs/07-orchestration-plan.md)
- **History since 2019:** [`docs/history.md`](docs/history.md)

## Stack

TypeScript · Bun workspaces + Turborepo · NestJS API (modular monolith) ·
GraphQL (code-first Apollo) · PostgreSQL 18 + Drizzle ORM (RLS) · Redis 7 ·
Next.js storefront/PWA · React + Vite admin · i18next (Arabic first, RTL).

## Layout

```
mercato/
├─ apps/
│  ├─ api/          # NestJS backend (modular monolith)
│  ├─ storefront/   # Next.js web + PWA
│  └─ admin/        # React + Vite admin SPA
├─ packages/
│  ├─ core/         # Money, ids, Result, shared domain types + zod primitives
│  ├─ db/           # Drizzle schema, RLS policies, migrations, tenant context
│  ├─ graphql/      # Apollo Client factory + codegen'd typed operations
│  ├─ i18n/         # Arabic / English catalogs
│  ├─ testing/      # RLS isolation harness + fixtures
│  └─ config/       # shared eslint / prettier presets
├─ infra/           # docker-compose (Postgres 18 + Redis 7), role bootstrap
├─ scripts/         # dev.sh / stop.sh (one-command local stack)
└─ docs/            # spec set, revised plan, orchestration plan, history
```

## Quick start

One command does everything — infra, deps, migrate, seed, wire the demo store, and
start all three dev servers:

```bash
bun run e2e          # ./scripts/dev.sh  (Ctrl-C to stop)
bun run e2e:stop     # stop servers + containers (add --clean to wipe data)
```

Then open:
- **Storefront** — http://localhost:9001/en
- **Admin** — http://localhost:9002 (staff login `owner@demo.test` / `password123`)
- **API** — http://localhost:9000/v1 (health: `/v1/health`)

> Requires Docker (pulls `postgres:18` + `redis:7`) and Bun. The script reseeds a
> fresh demo org with two isolated stores on every run and re-points the storefront
> at the new store id automatically.

### Manual steps (what `e2e` runs under the hood)

```bash
bun install
cp .env.example .env
bun run infra:up        # Postgres 18 + Redis 7 (docker)
bun run db:migrate      # apply schema + RLS policies
bun run db:seed         # demo org + two isolated stores + demo owner
bun run typecheck && bun run lint
bun run test            # includes the RLS cross-tenant isolation test
bun run dev             # api + storefront + admin (Turborepo)
```

## The one rule that matters

Every business row carries `store_id`. Every tenant table has `FORCE ROW LEVEL
SECURITY` and a `tenant_isolation` policy keyed to `current_store_id()`. The API
connects as `app_user`, which **cannot** bypass RLS. A missing `WHERE` clause,
or even SQL injection, still cannot cross a tenant boundary. This is proven on
every CI run by the isolation test in `packages/testing`.

## History

Mercato grew out of a line of 2019–2021 catalog and shopping projects. Their
history, from July 2019, is part of this repository; see
[`docs/history.md`](docs/history.md).
