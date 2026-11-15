import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { StoreId } from '../../common/store-id.decorator';
import { AuthGuard } from '../../auth/auth.guard';
import { PermissionsGuard, RequirePermissions } from '../../auth/permissions';
import { ReportsService } from '../reports.service';
import { InventoryReportType, SalesReportType, TopProductType } from './reports.types';

/**
 * Admin GraphQL surface for reports. Thin — every query delegates to the
 * existing ReportsService. Mirrors the guards/permissions used by
 * ReportsController.
 */
@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
@RequirePermissions('reports:read')
export class ReportsResolver {
  constructor(private readonly reports: ReportsService) {}

  @Query(() => SalesReportType)
  reportSales(
    @StoreId() storeId: string,
    @Args('from', { nullable: true }) from?: string,
    @Args('to', { nullable: true }) to?: string,
  ) {
    return this.reports.sales(storeId, from, to);
  }

  @Query(() => [TopProductType])
  async reportTopProducts(
    @StoreId() storeId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return (await this.reports.topProducts(storeId, limit)).data;
  }

  @Query(() => InventoryReportType)
  reportInventory(@StoreId() storeId: string) {
    return this.reports.inventory(storeId);
  }
}
