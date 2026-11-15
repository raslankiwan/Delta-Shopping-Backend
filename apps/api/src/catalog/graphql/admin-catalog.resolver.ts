import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { StoreId } from '../../common/store-id.decorator';
import { AuthGuard } from '../../auth/auth.guard';
import { PermissionsGuard, RequirePermissions } from '../../auth/permissions';
import { CatalogService } from '../catalog.service';
import type {
  CreateCategoryInput as ServiceCreateCategoryInput,
  CreateProductInput as ServiceCreateProductInput,
  CreateVariantInput as ServiceCreateVariantInput,
  SetPriceInput as ServiceSetPriceInput,
  UpdateProductInput as ServiceUpdateProductInput,
} from '../dto';
import { CategoryType } from './catalog.types';
import {
  AddImageInput,
  AddOptionInput,
  AdminPriceListType,
  AdminProductDetailType,
  AdminProductListItemType,
  CreateCategoryInput,
  CreateProductInput,
  CreateVariantInput,
  GenerateVariantsResultType,
  IdResultType,
  SetPriceInput,
  SetTranslationsInput,
  UpdateProductInput,
} from './admin-catalog.types';

/**
 * Admin catalog GraphQL surface — mirrors AdminProductsController. Thin —
 * every query/mutation delegates to the existing CatalogService. Requires a
 * staff token scoped to the store, plus RBAC (same guards/permissions as the
 * REST controller).
 */
@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminCatalogResolver {
  constructor(private readonly catalog: CatalogService) {}

  @Query(() => [AdminProductListItemType])
  @RequirePermissions('catalog:read')
  async adminProducts(@StoreId() storeId: string) {
    return (await this.catalog.listAdminProducts(storeId)).data;
  }

  @Query(() => AdminProductDetailType)
  @RequirePermissions('catalog:read')
  adminProduct(@StoreId() storeId: string, @Args('id') id: string) {
    return this.catalog.getAdminProduct(storeId, id);
  }

  @Query(() => [AdminPriceListType])
  @RequirePermissions('catalog:read')
  async adminPriceLists(@StoreId() storeId: string) {
    return (await this.catalog.listPriceLists(storeId)).data;
  }

  @Query(() => [CategoryType])
  @RequirePermissions('catalog:read')
  async adminCategories(@StoreId() storeId: string) {
    return (await this.catalog.listCategories(storeId)).data;
  }

  @Mutation(() => IdResultType)
  @RequirePermissions('catalog:write')
  createCategory(@StoreId() storeId: string, @Args('input') input: CreateCategoryInput) {
    return this.catalog.createCategory(storeId, input as ServiceCreateCategoryInput);
  }

  @Mutation(() => IdResultType)
  @RequirePermissions('catalog:write')
  createProduct(@StoreId() storeId: string, @Args('input') input: CreateProductInput) {
    return this.catalog.createProduct(storeId, input as ServiceCreateProductInput);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('catalog:write')
  async updateProduct(
    @StoreId() storeId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateProductInput,
  ) {
    await this.catalog.updateProduct(storeId, id, input as ServiceUpdateProductInput);
    return true;
  }

  @Mutation(() => Boolean)
  @RequirePermissions('catalog:write')
  async deleteProduct(@StoreId() storeId: string, @Args('id') id: string) {
    await this.catalog.deleteProduct(storeId, id);
    return true;
  }

  @Mutation(() => IdResultType)
  @RequirePermissions('catalog:write')
  addVariant(
    @StoreId() storeId: string,
    @Args('productId') productId: string,
    @Args('input') input: CreateVariantInput,
  ) {
    return this.catalog.addVariant(storeId, productId, input as ServiceCreateVariantInput);
  }

  @Mutation(() => IdResultType)
  @RequirePermissions('catalog:write')
  addProductOption(
    @StoreId() storeId: string,
    @Args('productId') productId: string,
    @Args('input') input: AddOptionInput,
  ) {
    return this.catalog.addOption(storeId, productId, input.name, input.values);
  }

  @Mutation(() => GenerateVariantsResultType)
  @RequirePermissions('catalog:write')
  generateVariants(@StoreId() storeId: string, @Args('productId') productId: string) {
    return this.catalog.generateVariants(storeId, productId);
  }

  @Mutation(() => IdResultType)
  @RequirePermissions('catalog:write')
  addProductImage(
    @StoreId() storeId: string,
    @Args('productId') productId: string,
    @Args('input') input: AddImageInput,
  ) {
    return this.catalog.addImage(storeId, productId, input);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('catalog:write')
  async removeProductImage(@StoreId() storeId: string, @Args('imageId') imageId: string) {
    await this.catalog.deleteImage(storeId, imageId);
    return true;
  }

  @Mutation(() => Boolean)
  @RequirePermissions('catalog:write')
  async setProductTranslations(
    @StoreId() storeId: string,
    @Args('productId') productId: string,
    @Args('input') input: SetTranslationsInput,
  ) {
    const { locale, ...fields } = input;
    const defined = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined) as [string, string][],
    );
    await this.catalog.setProductTranslations(storeId, productId, locale, defined);
    return true;
  }

  @Mutation(() => IdResultType)
  @RequirePermissions('catalog:write')
  setVariantPrice(
    @StoreId() storeId: string,
    @Args('variantId') variantId: string,
    @Args('input') input: SetPriceInput,
  ) {
    return this.catalog.setVariantPrice(storeId, variantId, input as ServiceSetPriceInput);
  }
}
