import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { organization, store, type DbHandle } from '@mercato/db';
import { DB_ADMIN_HANDLE } from '../db/database.module';

/**
 * Operator-level, cross-tenant operations. Uses the privileged handle
 * (BYPASSRLS) because it acts across all organizations by design.
 */
@Injectable()
export class PlatformService {
  constructor(@Inject(DB_ADMIN_HANDLE) private readonly admin: DbHandle) {}

  listOrganizations() {
    return this.admin.db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        plan: organization.plan,
        billing_status: organization.billingStatus,
      })
      .from(organization);
  }

  async setStoreStatus(storeId: string, status: 'active' | 'suspended'): Promise<void> {
    const res = await this.admin.db
      .update(store)
      .set({ status, updatedAt: new Date() })
      .where(eq(store.id, storeId))
      .returning({ id: store.id });
    if (res.length === 0) {
      throw new NotFoundException({ code: 'store_not_found', detail: `No store ${storeId}` });
    }
  }
}
