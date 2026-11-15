import { Query, Resolver } from '@nestjs/graphql';
import { StoreId } from '../../common/store-id.decorator';
import { ShippingService } from '../shipping.service';
import { ShippingZoneType } from './shipping.types';

/**
 * Storefront/admin GraphQL surface for shipping zones. Public read (the
 * storefront shows delivery options + rates by governorate); store is resolved
 * from the X-Store-Id header via @StoreId, and RLS scopes the query.
 */
@Resolver()
export class ShippingResolver {
  constructor(private readonly shipping: ShippingService) {}

  @Query(() => [ShippingZoneType])
  shippingZones(@StoreId() storeId: string) {
    return this.shipping.listZones(storeId);
  }
}
