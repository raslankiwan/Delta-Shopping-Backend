import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  store,
  storeCurrency,
  storeLocale,
  withContext,
  withOrg,
  type DbHandle,
} from '@mercato/db';
import { uuidv7 } from '@mercato/core';
import { DB_HANDLE } from '../db/database.module';
import { isUniqueViolation } from '../common/pg-errors';
import type { CreateStoreInput, UpdateStoreInput } from './dto';

@Injectable()
export class StoresService {
  constructor(@Inject(DB_HANDLE) private readonly app: DbHandle) {}

  /** Create a store within the owner's organization, with initial locales & currencies. */
  async createStore(organizationId: string, input: CreateStoreInput): Promise<{ id: string }> {
    const storeId = uuidv7();
    const locales = input.locales?.length ? input.locales : [input.defaultLocale];
    const currencies = input.currencies?.length ? input.currencies : [input.defaultCurrency];
    try {
      // Bind both org (authorizes the store row) and the new store (authorizes its
      // locale/currency child rows) for the life of one transaction.
      await withContext(this.app.db, { organization: organizationId, store: storeId }, async (tx) => {
        await tx.insert(store).values({
          id: storeId,
          organizationId,
          slug: input.slug,
          name: input.name,
          defaultLocale: input.defaultLocale,
          defaultCurrency: input.defaultCurrency,
          timezone: input.timezone,
        });
        await tx
          .insert(storeLocale)
          .values(locales.map((locale) => ({ storeId, locale, isDefault: locale === input.defaultLocale })));
        await tx
          .insert(storeCurrency)
          .values(
            currencies.map((currency) => ({
              storeId,
              currency,
              isDefault: currency === input.defaultCurrency,
            })),
          );
      });
    } catch (e) {
      if (isUniqueViolation(e)) {
        throw new ConflictException({ code: 'slug_taken', detail: `Store slug "${input.slug}" is taken.` });
      }
      throw e;
    }
    return { id: storeId };
  }

  async listStores(organizationId: string) {
    return withOrg(this.app.db, organizationId, async (tx) => {
      const rows = await tx
        .select({
          id: store.id,
          slug: store.slug,
          name: store.name,
          status: store.status,
          default_locale: store.defaultLocale,
          default_currency: store.defaultCurrency,
        })
        .from(store);
      return { data: rows };
    });
  }

  async updateStore(organizationId: string, id: string, input: UpdateStoreInput): Promise<void> {
    await withOrg(this.app.db, organizationId, async (tx) => {
      // org_read makes only this org's stores visible; a foreign id is simply not found.
      const [existing] = await tx.select({ id: store.id }).from(store).where(eq(store.id, id)).limit(1);
      if (!existing) throw new NotFoundException({ code: 'store_not_found', detail: `No store ${id}` });
      await tx
        .update(store)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(store.id, id));
    });
  }
}
