import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { PaymentModule } from '../payments/payment.module';
import { OrdersResolver } from './graphql/orders.resolver';
import { OrdersService } from './orders.service';

@Module({
  imports: [InventoryModule, PaymentModule],
  providers: [OrdersService, OrdersResolver],
})
export class OrdersModule {}
