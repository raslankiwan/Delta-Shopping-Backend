# Delta Commerce

An invitation-only multi-store commerce platform for Palestine, with configurable countries/currencies for expansion. Each store has its own storefront, categories, SKU variants, inventory, discounts, orders, customers, staff, and policies. Buyers use persistent carts, checkout, order tracking, verified reviews, and returns.

## Apps and shared code

- `apps/web`: responsive Next.js storefront at `/`, administrator dashboard at `/admin`, API at `/api`.
- `packages/domain`: shared types, input validation, categories, currencies, search escaping and money formatting.
- `packages/database`: pooled MongoDB client and indexes.
- `packages/server`: one authorization and business-logic layer used by all API routes.
- `packages/ui`: shared form and interface primitives.
- `legacy`: sanitized original Expo marketplace and Express prototype for reference, excluded from workspaces/builds. These native clients still use Firebase and are not supported clients of the new API.

## Run

Node 24 is used for development, CI, and deployment.

```sh
npm ci
cp .env.example .env.local
# Configure an isolated MongoDB database, or run: vercel env pull .env.local
npm run dev
```

Open http://localhost:3000. Set `MONGODB_URI` and optionally `MONGODB_DB` in `.env.local`. No credentials are needed for builds. Runtime requests require MongoDB.

```sh
npm run typecheck
npm test
npm run test:integration
npm run build
# Optional live deployment check (creates and cleans up isolated fixtures):
# SMOKE_BASE_URL=https://delta-shopping.vercel.app npm run smoke
```

Integration tests run an isolated temporary MongoDB process and download an official MongoDB test binary on first run. They never connect to the deployment database.

## Administration

Register a normal account through the app. An existing database administrator can promote the intended owner using the documented command in `docs/operations.md`. Public signup always creates members; there is no public admin bootstrap endpoint or default password.

Alternatively, `npm run admin:create` accepts a JSON object (`email`, `name`, `password`) on stdin, creating a new administrator with a salted scrypt password. Never pass passwords in command arguments or commit them. It refuses to overwrite an existing account.

## Deploy

One Vercel project serves the storefront, admin, and backend. The root `vercel.json` builds `apps/web` with workspace packages. MongoDB Atlas provides persistent storage; Vercel's MongoDB integration supplies `MONGODB_URI`.

```sh
vercel link --project delta-shopping
vercel --prod
```

The first deployment uses CLI because GitHub automatic deployment linking currently requires a GitHub Login Connection in Vercel account settings. CI validation runs in GitHub Actions independently.

See [requirements and migration](docs/migration.md), [API](docs/api.md), and [operations](docs/operations.md).

## Original marketplace compatibility

The cart is a saved selection, not a checkout. Buyers contact sellers to arrange payment and delivery, matching the original project. USD, JOD, and NIS are kept separate in totals. Chat is persistent inbox messaging with manual refresh, not WebSockets. Notifications are in-app; external email/push delivery is not configured. Images accept public HTTPS URLs with category fallbacks; direct uploads are not configured. Account recovery/email verification requires an email provider and remains future work.

Optional `npm run seed` inserts 8 clearly labeled sample catalog entries idempotently. These are not real offers and cannot be contacted. Existing Firebase accounts, messages, listings, and media have not been copied: the repository contains application source, not a database export. See the migration guide before importing live data.


## Commerce

Start with [the commerce guide](docs/commerce.md) and [payment connector contract](docs/payment-connector.md). The new storefronts use `/api/commerce`; legacy marketplace endpoints remain isolated for compatibility.

- Admin-only store creation and expiring owner/staff invitations.
- Independent storefronts at `/s/:slug`, with store-scoped categories and physical/digital/service catalogs.
- SKU variants, custom attributes, image uploads, stock control, low-stock alerts.
- Server-priced checkout, integer currency accounting, transactional stock/coupon reservations, idempotent orders.
- Cash on delivery, fulfillment/tracking, verified purchase reviews, returns, confirmed refunds, paid digital downloads.
- Owner analytics, customers, safe CSV exports, staff roles, policies and settings.
- Approved payment connector boundary, signed/replay-protected callbacks, provider reconciliation and scheduled maintenance.

**Card payments are not live:** Bank of Palestine merchant onboarding and its integration documentation/credentials are required. The app disables cards until an approved connector and each store's merchant reference are configured. GitHub/Vercel access does not provide a payment merchant account.

`node --env-file=.env.local --import tsx scripts/seed-commerce.ts` creates clearly labeled demo stores whose checkout is disabled. It does not create real owners or admin credentials. Historical Firebase data/native clients remain separate from this release.
