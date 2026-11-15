import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingResolver } from './graphql/shipping.resolver';

@Module({
  providers: [ShippingService, ShippingResolver],
  exports: [ShippingService],
})
export class ShippingModule {}
