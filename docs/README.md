# Mercato — Multi-Tenant Commerce Platform · Spec Set

An end-to-end design specification and build plan for a multi-tenant online-commerce platform: one backend and one database serve many independent stores, with an admin dashboard (single- or multi-store), a web + PWA storefront, a shared API for native mobile, multi-language and multi-currency throughout, and full commerce features (catalog, pricing, promotions, inventory, orders, customers, reporting).

**Status:** draft for review · **Date:** 2026-06-19 · **Owner:** Raslan

---

## Key decisions (locked for this draft)

| Decision | Choice |
|----------|--------|
| **Multi-tenancy** | Shared database + shared schema + `store_id` discriminator, enforced by **PostgreSQL Row-Level Security**. DB-per-tenant is an enterprise option in Phase 3. |
| **Tenant boundary** | `Store` is the isolation unit; an `Organization` owns one or many stores (enables single- *and* multi-store admin). |
| **Scope** | Full platform specified; **delivery phased with a clearly marked MVP** (Phase 1) that is sellable. |
| **Stack** | TypeScript everywhere · **NestJS 11** API (modular monolith) · **PostgreSQL 18** · **Drizzle ORM** · **Redis 7** + BullMQ · **Next.js 16** storefront/PWA · **React + Vite** admin · **Expo SDK 56** mobile (P2) · **i18next** + `Intl`. |
| **API** | REST + OpenAPI 3.1, typed SDKs generated for all clients. |
| **Payments** | Stripe first, behind a provider-agnostic adapter (PCI SAQ-A). |

> These reflect the choices made at kickoff. The architecture doc records the rationale and the conditions under which each should be revisited (see ADR table in `02`).

---

## How to read this set

Read in order for the full picture; jump by role using the table below.

| # | Document | What it covers | Best for |
|---|----------|----------------|----------|
| — | `README.md` | This index + decisions at a glance | Everyone, start here |
| 01 | [`01-PRD.md`](01-PRD.md) | Vision, personas, user stories, full feature catalog, **phased roadmap**, non-functional requirements, success metrics, open questions | Product, stakeholders |
| 02 | [`02-architecture.md`](02-architecture.md) | Stack & rationale, **multi-tenancy/RLS design**, module decomposition, eventing, clients, i18n, search, caching, payments, security, observability, infra, monorepo layout, ADRs | Engineering, architects |
| 03 | [`03-data-model.md`](03-data-model.md) | Core ER model, key tables, translations pattern, indexing, **concrete RLS policies & isolation tests**, data lifecycle | Backend, DBA |
| 04 | [`04-api-spec.md`](04-api-spec.md) | API conventions, auth & tenant resolution, storefront/admin/operator endpoints, webhooks, examples | API consumers, frontend, integrators |
| 05 | [`05-task-backlog.md`](05-task-backlog.md) | **Sequenced subtasks** by epic across Phase 0→3, sizing, dependencies, critical path, staffing, DoD | Delivery, planning |

---

## The one-paragraph architecture

Clients (Next.js storefront/PWA, Expo mobile, React admin, third-party integrations) all talk to a single REST/OpenAPI backend built as a NestJS modular monolith. Each request resolves its **store** (from domain, token scope, or header), binds that `store_id` to the database session, and PostgreSQL **Row-Level Security** guarantees the request can only ever see that store's rows — isolation is enforced in the database, not just app code. State lives in Postgres (source of truth), Redis (cache/sessions/queues), and object storage (media). Domain events flow through a transactional outbox to drive search indexing, reporting, emails, and webhooks. Everything is localizable (i18next + per-locale content + `Intl` formatting) and priced per currency via price lists. The monolith is organized into clean modules so any one can later be extracted into its own service without a rewrite.

---

## What to resolve before Phase 1 starts

From `01-PRD.md §10` — the decisions most likely to change scope:

1. **Billing model** — per store / per org / usage / transaction fee? (drives the P2 billing epic)
2. **Custom domains at MVP** — managed TLS per store, or subdomains first?
3. **Search at MVP** — Postgres FTS first (recommended) or commit to a search engine now?
4. **Native app timing** — PWA-only at MVP (recommended) or Expo app in MVP?

Recommended answers are noted inline in the PRD; #2 and #3 are worth settling before kickoff.

---

## Next steps (not done in this round)

This round delivers the spec + backlog only. Natural follow-ups, when you're ready:
- Scaffold the monorepo (`apps/*`, `packages/*`) with the configs in `02 §16`.
- Stand up Phase 0 foundations (RLS framework `DB-4` + isolation tests `DB-6` first).
- Generate the OpenAPI skeleton and the shared typed SDK.

Just say the word and I'll start on any of these.
