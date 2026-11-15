# Mercato handoff

## Project and repository

- Local checkout: `/Users/raslan/Projects/Personal/mercato`
- GitHub repository: `raslankiwan/Delta-Shopping-Backend` (private), matching the product description in the account's repository list.
- Mercato is a multi-tenant commerce monorepo: NestJS + GraphQL API, PostgreSQL/Drizzle with forced RLS, Redis, Next.js storefront, React/Vite admin, and Bun/Turborepo.
- Read `CLAUDE.md` first. It documents architecture, tenant safety invariants, stack commands, and the July 18 session note that REST was removed in favor of GraphQL.

## Conversation context found on this Mac

Claude Code has a long Mercato session (July 18, 2026) with multiple parallel UI/build workflows. The repo README, `CLAUDE.md`, docs, and code represent the consolidated result; the raw session contains verbose intermediate agent instructions and is not the source of truth.

The consolidated project describes a sellable path from staff signup/store provisioning and catalog through shopper cart, discounts, checkout, COD/provider skeletons, fulfilment, refunds, and reporting. Current code was substantially expanded from its early REST/catalog skeleton; confirm implementation and repository history rather than relying on older session descriptions.

## Current local setup

- `.env` is local-only and ignored; do not stage or print it. `.env.example` is safe to track after checking it contains placeholders only.
- Run with Bun and Docker. `bun run e2e` starts infra, migrates, seeds, and launches all apps; `bun run e2e:stop` stops them.
- API: `http://localhost:9000/v1` (health at `/v1/health`), storefront `http://localhost:9001/en`, admin `http://localhost:9002`.
- Demo credentials are documented in repository docs for local development only.

## Engineering rules

- Every tenant-owned row must carry `store_id`; enforce `ENABLE` and `FORCE ROW LEVEL SECURITY`, use the `app_user` role for API requests, and scope database work through `withStore`.
- Keep SQL migrations, Drizzle schema, `TENANT_TABLES`, and isolation tests aligned.
- Money is integer minor units, never floating point.
- GraphQL operations live in `packages/graphql/src/operations`; regenerate typed documents through codegen rather than hand-writing client query strings.
- The project guidance says never commit without an explicit user ask. This sync request supplied that authorization for the current initial repo state.

## Suggested next steps

1. Check Git status and read this checkout's latest commit history.
2. Run `bun run typecheck` and relevant package tests after the environment is available.
3. Review product docs and prioritize work from `docs/05-task-backlog.md` against the implemented checkout path.
4. Keep secrets, local database data, generated output, and uploaded media out of source control.
