import { Field, InputType, ObjectType } from '@nestjs/graphql';

/**
 * GraphQL object/input types for org-level store management. Field names
 * mirror the service output (snake_case) so resolvers can return service
 * results directly without a mapping layer.
 */

@ObjectType()
export class StoreType {
  @Field()
  id!: string;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field()
  status!: string;

  @Field()
  default_locale!: string;

  @Field()
  default_currency!: string;
}

@ObjectType()
export class CreateStoreResultType {
  @Field()
  id!: string;
}

@InputType()
export class CreateStoreInputType {
  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field()
  defaultLocale!: string;

  @Field()
  defaultCurrency!: string;

  @Field()
  timezone!: string;

  @Field(() => [String], { nullable: true })
  locales?: string[];

  @Field(() => [String], { nullable: true })
  currencies?: string[];
}

@InputType()
export class UpdateStoreInputType {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  defaultLocale?: string;

  @Field({ nullable: true })
  defaultCurrency?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  status?: string; // 'active' | 'suspended'
}
