import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../../auth/auth.guard';
import { PermissionsGuard, RequirePermissions } from '../../auth/permissions';
import { CurrentPrincipal, type Principal } from '../../auth/principal';
import { StoresService } from '../stores.service';
import type { CreateStoreInput, UpdateStoreInput } from '../dto';
import { CreateStoreInputType, CreateStoreResultType, StoreType, UpdateStoreInputType } from './stores.types';

/**
 * Org-level store management GraphQL surface (no @StoreId — operates over
 * the caller's org, mirroring StoresController). Thin — every operation
 * delegates to the existing StoresService.
 */
@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class StoresResolver {
  constructor(private readonly stores: StoresService) {}

  @Query(() => [StoreType], { name: 'stores' })
  @RequirePermissions('store:read')
  async listStores(@CurrentPrincipal() principal: Principal) {
    return (await this.stores.listStores(principal.organizationId)).data;
  }

  // Alias requested alongside `stores`; same org-scoped listing (no separate
  // service method exists for a distinct "admin" view).
  @Query(() => [StoreType])
  @RequirePermissions('store:read')
  async adminStores(@CurrentPrincipal() principal: Principal) {
    return (await this.stores.listStores(principal.organizationId)).data;
  }

  @Mutation(() => CreateStoreResultType)
  @RequirePermissions('store:write')
  createStore(
    @CurrentPrincipal() principal: Principal,
    @Args('input') input: CreateStoreInputType,
  ) {
    return this.stores.createStore(principal.organizationId, input as unknown as CreateStoreInput);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('store:write')
  async updateStore(
    @CurrentPrincipal() principal: Principal,
    @Args('id') id: string,
    @Args('input') input: UpdateStoreInputType,
  ) {
    await this.stores.updateStore(principal.organizationId, id, input as unknown as UpdateStoreInput);
    return true;
  }
}
