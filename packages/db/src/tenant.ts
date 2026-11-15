import { sql } from 'drizzle-orm';
import type { Database } from './client';
import { isUuid } from '@mercato/core';

export type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

/**
 * Tenant context bound to a transaction. `store` scopes store-scoped tables via
 * `current_store_id()`; `organization` scopes org-scoped tables (staff, roles)
 * via `current_organization_id()`. Set whichever the work needs — often just one.
 */
export interface TenantContext {
  store?: string;
  organization?: string;
}

/**
 * Run a unit of work inside a tenant-bound transaction.
 *
 * Sets the requested context for the life of the transaction (via
 * `set_config(..., is_local => true)`, the parameterized equivalent of
 * `SET LOCAL`) and runs the callback on that same connection. Every query inside
 * is transparently filtered by RLS. Transaction-local, so it can never leak
 * across pooled connections (safe with transaction-mode pooling).
 *
 * The database passed here MUST be the `app_user` connection (RLS-enforced).
 * Passing the admin (BYPASSRLS) connection would defeat the isolation guarantee.
 */
export async function withContext<T>(
  db: Database,
  ctx: TenantContext,
  work: (tx: Tx) => Promise<T>,
): Promise<T> {
  if (ctx.store !== undefined && !isUuid(ctx.store)) {
    throw new Error(`withContext: store must be a UUID, got "${ctx.store}"`);
  }
  if (ctx.organization !== undefined && !isUuid(ctx.organization)) {
    throw new Error(`withContext: organization must be a UUID, got "${ctx.organization}"`);
  }
  return db.transaction(async (tx) => {
    if (ctx.store !== undefined) {
      await tx.execute(sql`select set_config('app.current_store_id', ${ctx.store}, true)`);
    }
    if (ctx.organization !== undefined) {
      await tx.execute(sql`select set_config('app.current_organization_id', ${ctx.organization}, true)`);
    }
    return work(tx);
  });
}

/** Convenience: run work bound to a single store. */
export function withStore<T>(db: Database, storeId: string, work: (tx: Tx) => Promise<T>): Promise<T> {
  return withContext(db, { store: storeId }, work);
}

/** Convenience: run work bound to a single organization. */
export function withOrg<T>(db: Database, organizationId: string, work: (tx: Tx) => Promise<T>): Promise<T> {
  return withContext(db, { organization: organizationId }, work);
}
