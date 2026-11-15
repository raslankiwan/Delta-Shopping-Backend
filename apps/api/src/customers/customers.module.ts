import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomerAuthGuard } from './customer-auth.guard';
import { CustomersResolver } from './graphql/customers.resolver';

@Module({
  providers: [CustomersService, CustomerAuthGuard, CustomersResolver],
})
export class CustomersModule {}
