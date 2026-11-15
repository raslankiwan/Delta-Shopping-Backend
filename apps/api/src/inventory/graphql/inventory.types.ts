import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

/**
 * GraphQL object/input types for inventory (admin). Field names mirror the
 * InventoryService output (snake_case) so resolvers can return service
 * results directly without a mapping layer.
 */

@ObjectType()
export class InventoryItemType {
  @Field()
  variant_id!: string;

  @Field()
  sku!: string;

  @Field()
  location_id!: string;

  @Field(() => Int)
  on_hand!: number;

  @Field(() => Int)
  reserved!: number;

  @Field(() => Int)
  reorder_point!: number;

  @Field(() => Int)
  available!: number;
}

@ObjectType()
export class LowStockItemType {
  @Field()
  variant_id!: string;

  @Field()
  sku!: string;

  @Field(() => Int)
  on_hand!: number;

  @Field(() => Int)
  reserved!: number;

  @Field(() => Int)
  reorder_point!: number;
}

@ObjectType()
export class LocationType {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  is_default!: boolean;
}

@ObjectType()
export class InventoryAdjustResultType {
  @Field(() => Int)
  on_hand!: number;
}

@ObjectType()
export class CreateLocationResultType {
  @Field()
  id!: string;
}

@InputType()
export class AdjustInventoryInput {
  @Field()
  variantId!: string;

  @Field(() => Int)
  delta!: number;

  @Field(() => Int, { nullable: true })
  reorderPoint?: number;
}

@InputType()
export class CreateLocationInputType {
  @Field()
  name!: string;

  @Field({ nullable: true })
  isDefault?: boolean;
}
