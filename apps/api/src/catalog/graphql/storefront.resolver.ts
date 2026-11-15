import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { StoreId } from '../../common/store-id.decorator';
import { CatalogService } from '../catalog.service';
import {
  CategoryType,
  ProductDetailType,
  StorefrontConfigType,
  StorefrontProductType,
} from './catalog.types';

/**
 * Storefront (public) GraphQL surface. Thin — every query delegates to the
 * existing CatalogService, which already binds the tenant (RLS) and localizes.
 * Store is resolved from the X-Store-Id header via @StoreId.
 */
@Resolver()
export class StorefrontResolver {
  constructor(private readonly catalog: CatalogService) {}

  @Query(() => StorefrontConfigType)
  storeConfig(@StoreId() storeId: string) {
    return this.catalog.getStorefrontConfig(storeId);
  }

  @Query(() => [CategoryType])
  async categories(@StoreId() storeId: string) {
    return (await this.catalog.listCategories(storeId)).data;
  }

  @Query(() => [StorefrontProductType])
  async products(
    @StoreId() storeId: string,
    @Args('locale', { nullable: true }) locale?: string,
    @Args('currency', { nullable: true }) currency?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('categorySlug', { nullable: true }) categorySlug?: string,
    @Args('type', { nullable: true }) type?: string,
  ) {
    return (await this.catalog.listActiveProducts(storeId, { locale, currency, limit, categorySlug, type })).data;
  }

  @Query(() => [StorefrontProductType])
  async searchProducts(
    @StoreId() storeId: string,
    @Args('q') q: string,
    @Args('locale', { nullable: true }) locale?: string,
    @Args('currency', { nullable: true }) currency?: string,
  ) {
    return (await this.catalog.searchProducts(storeId, q, { locale, currency })).data;
  }

  @Query(() => ProductDetailType, { nullable: true })
  product(
    @StoreId() storeId: string,
    @Args('slug') slug: string,
    @Args('locale', { nullable: true }) locale?: string,
    @Args('currency', { nullable: true }) currency?: string,
  ) {
    return this.catalog.getProductBySlug(storeId, slug, { locale, currency });
  }
}
