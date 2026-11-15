import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { PermissionsGuard } from './permissions';
import { AuthResolver } from './graphql/auth.resolver';

@Module({
  providers: [AuthService, AuthGuard, PermissionsGuard, AuthResolver],
  exports: [AuthService, AuthGuard, PermissionsGuard],
})
export class AuthModule {}
