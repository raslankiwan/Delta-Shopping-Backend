# Operations

## Deployment

- Vercel project: `delta-shopping`
- Database resource: `delta-shopping-db`, dedicated free MongoDB Atlas cluster in `fra1`.
- Database name: `delta_shopping` unless `MONGODB_DB` overrides it.
- `/api/health` verifies a real database ping; no credentials or server errors are returned.
- `/admin` has a public sign-in shell; every admin API independently checks a live database role.

GitHub automatic deployment is not yet connected. Add GitHub under Vercel account login connections, then connect `raslankiwan/Delta-Shopping-Backend` in project Git settings. Until then, use `vercel --prod` from the repo root. Do not archive the canonical monorepo.

## Promote an owner

After the owner registers with their own password, connect using an authorized database client and run against `delta_shopping`:

```js
db.users.updateOne({ email: 'owner@example.com', disabled: false }, { $set: { role: 'admin' } })
```

Use the actual account email; verify exactly one intended user matches first. Never assign roles based solely on a public signup request. There is no seeded administrator.

## Security

Passwords are salted scrypt hashes. Random session tokens are stored only as SHA-256 digests and expire after seven days. Cookies use HttpOnly, SameSite=Lax, and Secure in production. Mutation requests reject a foreign Origin. Login rate limits are stored in MongoDB with TTL cleanup. API responses are no-store. Disabled users lose sessions. Listing moderation is a recoverable hide action, recorded in an audit collection.

No database or session secrets are exposed to the browser. `.env*`, `.vercel`, dependencies, and generated output are ignored. Legacy Firebase and object-storage credentials in copied source were replaced with placeholders; the original history is retained in private Git tags. Original public `Shopping` history may contain object-storage credentials: rotate/revoke those keys with their provider. Archiving does not erase history.

## Backups and recovery

Original source histories are retained as `legacy/Shopping`, `legacy/DeltaShopping`, and `legacy/DeltaShoppingServer` Git tags. They can be checked out without unarchiving the old GitHub repositories. The canonical repo remains private, preserving the most restrictive source visibility.

Repository archival is reversible through GitHub repository settings. MongoDB free tier has no configured paid backup policy: export data regularly with `mongodump` and protect the export. Do not treat Git history as a database backup.

Sample data uses `seedKey` fields. Remove only explicitly selected sample records after reviewing their IDs; never drop a collection to clear examples.

## Commerce operations

The active app is now Delta Commerce. Platform administrators create stores and issue owner invitations; store owners are scoped memberships, not global administrator accounts. See `commerce.md` for roles and workflows, and `payment-connector.md` for bank integration setup.

The production maintenance job is `/api/commerce/maintenance`, protected with CRON_SECRET and scheduled daily at 03:00 UTC on the current Vercel plan. It reconciles expired card sessions with the provider before stock release. Do not remove its bearer authentication. No live payment connector or email provider is configured; their activation requires separate merchant/provider setup.

Run `SMOKE_BASE_URL=https://delta-shopping.vercel.app npm run smoke:commerce` to verify the actual deployment with isolated fixtures. The script removes only its own generated store/accounts/orders. The legacy `npm run smoke` remains a compatibility check for the old API.
