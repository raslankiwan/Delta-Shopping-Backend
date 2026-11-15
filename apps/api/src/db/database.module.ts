import { Global, Module, type OnModuleDestroy, Inject } from '@nestjs/common';
import { adminDb, appDb, type DbHandle } from '@mercato/db';

/** RLS-enforced application database handle (role `app_user`). Serves tenant traffic. */
export const DB_HANDLE = Symbol('DB_HANDLE');

/**
 * Privileged database handle (role `app_owner`, BYPASSRLS). Injected ONLY into
 * operator-level operations that create tenants (provisioning, owner signup),
 * where there is no tenant context to bind yet. Never use it to serve tenant traffic.
 */
export const DB_ADMIN_HANDLE = Symbol('DB_ADMIN_HANDLE');

@Global()
@Module({
  providers: [
    { provide: DB_HANDLE, useFactory: (): DbHandle => appDb() },
    { provide: DB_ADMIN_HANDLE, useFactory: (): DbHandle => adminDb() },
  ],
  exports: [DB_HANDLE, DB_ADMIN_HANDLE],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(
    @Inject(DB_HANDLE) private readonly handle: DbHandle,
    @Inject(DB_ADMIN_HANDLE) private readonly adminHandle: DbHandle,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await Promise.allSettled([this.handle.close(), this.adminHandle.close()]);
  }
}
