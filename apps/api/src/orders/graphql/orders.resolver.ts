import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { StoreId } from '../../common/store-id.decorator';
import { AuthGuard } from '../../auth/auth.guard';
import { PermissionsGuard, RequirePermissions } from '../../auth/permissions';
import { OrdersService } from '../orders.service';
import {
  FulfillOrderInput,
  FulfillResultType,
  OrderDetailType,
  OrderListItemType,
  RefundOrderInput,
  RefundResultType,
} from './orders.types';

/**
 * Admin GraphQL surface for orders. Thin — every query/mutation delegates to
 * the existing OrdersService; no business logic lives here.
 */
@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class OrdersResolver {
  constructor(private readonly orders: OrdersService) {}

  @Query(() => [OrderListItemType], { name: 'orders' })
  @RequirePermissions('orders:read')
  async ordersList(
    @StoreId() storeId: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return (await this.orders.list(storeId, { status, limit })).data;
  }

  @Query(() => OrderDetailType, { name: 'order' })
  @RequirePermissions('orders:read')
  order(@StoreId() storeId: string, @Args('id') id: string) {
    return this.orders.get(storeId, id);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('orders:write')
  async cancelOrder(@StoreId() storeId: string, @Args('id') id: string) {
    await this.orders.cancel(storeId, id);
    return true;
  }

  @Mutation(() => RefundResultType)
  @RequirePermissions('orders:write')
  refundOrder(
    @StoreId() storeId: string,
    @Args('id') id: string,
    @Args('input') input: RefundOrderInput,
  ) {
    return this.orders.refund(storeId, id, input);
  }

  @Mutation(() => FulfillResultType)
  @RequirePermissions('orders:write')
  fulfillOrder(
    @StoreId() storeId: string,
    @Args('id') id: string,
    @Args('input') input: FulfillOrderInput,
  ) {
    return this.orders.fulfill(storeId, id, input);
  }
}
