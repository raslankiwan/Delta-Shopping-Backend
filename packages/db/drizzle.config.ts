import { defineConfig } from 'drizzle-kit';

/**
 * drizzle-kit config — used for `studio` and future `generate` diffs.
 * Migrations in this repo are hand-authored SQL under ./drizzle (applied by
 * src/migrate.ts), so the DDL and the RLS policies stay in one reviewed place.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_ADMIN_URL ?? 'postgres://app_owner:owner_pass@localhost:5432/mercato',
  },
});
