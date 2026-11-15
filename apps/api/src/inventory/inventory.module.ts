import { Module } from '@nestjs/common';
import { InventoryResolver } from './graphql/inventory.resolver';
import { InventoryService } from './inventory.service';

@Module({
  providers: [InventoryService, InventoryResolver],
  exports: [InventoryService], // checkout reserves/commits/releases stock
})
export class InventoryModule {}
