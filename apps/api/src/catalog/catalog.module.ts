import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { StorefrontResolver } from './graphql/storefront.resolver';
import { AdminCatalogResolver } from './graphql/admin-catalog.resolver';

@Module({
  providers: [CatalogService, StorefrontResolver, AdminCatalogResolver],
})
export class CatalogModule {}
