import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { CategoryRefType, ProductImageType, ProductOptionType, VariantDetailType } from './catalog.types';

/**
 * GraphQL types for the admin catalog surface. Object types mirror the
 * CatalogService's admin-write return shapes (snake_case where the service
 * uses it) so resolvers can return service results directly. Input types
 * mirror the shapes in `catalog/dto.ts`.
 */

// --- object types -----------------------------------------------------------

@ObjectType()
export class AdminProductListItemType {
  @Field()
  id!: string;

  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field()
  status!: string;
}

@ObjectType()
export class AdminPriceListType {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  currency!: string;
}

@ObjectType()
export class IdResultType {
  @Field()
  id!: string;
}

@ObjectType()
export class GenerateVariantsResultType {
  @Field(() => Int)
  created!: number;
}

/** Full admin product: fields + options + variants + images + per-locale translations. */
@ObjectType()
export class AdminProductDetailType {
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

  @Field({ nullable: true })
  seo_title!: string | null;

  @Field({ nullable: true })
  seo_description!: string | null;

  @Field()
  status!: string;

  @Field(() => [ProductImageType])
  images!: ProductImageType[];

  @Field(() => [ProductOptionType])
  options!: ProductOptionType[];

  @Field(() => [VariantDetailType])
  variants!: VariantDetailType[];

  /** Keyed by locale, then by field name (title/subtitle/description/seo_title/seo_description). */
  @Field(() => GraphQLJSONObject)
  translations!: Record<string, Record<string, string>>;
}

// --- input types -------------------------------------------------------------

@InputType()
export class CreateProductInput {
  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  subtitle?: string;

  @Field({ nullable: true })
  description?: string;

  /** physical | digital | service (defaults to physical). */
  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  requiresShipping?: boolean;

  @Field({ nullable: true })
  categoryId?: string;

  @Field(() => Int, { nullable: true })
  serviceDurationMinutes?: number;

  @Field({ nullable: true })
  serviceLocation?: string;

  @Field({ nullable: true })
  vendor?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  seoTitle?: string;

  @Field({ nullable: true })
  seoDescription?: string;

  /** One of 'draft' | 'active' | 'archived'. Not enforced by the GraphQL type system. */
  @Field({ nullable: true })
  status?: string;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  subtitle?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  requiresShipping?: boolean;

  @Field({ nullable: true })
  categoryId?: string;

  @Field(() => Int, { nullable: true })
  serviceDurationMinutes?: number;

  @Field({ nullable: true })
  serviceLocation?: string;

  @Field({ nullable: true })
  vendor?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  seoTitle?: string;

  @Field({ nullable: true })
  seoDescription?: string;

  /** One of 'draft' | 'active' | 'archived'. Not enforced by the GraphQL type system. */
  @Field({ nullable: true })
  status?: string;
}

@InputType()
export class CreateVariantInput {
  @Field()
  sku!: string;

  @Field({ nullable: true })
  barcode?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  optionValues?: Record<string, string>;

  @Field(() => Int, { nullable: true })
  weightGrams?: number;

  @Field(() => Int, { nullable: true })
  position?: number;
}

@InputType()
export class SetPriceInput {
  @Field()
  priceListId!: string;

  @Field(() => Int)
  amountMinor!: number;

  @Field(() => Int, { nullable: true })
  compareAtAmountMinor?: number;

  @Field(() => Int, { nullable: true })
  minQuantity?: number;

  @Field({ nullable: true })
  startsAt?: string;

  @Field({ nullable: true })
  endsAt?: string;
}

@InputType()
export class AddOptionInput {
  @Field()
  name!: string;

  @Field(() => [String])
  values!: string[];
}

@InputType()
export class AddImageInput {
  @Field()
  url!: string;

  @Field({ nullable: true })
  alt?: string;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field({ nullable: true })
  variantId?: string;
}

@InputType()
export class CreateCategoryInput {
  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => Int, { nullable: true })
  position?: number;
}

@InputType()
export class SetTranslationsInput {
  @Field()
  locale!: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  subtitle?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  seo_title?: string;

  @Field({ nullable: true })
  seo_description?: string;
}
