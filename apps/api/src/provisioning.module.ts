import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { StoresService } from './stores/stores.service';
import { StoresResolver } from './stores/graphql/stores.resolver';
import { PlatformService } from './platform/platform.service';
import { PlatformResolver } from './platform/graphql/platform.resolver';
import { OperatorGuard } from './platform/operator.guard';

@Module({
  imports: [AuthModule],
  providers: [StoresService, StoresResolver, PlatformService, PlatformResolver, OperatorGuard],
})
export class ProvisioningModule {}
