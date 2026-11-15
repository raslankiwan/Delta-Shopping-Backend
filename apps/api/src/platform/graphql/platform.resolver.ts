import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OperatorGuard } from '../operator.guard';
import { PlatformService } from '../platform.service';
import { OrganizationType } from './platform.types';

/**
 * Internal operator GraphQL surface. Thin — every operation delegates to the
 * existing PlatformService. Guarded by OperatorGuard, mirroring
 * PlatformController.
 */
@Resolver()
@UseGuards(OperatorGuard)
export class PlatformResolver {
  constructor(private readonly platform: PlatformService) {}

  @Query(() => [OrganizationType])
  organizations() {
    return this.platform.listOrganizations();
  }

  @Mutation(() => Boolean)
  async operatorSetStoreStatus(
    @Args('storeId') storeId: string,
    @Args('status') status: string,
  ) {
    await this.platform.setStoreStatus(storeId, status as 'active' | 'suspended');
    return true;
  }
}
