import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsResolver } from './graphql/promotions.resolver';

@Module({
  providers: [PromotionsService, PromotionsResolver],
  exports: [PromotionsService], // cart + checkout resolve/consume discounts
})
export class PromotionsModule {}
