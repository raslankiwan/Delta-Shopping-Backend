import { Field, Int, ObjectType, InputType } from '@nestjs/graphql';
import { MoneyType } from '../../catalog/graphql/catalog.types';

/**
 * GraphQL types for storefront cart + checkout. Object type field names mirror
 * the service output (snake_case: CartView / OrderView) so resolvers can
 * return service results directly without a mapping layer. Reuses the
 * catalog domain's `MoneyType` so the schema exposes a single Money shape.
 */

@ObjectType()
export class CartLineType {
  @Field()
  id!: string;

  @Field()
  variant_id!: string;

  @Field()
  sku!: string;

  @Field()
  title!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => MoneyType)
  unit_price!: { amount_minor: number; currency: string };

  @Field(() => MoneyType)
  line_total!: { amount_minor: number; currency: string };
}

@ObjectType()
export class CartType {
  @Field()
  id!: string;

  @Field()
  currency!: string;

  @Field()
  status!: string;

  @Field(() => [CartLineType])
  lines!: CartLineType[];

  @Field(() => MoneyType)
  subtotal!: { amount_minor: number; currency: string };

  @Field({ nullable: true })
  discount_code!: string | null;

  @Field(() => MoneyType)
  discount!: { amount_minor: number; currency: string };

  @Field(() => MoneyType)
  total!: { amount_minor: number; currency: string };
}

@ObjectType()
export class CartRefType {
  @Field()
  id!: string;

  @Field()
  currency!: string;
}

@ObjectType()
export class PaymentMethodType {
  /** cod | palpay | jawwalpay | bank_of_palestine */
  @Field()
  method!: string;

  /** 'on_delivery' for COD, 'immediate' for gateways. */
  @Field()
  capture!: string;
}

@ObjectType()
export class CheckoutOrderLineType {
  @Field()
  sku!: string;

  @Field()
  title!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Int)
  unit_price_minor!: number;

  @Field(() => Int)
  total_minor!: number;
}

@ObjectType()
export class OrderType {
  @Field()
  id!: string;

  @Field()
  number!: string;

  @Field()
  email!: string;

  @Field()
  currency!: string;

  @Field()
  status!: string;

  @Field()
  financial_status!: string;

  @Field()
  fulfillment_status!: string;

  @Field(() => Int)
  subtotal!: number;

  @Field(() => Int)
  tax!: number;

  @Field(() => Int)
  shipping!: number;

  @Field(() => Int)
  total!: number;

  @Field(() => [CheckoutOrderLineType])
  lines!: CheckoutOrderLineType[];
}

// --- inputs ----------------------------------------------------------------

@InputType()
export class CreateCartInputType {
  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  locale?: string;
}

@InputType()
export class AddLineInputType {
  @Field()
  variantId!: string;

  @Field(() => Int)
  quantity!: number;
}

@InputType()
export class UpdateLineInputType {
  @Field(() => Int)
  quantity!: number;
}

@InputType()
export class ApplyDiscountInputType {
  @Field()
  code!: string;
}

@InputType()
export class AddressInputType {
  @Field({ nullable: true })
  name?: string;

  @Field()
  line1!: string;

  @Field({ nullable: true })
  line2?: string;

  @Field()
  city!: string;

  @Field({ nullable: true })
  region?: string;

  /** West Bank governorate code — drives the shipping rate. */
  @Field({ nullable: true })
  governorate?: string;

  @Field({ nullable: true })
  postalCode?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  phone?: string;
}

@InputType()
export class CompleteCheckoutInputType {
  @Field()
  cartId!: string;

  @Field()
  email!: string;

  @Field(() => AddressInputType)
  shippingAddress!: AddressInputType;

  @Field(() => AddressInputType, { nullable: true })
  billingAddress?: AddressInputType;

  /** Payment rail: 'cod' (default), 'palpay', 'jawwalpay', 'bank_of_palestine'. */
  @Field({ nullable: true })
  paymentMethod?: string;
}
