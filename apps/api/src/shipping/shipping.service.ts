import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { shippingZone, store, withStore, type DbHandle, type Tx } from '@mercato/db';
import { DB_HANDLE } from '../db/database.module';

export interface ShippingZoneView {
  id: string;
  governorate: string;
  name: string;
  rate: { amount_minor: number; currency: string };
  cod_available: boolean;
  eta_days: number | null;
  enabled: boolean;
}

export interface ShippingQuote {
  amountMinor: number;
  codAvailable: boolean;
}

/**
 * Resolves shipping cost and COD availability for an order from the destination
 * governorate. A digital/service-only cart ships nothing (rate 0). If no zone is
 * configured for the governorate, falls back to the store's flat shipping rate.
 */
@Injectable()
export class ShippingService {
  constructor(@Inject(DB_HANDLE) private readonly handle: DbHandle) {}

  async listZones(storeId: string): Promise<ShippingZoneView[]> {
    return withStore(this.handle.db, storeId, async (tx) => {
      const [s] = await tx.select({ currency: store.defaultCurrency }).from(store).limit(1);
      const currency = s?.currency ?? 'ILS';
      const rows = await tx.select().from(shippingZone).orderBy(asc(shippingZone.name));
      return rows.map((z) => ({
        id: z.id,
        governorate: z.governorate,
        name: z.name,
        rate: { amount_minor: z.rateMinor, currency },
        cod_available: z.codAvailable,
        eta_days: z.etaDays,
        enabled: z.enabled,
      }));
    });
  }

  /**
   * In-transaction quote used by checkout. `requiresShipping` is false when every
   * cart line is digital/service — then shipping is free and COD is still allowed.
   */
  static async quoteInTx(
    tx: Tx,
    governorate: string | undefined,
    requiresShipping: boolean,
    fallbackMinor: number,
  ): Promise<ShippingQuote> {
    if (!requiresShipping) return { amountMinor: 0, codAvailable: true };
    if (governorate) {
      const [z] = await tx
        .select({ rate: shippingZone.rateMinor, cod: shippingZone.codAvailable, enabled: shippingZone.enabled })
        .from(shippingZone)
        .where(and(eq(shippingZone.governorate, governorate), eq(shippingZone.enabled, true)))
        .limit(1);
      if (z) return { amountMinor: z.rate, codAvailable: z.cod };
    }
    return { amountMinor: fallbackMinor, codAvailable: true };
  }
}
