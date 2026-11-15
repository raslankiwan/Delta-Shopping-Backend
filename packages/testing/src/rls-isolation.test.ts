/**
 * Tenant isolation test — the platform's most important test.
 *
 * Seeds two independent tenants, binds a NON-privileged (`app_user`) session to
 * store A, and asserts that store B's rows are invisible across EVERY tenant
 * table, that writes cannot target another store (WITH CHECK), and that an
 * unbound session sees nothing (fail-closed). Iterates TENANT_TABLES so a new
 * tenant table is automatically covered — or fails loudly if its RLS is missing.
 *
 * Requires a running Postgres with the two-role model (see infra/postgres/init).
 * Run: `bun --env-file=.env test packages/testing/src/rls-isolation.test.ts`
 */
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import postgres, { type Sql } from 'postgres';
import { TENANT_TABLES, createDb, type DbHandle } from '@mercato/db';
import { cleanupIsolationFixture, seedIsolationFixture, type IsolationFixture } from './fixture';

const APP_URL = process.env.DATABASE_URL;
const ADMIN_URL = process.env.DATABASE_ADMIN_URL;

if (!APP_URL || !ADMIN_URL) {
  throw new Error(
    'RLS isolation test needs DATABASE_URL (app_user) and DATABASE_ADMIN_URL (app_owner). ' +
      'Start infra (`bun run infra:up`) and run migrations (`bun run db:migrate`) first.',
  );
}

let admin: DbHandle;
let appSql: Sql;
let fx: IsolationFixture;

/** Run a query with the session bound to a store (transaction-local, like SET LOCAL). */
async function bound<T>(storeId: string, run: (sql: Sql) => Promise<T>): Promise<T> {
  return appSql.begin(async (sql) => {
    await sql`select set_config('app.current_store_id', ${storeId}, true)`;
    return run(sql as unknown as Sql);
  }) as Promise<T>;
}

beforeAll(async () => {
  admin = createDb(ADMIN_URL!, { max: 1 });
  appSql = postgres(APP_URL!, { max: 2, onnotice: () => {} });
  fx = await seedIsolationFixture(admin.db);
});

afterAll(async () => {
  if (fx) await cleanupIsolationFixture(admin.db, fx);
  await admin?.close();
  await appSql?.end({ timeout: 5 });
});

describe('tenant isolation (RLS)', () => {
  for (const t of TENANT_TABLES) {
    test(`store A cannot see store B rows in "${t.name}"`, async () => {
      // For both `store_id` tables and the `store` table, the value to match is the store id.
      const aValue = fx.storeAId;
      const bValue = fx.storeBId;

      // Identifiers are quoted so reserved-word table names (e.g. "orders") are safe.
      const tbl = `"${t.name}"`;
      const col = `"${t.isolationColumn}"`;

      // Both tenants really do have rows here (proves the test isn't vacuous).
      const countFor = async (value: string): Promise<number> => {
        const rows = (await admin.client.unsafe(
          `SELECT count(*)::int AS n FROM ${tbl} WHERE ${col} = $1`,
          [value],
        )) as unknown as Array<{ n: number }>;
        return rows[0]!.n;
      };
      const adminA = await countFor(aValue);
      const adminB = await countFor(bValue);
      expect(adminA).toBeGreaterThan(0);
      expect(adminB).toBeGreaterThan(0);

      // Bound to A, the app sees exactly A's rows — no more, no fewer.
      const visible = (await bound(fx.storeAId, (sql) =>
        sql.unsafe(`SELECT ${col} AS v FROM ${tbl}`),
      )) as unknown as Array<{ v: string }>;
      expect(visible.length).toBe(adminA);
      expect(visible.every((r) => r.v === aValue)).toBe(true);
      expect(visible.some((r) => r.v === bValue)).toBe(false);
    });
  }

  test('organization is scoped to the owner of the current store', async () => {
    const visible = (await bound(fx.storeAId, (sql) =>
      sql.unsafe(`SELECT id FROM organization`),
    )) as unknown as Array<{ id: string }>;
    expect(visible.map((r) => r.id)).toEqual([fx.orgAId]);
  });

  test('an unbound session sees nothing (fail-closed)', async () => {
    const rows = (await appSql.unsafe(
      `SELECT count(*)::int AS n FROM product`,
    )) as unknown as Array<{ n: number }>;
    expect(rows[0]!.n).toBe(0);
  });

  test('WITH CHECK forbids writing a row that targets another store', async () => {
    await expect(
      bound(fx.storeAId, (sql) =>
        sql.unsafe(
          `INSERT INTO product (store_id, slug, title) VALUES ($1, 'cross-tenant', 'X')`,
          [fx.storeBId],
        ),
      ),
    ).rejects.toThrow();
  });
});
