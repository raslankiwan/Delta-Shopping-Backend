import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';
import * as schema from './schema';

export type Database = PostgresJsDatabase<typeof schema>;

export interface DbHandle {
  db: Database;
  client: Sql;
  close: () => Promise<void>;
}

/**
 * Create a Drizzle database bound to a connection URL.
 *
 * Use the APPLICATION url (role `app_user`, subject to RLS) for all tenant traffic.
 * Use the ADMIN url (role `app_owner`, BYPASSRLS) only for migrations, seeding, and
 * the isolation-test harness — never to serve a tenant request.
 */
export function createDb(url: string, options: postgres.Options<Record<string, never>> = {}): DbHandle {
  const client = postgres(url, { max: 10, ...options });
  const db = drizzle(client, { schema });
  return { db, client, close: () => client.end({ timeout: 5 }) };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

let appHandle: DbHandle | undefined;
let adminHandle: DbHandle | undefined;

/** The RLS-enforced application database (role `app_user`). Lazy singleton. */
export function appDb(): DbHandle {
  appHandle ??= createDb(requireEnv('DATABASE_URL'));
  return appHandle;
}

/** The privileged database (role `app_owner`, BYPASSRLS). Migrations/seeds/tests only. */
export function adminDb(): DbHandle {
  adminHandle ??= createDb(requireEnv('DATABASE_ADMIN_URL'));
  return adminHandle;
}
