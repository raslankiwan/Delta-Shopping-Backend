import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { StoreId } from '../../common/store-id.decorator';
import { CartService } from '../cart.service';
import { CheckoutService } from '../checkout.service';
import { PaymentService } from '../../payments/payment.service';
import type { CompleteCheckoutInput } from '../dto';
import {
  AddLineInputType,
  ApplyDiscountInputType,
  CartRefType,
  CartType,
  CompleteCheckoutInputType,
  CreateCartInputType,
  OrderType,
  PaymentMethodType,
  UpdateLineInputType,
} from './checkout.types';

/**
 * Storefront (public) GraphQL surface for cart + checkout. Thin — every
 * query/mutation delegates to the existing CartService / CheckoutService,
 * which already bind the tenant (RLS) and hold all business logic. Store is
 * resolved from the X-Store-Id header via @StoreId, matching the REST
 * controllers (no auth — guest/customer storefront flow).
 */
@Resolver()
export class CheckoutResolver {
  constructor(
    private readonly cartService: CartService,
    private readonly checkoutService: CheckoutService,
    private readonly payments: PaymentService,
  ) {}

  @Query(() => CartType)
  cart(@StoreId() storeId: string, @Args('id') id: string) {
    return this.cartService.getCart(storeId, id);
  }

  /** Payment rails available at checkout (COD is always present). */
  @Query(() => [PaymentMethodType])
  paymentMethods() {
    return this.payments.availableMethods();
  }

  @Mutation(() => CartRefType)
  createCart(
    @StoreId() storeId: string,
    @Args('input', { type: () => CreateCartInputType, nullable: true }) input?: CreateCartInputType,
  ) {
    return this.cartService.createCart(storeId, input ?? {});
  }

  @Mutation(() => CartType)
  cartAddLine(
    @StoreId() storeId: string,
    @Args('cartId') cartId: string,
    @Args('input', { type: () => AddLineInputType }) input: AddLineInputType,
  ) {
    return this.cartService.addLine(storeId, cartId, input.variantId, input.quantity);
  }

  @Mutation(() => CartType)
  cartUpdateLine(
    @StoreId() storeId: string,
    @Args('cartId') cartId: string,
    @Args('lineId') lineId: string,
    @Args('input', { type: () => UpdateLineInputType }) input: UpdateLineInputType,
  ) {
    return this.cartService.updateLine(storeId, cartId, lineId, input.quantity);
  }

  @Mutation(() => CartType)
  cartRemoveLine(
    @StoreId() storeId: string,
    @Args('cartId') cartId: string,
    @Args('lineId') lineId: string,
  ) {
    return this.cartService.removeLine(storeId, cartId, lineId);
  }

  @Mutation(() => CartType)
  cartApplyDiscount(
    @StoreId() storeId: string,
    @Args('cartId') cartId: string,
    @Args('input', { type: () => ApplyDiscountInputType }) input: ApplyDiscountInputType,
  ) {
    return this.cartService.applyDiscount(storeId, cartId, input.code);
  }

  @Mutation(() => CartType)
  cartRemoveDiscount(@StoreId() storeId: string, @Args('cartId') cartId: string) {
    return this.cartService.removeDiscount(storeId, cartId);
  }

  @Mutation(() => OrderType)
  checkoutComplete(
    @StoreId() storeId: string,
    @Args('input', { type: () => CompleteCheckoutInputType }) input: CompleteCheckoutInputType,
    @Args('idempotencyKey', { nullable: true }) idempotencyKey?: string,
  ) {
    return this.checkoutService.complete(storeId, input as CompleteCheckoutInput, idempotencyKey);
  }
}
