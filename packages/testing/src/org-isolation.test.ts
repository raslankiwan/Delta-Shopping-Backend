/**
 * Organization-scoped isolation test — the counterpart to the store-scoped RLS
 * test, for identity tables (staff_user, role, staff_membership, refresh_token).
 *
 * Binds a non-privileged (`app_user`) session to organization A via
 * `app.current_organization_id` and asserts org B's rows are invisible across
 * every org-scoped table. Also checks the org-read policy on `store` (an org sees
 * its own stores when org-bound).
 *
 * Run: `bun --env-file=.env test packages/testing/src/org-isolation.test.ts`
 */
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import postgres, { type Sql } from 'postgres';
import { ORG_TABLES, createDb, type DbHandle } from '@mercato/db';
import { cleanupIsolationFixture, seedIsolationFixture, type IsolationFixture } from './fixture';

const APP_URL = process.env.DATABASE_URL;
const ADMIN_URL = process.env.DATABASE_ADMIN_URL;
if (!APP_URL || !ADMIN_URL) {
  throw new Error('org-isolation test needs DATABASE_URL and DATABASE_ADMIN_URL.');
}

let admin: DbHandle;
let appSql: Sql;
let fx: IsolationFixture;

async function boundOrg<T>(orgId: string, run: (sql: Sql) => Promise<T>): Promise<T> {
  return appSql.begin(async (sql) => {
    await sql`select set_config('app.current_organization_id', ${orgId}, true)`;
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

describe('organization isolation (RLS)', () => {
  for (const table of ORG_TABLES) {
    test(`org A cannot see org B rows in "${table}"`, async () => {
      const countFor = async (org: string): Promise<number> => {
        const rows = (await admin.client.unsafe(
          `SELECT count(*)::int AS n FROM ${table} WHERE organization_id = $1`,
          [org],
        )) as unknown as Array<{ n: number }>;
        return rows[0]!.n;
      };
      expect(await countFor(fx.orgAId)).toBeGreaterThan(0);
      expect(await countFor(fx.orgBId)).toBeGreaterThan(0);

      const visible = (await boundOrg(fx.orgAId, (sql) =>
        sql.unsafe(`SELECT organization_id AS v FROM ${table}`),
      )) as unknown as Array<{ v: string }>;
      expect(visible.length).toBe(await countFor(fx.orgAId));
      expect(visible.every((r) => r.v === fx.orgAId)).toBe(true);
      expect(visible.some((r) => r.v === fx.orgBId)).toBe(false);
    });
  }

  test('org-bound session reads its own stores (store_org_read policy)', async () => {
    const stores = (await boundOrg(fx.orgAId, (sql) =>
      sql.unsafe(`SELECT id FROM store`),
    )) as unknown as Array<{ id: string }>;
    expect(stores.map((s) => s.id)).toEqual([fx.storeAId]);
  });

  test('org-bound session cannot see another org staff', async () => {
    const emails = (await boundOrg(fx.orgBId, (sql) =>
      sql.unsafe(`SELECT organization_id AS v FROM staff_user`),
    )) as unknown as Array<{ v: string }>;
    expect(emails.every((r) => r.v === fx.orgBId)).toBe(true);
  });
});
