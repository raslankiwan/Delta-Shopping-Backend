import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import type { Request } from 'express';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './auth/auth.module';
import { ProvisioningModule } from './provisioning.module';
import { CatalogModule } from './catalog/catalog.module';
import { MediaModule } from './media/media.module';
import { CustomersModule } from './customers/customers.module';
import { InventoryModule } from './inventory/inventory.module';
import { PaymentModule } from './payments/payment.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReportsModule } from './reports/reports.module';
import { ShippingModule } from './shipping/shipping.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // in-memory code-first schema
      sortSchema: true,
      introspection: true,
      // Expose the Express request to resolvers so the shared guards/decorators
      // can read X-Store-Id / Authorization exactly as they do for REST.
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    DatabaseModule,
    AuthModule,
    ProvisioningModule,
    CatalogModule,
    MediaModule,
    CustomersModule,
    InventoryModule,
    PaymentModule,
    PromotionsModule,
    CheckoutModule,
    OrdersModule,
    ReportsModule,
    ShippingModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
