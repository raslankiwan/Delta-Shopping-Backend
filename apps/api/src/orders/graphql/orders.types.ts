import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

/**
 * GraphQL object/input types for orders (admin). Field names mirror the
 * OrdersService output (snake_case) so resolvers can return service results
 * directly without a mapping layer.
 */

@ObjectType()
export class OrderListItemType {
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
  total_minor!: number;

  @Field()
  placed_at!: Date;
}

@ObjectType()
export class OrderSummaryType {
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
  subtotal_minor!: number;

  @Field(() => Int)
  tax_minor!: number;

  @Field(() => Int)
  shipping_minor!: number;

  @Field(() => Int)
  total_minor!: number;

  @Field()
  placed_at!: Date;
}

@ObjectType()
export class OrderLineType {
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
export class OrderPaymentType {
  @Field()
  provider!: string;

  @Field()
  status!: string;

  @Field(() => Int)
  amount_minor!: number;
}

@ObjectType()
export class OrderFulfillmentType {
  @Field()
  status!: string;

  @Field({ nullable: true })
  tracking_number!: string | null;

  @Field({ nullable: true })
  carrier!: string | null;
}

@ObjectType()
export class OrderRefundType {
  @Field(() => Int)
  amount_minor!: number;

  @Field({ nullable: true })
  reason!: string | null;

  @Field()
  status!: string;
}

@ObjectType()
export class OrderDetailType {
  @Field(() => OrderSummaryType)
  order!: OrderSummaryType;

  @Field(() => [OrderLineType])
  lines!: OrderLineType[];

  @Field(() => [OrderPaymentType])
  payments!: OrderPaymentType[];

  @Field(() => [OrderFulfillmentType])
  fulfillments!: OrderFulfillmentType[];

  @Field(() => [OrderRefundType])
  refunds!: OrderRefundType[];
}

@ObjectType()
export class RefundResultType {
  @Field()
  id!: string;
}

@ObjectType()
export class FulfillResultType {
  @Field()
  id!: string;
}

@InputType()
export class RefundOrderInput {
  @Field(() => Int, { nullable: true })
  amountMinor?: number;

  @Field({ nullable: true })
  reason?: string;
}

@InputType()
export class FulfillOrderInput {
  @Field({ nullable: true })
  trackingNumber?: string;

  @Field({ nullable: true })
  carrier?: string;
}
