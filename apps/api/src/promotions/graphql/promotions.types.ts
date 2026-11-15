import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

/**
 * GraphQL object/input types for promotions. Field names mirror the service
 * output (snake_case) so resolvers can return service results directly
 * without a mapping layer. `action` (a small heterogeneous object) uses a
 * JSON scalar, same as `option_values` in the catalog surface.
 */

@ObjectType()
export class DiscountCodeType {
  @Field()
  id!: string;

  @Field()
  code!: string;

  @Field(() => Int)
  used_count!: number;

  @Field(() => Int, { nullable: true })
  usage_limit!: number | null;

  @Field()
  status!: string;

  @Field(() => GraphQLJSONObject)
  action!: Record<string, unknown>;
}

@ObjectType()
export class CreateDiscountCodeResultType {
  @Field()
  id!: string;
}

@InputType()
export class CreateDiscountCodeInputType {
  @Field()
  code!: string;

  @Field()
  type!: string; // 'percentage' | 'fixed' | 'free_shipping'

  @Field(() => Int, { nullable: true })
  value?: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  usageLimit?: number;

  @Field(() => Int, { nullable: true })
  perCustomerLimit?: number;

  @Field({ nullable: true })
  startsAt?: string;

  @Field({ nullable: true })
  endsAt?: string;
}
