import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { StoreId } from '../../common/store-id.decorator';
import { AuthGuard } from '../../auth/auth.guard';
import { PermissionsGuard, RequirePermissions } from '../../auth/permissions';
import { InventoryService } from '../inventory.service';
import {
  AdjustInventoryInput,
  CreateLocationInputType,
  CreateLocationResultType,
  InventoryAdjustResultType,
  InventoryItemType,
  LocationType,
  LowStockItemType,
} from './inventory.types';

/**
 * Admin GraphQL surface for inventory. Thin — every query/mutation delegates
 * to the existing InventoryService; no business logic lives here.
 */
@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class InventoryResolver {
  constructor(private readonly inventory: InventoryService) {}

  @Query(() => [InventoryItemType], { name: 'inventory' })
  @RequirePermissions('inventory:read')
  async inventoryList(@StoreId() storeId: string) {
    return (await this.inventory.listInventory(storeId)).data;
  }

  @Query(() => [LowStockItemType], { name: 'inventoryLowStock' })
  @RequirePermissions('inventory:read')
  async inventoryLowStock(@StoreId() storeId: string) {
    return (await this.inventory.lowStock(storeId)).data;
  }

  @Query(() => [LocationType])
  @RequirePermissions('inventory:read')
  async locations(@StoreId() storeId: string) {
    return (await this.inventory.listLocations(storeId)).data;
  }

  @Mutation(() => InventoryAdjustResultType)
  @RequirePermissions('inventory:write')
  inventoryAdjust(@StoreId() storeId: string, @Args('input') input: AdjustInventoryInput) {
    return this.inventory.adjust(storeId, input);
  }

  @Mutation(() => CreateLocationResultType)
  @RequirePermissions('inventory:write')
  createLocation(@StoreId() storeId: string, @Args('input') input: CreateLocationInputType) {
    return this.inventory.createLocation(storeId, input);
  }
}
