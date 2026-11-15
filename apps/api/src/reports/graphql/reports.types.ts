import { Field, Int, ObjectType } from '@nestjs/graphql';

/**
 * GraphQL object types for reports. Field names mirror the service output
 * (snake_case) so resolvers can return service results directly without a
 * mapping layer.
 */

@ObjectType()
export class SalesReportType {
  @Field(() => Int)
  orders_count!: number;

  @Field(() => Int)
  revenue_minor!: number;

  @Field(() => Int)
  aov_minor!: number;
}

@ObjectType()
export class TopProductType {
  @Field()
  sku!: string;

  @Field()
  title!: string;

  @Field(() => Int)
  units!: number;

  @Field(() => Int)
  revenue_minor!: number;
}

@ObjectType()
export class InventoryReportType {
  @Field(() => Int)
  skus!: number;

  @Field(() => Int)
  total_on_hand!: number;

  @Field(() => Int)
  total_reserved!: number;

  @Field(() => Int)
  low_stock!: number;
}
