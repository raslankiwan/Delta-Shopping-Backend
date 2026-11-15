import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { StoreId } from '../../common/store-id.decorator';
import { AuthGuard } from '../../auth/auth.guard';
import { PermissionsGuard, RequirePermissions } from '../../auth/permissions';
import { PromotionsService } from '../promotions.service';
import type { CreateDiscountCodeInput } from '../dto';
import { CreateDiscountCodeInputType, CreateDiscountCodeResultType, DiscountCodeType } from './promotions.types';

/**
 * Admin GraphQL surface for promotions. Thin — every operation delegates to
 * the existing PromotionsService. Mirrors the guards/permissions used by
 * PromotionsController.
 */
@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class PromotionsResolver {
  constructor(private readonly promotions: PromotionsService) {}

  @Query(() => [DiscountCodeType])
  @RequirePermissions('promotions:read')
  async discountCodes(@StoreId() storeId: string) {
    return (await this.promotions.listDiscountCodes(storeId)).data;
  }

  @Mutation(() => CreateDiscountCodeResultType)
  @RequirePermissions('promotions:write')
  createDiscountCode(
    @StoreId() storeId: string,
    @Args('input') input: CreateDiscountCodeInputType,
  ) {
    return this.promotions.createDiscountCode(storeId, input as unknown as CreateDiscountCodeInput);
  }
}
