import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { StoreId } from '../../common/store-id.decorator';
import { CustomerAuthGuard } from '../customer-auth.guard';
import { CurrentCustomer, type CustomerPrincipal } from '../customer.principal';
import { CustomersService } from '../customers.service';
import {
  AddressGqlInput,
  AddressIdType,
  CustomerAddressType,
  CustomerLoginGqlInput,
  CustomerProfileType,
  CustomerSessionType,
  RegisterGqlInput,
  UpdateProfileGqlInput,
} from './customers.types';

/**
 * Storefront customer auth + account GraphQL surface. Thin — every
 * query/mutation delegates to the existing CustomersService. Store is
 * resolved from the X-Store-Id header via @StoreId; account operations also
 * require a customer session via @CustomerAuthGuard/@CurrentCustomer.
 */
@Resolver()
export class CustomersResolver {
  constructor(private readonly customers: CustomersService) {}

  @Mutation(() => CustomerSessionType)
  customerRegister(@StoreId() storeId: string, @Args('input') input: RegisterGqlInput) {
    return this.customers.register(storeId, input);
  }

  @Mutation(() => CustomerSessionType)
  customerLogin(@StoreId() storeId: string, @Args('input') input: CustomerLoginGqlInput) {
    return this.customers.login(storeId, input);
  }

  @Query(() => CustomerProfileType)
  @UseGuards(CustomerAuthGuard)
  accountProfile(@StoreId() storeId: string, @CurrentCustomer() c: CustomerPrincipal) {
    return this.customers.getProfile(storeId, c.customerId);
  }

  @Query(() => [CustomerAddressType])
  @UseGuards(CustomerAuthGuard)
  async accountAddresses(@StoreId() storeId: string, @CurrentCustomer() c: CustomerPrincipal) {
    return (await this.customers.listAddresses(storeId, c.customerId)).data;
  }

  @Mutation(() => Boolean)
  @UseGuards(CustomerAuthGuard)
  async accountUpdateProfile(
    @StoreId() storeId: string,
    @CurrentCustomer() c: CustomerPrincipal,
    @Args('input') input: UpdateProfileGqlInput,
  ) {
    await this.customers.updateProfile(storeId, c.customerId, input);
    return true;
  }

  @Mutation(() => AddressIdType)
  @UseGuards(CustomerAuthGuard)
  accountAddAddress(
    @StoreId() storeId: string,
    @CurrentCustomer() c: CustomerPrincipal,
    @Args('input') input: AddressGqlInput,
  ) {
    return this.customers.addAddress(storeId, c.customerId, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(CustomerAuthGuard)
  async accountRemoveAddress(
    @StoreId() storeId: string,
    @CurrentCustomer() c: CustomerPrincipal,
    @Args('id') id: string,
  ) {
    await this.customers.deleteAddress(storeId, c.customerId, id);
    return true;
  }
}
