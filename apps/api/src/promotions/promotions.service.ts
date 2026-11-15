import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
import {
  discountCode,
  promotion,
  withStore,
  type DbHandle,
  type PromotionAction,
  type Tx,
} from '@mercato/db';
import { DB_HANDLE } from '../db/database.module';
import { isUniqueViolation } from '../common/pg-errors';
import { computeDiscount, type DiscountResult } from './discount';
import type { CreateDiscountCodeInput } from './dto';

export interface ResolvedDiscount extends DiscountResult {
  discountCodeId: string;
  code: string;
}

@Injectable()
export class PromotionsService {
  constructor(@Inject(DB_HANDLE) private readonly app: DbHandle) {}

  // --- admin -------------------------------------------------------------

  async createDiscountCode(storeId: string, input: CreateDiscountCodeInput): Promise<{ id: string }> {
    const action: PromotionAction = { type: input.type, value: input.value ?? 0 };
    try {
      return await withStore(this.app.db, storeId, async (tx) => {
        const [promo] = await tx
          .insert(promotion)
          .values({
            storeId,
            name: input.name ?? input.code,
            type: 'code',
            actions: action,
            startsAt: input.startsAt ? new Date(input.startsAt) : null,
            endsAt: input.endsAt ? new Date(input.endsAt) : null,
          })
          .returning({ id: promotion.id });
        const [code] = await tx
          .insert(discountCode)
          .values({
            storeId,
            promotionId: promo!.id,
            code: input.code.toUpperCase(),
            usageLimit: input.usageLimit,
            perCustomerLimit: input.perCustomerLimit,
          })
          .returning({ id: discountCode.id });
        return { id: code!.id };
      });
    } catch (e) {
      if (isUniqueViolation(e)) {
        throw new ConflictException({ code: 'code_taken', detail: `Discount code "${input.code}" already exists.` });
      }
      throw e;
    }
  }

  listDiscountCodes(storeId: string) {
    return withStore(this.app.db, storeId, async (tx) => {
      const rows = await tx
        .select({
          id: discountCode.id,
          code: discountCode.code,
          used_count: discountCode.usedCount,
          usage_limit: discountCode.usageLimit,
          status: discountCode.status,
          action: promotion.actions,
        })
        .from(discountCode)
        .innerJoin(promotion, eq(discountCode.promotionId, promotion.id));
      return { data: rows };
    });
  }

  // --- validation & resolution (tx-based; used by cart + checkout) --------

  /** Resolve a code to its discount for a subtotal, validating window + status + usage. */
  async validateAndResolve(tx: Tx, code: string, subtotalMinor: number): Promise<ResolvedDiscount> {
    const now = new Date();
    const [row] = await tx
      .select({
        id: discountCode.id,
        code: discountCode.code,
        status: discountCode.status,
        usedCount: discountCode.usedCount,
        usageLimit: discountCode.usageLimit,
        action: promotion.actions,
        promoStatus: promotion.status,
        startsAt: promotion.startsAt,
        endsAt: promotion.endsAt,
      })
      .from(discountCode)
      .innerJoin(promotion, eq(discountCode.promotionId, promotion.id))
      .where(eq(discountCode.code, code.toUpperCase()))
      .limit(1);

    if (!row) throw new NotFoundException({ code: 'code_not_found', detail: 'That code is not valid.' });
    if (row.status !== 'active' || row.promoStatus !== 'active') {
      throw new UnprocessableEntityException({ code: 'code_inactive', detail: 'That code is not active.' });
    }
    if (row.startsAt && row.startsAt > now) {
      throw new UnprocessableEntityException({ code: 'code_not_started', detail: 'That code is not active yet.' });
    }
    if (row.endsAt && row.endsAt < now) {
      throw new UnprocessableEntityException({ code: 'code_expired', detail: 'That code has expired.' });
    }
    if (row.usageLimit !== null && row.usedCount >= row.usageLimit) {
      throw new UnprocessableEntityException({ code: 'code_exhausted', detail: 'That code has reached its usage limit.' });
    }

    const result = computeDiscount(row.action as PromotionAction, subtotalMinor);
    return { ...result, discountCodeId: row.id, code: row.code };
  }

  /** Resolve a previously-applied code id (cart.discount_code_id) for display/checkout. */
  async resolveById(tx: Tx, discountCodeId: string, subtotalMinor: number): Promise<ResolvedDiscount | null> {
    const [row] = await tx
      .select({ code: discountCode.code, action: promotion.actions })
      .from(discountCode)
      .innerJoin(promotion, eq(discountCode.promotionId, promotion.id))
      .where(eq(discountCode.id, discountCodeId))
      .limit(1);
    if (!row) return null;
    const result = computeDiscount(row.action as PromotionAction, subtotalMinor);
    return { ...result, discountCodeId, code: row.code };
  }

  /** Atomically consume one use, respecting usage_limit. Throws 409 if exhausted. */
  async consume(tx: Tx, discountCodeId: string): Promise<void> {
    const updated = await tx
      .update(discountCode)
      .set({ usedCount: sql`${discountCode.usedCount} + 1` })
      .where(
        and(
          eq(discountCode.id, discountCodeId),
          or(isNull(discountCode.usageLimit), gt(discountCode.usageLimit, discountCode.usedCount)),
        ),
      )
      .returning({ id: discountCode.id });
    if (updated.length === 0) {
      throw new ConflictException({ code: 'code_exhausted', detail: 'That code has reached its usage limit.' });
    }
  }
}
