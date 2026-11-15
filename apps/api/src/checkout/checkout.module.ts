import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { PaymentModule } from '../payments/payment.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { CartService } from './cart.service';
import { CheckoutService } from './checkout.service';
import { CheckoutResolver } from './graphql/checkout.resolver';

@Module({
  imports: [InventoryModule, PaymentModule, PromotionsModule],
  providers: [CartService, CheckoutService, CheckoutResolver],
  exports: [CheckoutService],
})
export class CheckoutModule {}
