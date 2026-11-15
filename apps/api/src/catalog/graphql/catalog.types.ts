import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

/**
 * GraphQL object types for the catalog. Field names mirror the service output
 * (snake_case) so resolvers can return service results directly without a
 * mapping layer. `option_values` (a string map) uses a JSON scalar.
 */

@ObjectType()
export class MoneyType {
  @Field(() => Int)
  amount_minor!: number;

  @Field()
  currency!: string;
}

@ObjectType()
export class StorefrontConfigType {
  @Field()
  name!: string;

  @Field()
  default_locale!: string;

  @Field()
  default_currency!: string;

  /** VAT rate in basis points (e.g. 1600 = 16% Palestine VAT). */
  @Field(() => Int)
  tax_bps!: number;

  @Field(() => [String])
  locales!: string[];

  @Field(() => [String])
  currencies!: string[];
}

@ObjectType()
export class CategoryType {
  @Field()
  id!: string;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  parent_id!: string | null;

  @Field(() => Int)
  position!: number;
}

@ObjectType()
export class CategoryRefType {
  @Field()
  id!: string;

  @Field()
  slug!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class StorefrontProductType {
  @Field()
  id!: string;

  @Field()
  slug!: string;

  @Field()
  title!: string;

  /** physical | digital | service */
  @Field()
  type!: string;

  @Field()
  status!: string;

  @Field(() => MoneyType, { nullable: true })
  from_price!: MoneyType | null;
}

@ObjectType()
export class ProductImageType {
  @Field()
  id!: string;

  @Field()
  url!: string;

  @Field({ nullable: true })
  alt!: string | null;

  @Field(() => Int)
  position!: number;
}

@ObjectType()
export class ProductOptionType {
  @Field()
  name!: string;

  @Field(() => [String])
  values!: string[];
}

@ObjectType()
export class VariantDetailType {
  @Field()
  id!: string;

  @Field()
  sku!: string;

  @Field(() => GraphQLJSONObject)
  option_values!: Record<string, string>;

  @Field(() => MoneyType, { nullable: true })
  price!: MoneyType | null;

  @Field(() => MoneyType, { nullable: true })
  compare_at!: MoneyType | null;
}

@ObjectType()
export class ProductDetailType {
  @Field()
  id!: string;

  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  subtitle!: string | null;

  @Field({ nullable: true })
  description!: string | null;

  /** physical | digital | service */
  @Field()
  type!: string;

  @Field()
  requires_shipping!: boolean;

  @Field(() => Int, { nullable: true })
  service_duration_minutes!: number | null;

  @Field({ nullable: true })
  service_location!: string | null;

  @Field(() => CategoryRefType, { nullable: true })
  category!: CategoryRefType | null;

  @Field({ nullable: true })
  vendor!: string | null;

  @Field(() => [String])
  tags!: string[];

  @Field()
  status!: string;

  @Field()
  currency!: string;

  @Field()
  locale!: string;

  @Field({ nullable: true })
  seo_title!: string | null;

  @Field({ nullable: true })
  seo_description!: string | null;

  @Field(() => [ProductImageType])
  images!: ProductImageType[];

  @Field(() => [ProductOptionType])
  options!: ProductOptionType[];

  @Field(() => [VariantDetailType])
  variants!: VariantDetailType[];
}
