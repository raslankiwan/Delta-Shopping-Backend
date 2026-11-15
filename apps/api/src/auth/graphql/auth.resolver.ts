import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { AuthService, type Session } from '../auth.service';
import { CurrentPrincipal, type Principal } from '../principal';
import { AuthPayloadType, LoginInputType, PrincipalType, RefreshInputType, SignupInputType } from './auth.types';

/**
 * Staff auth GraphQL surface. Thin — delegates to the existing AuthService;
 * shapes the response the same way the REST controller's `toAuthResponse` /
 * `me` handler do (service returns camelCase, GraphQL types are snake_case
 * to match the REST response shape).
 */
function toAuthPayload(s: Session): AuthPayloadType {
  return {
    access_token: s.access,
    refresh_token: s.refresh,
    token_type: 'Bearer',
    expires_in: s.expiresIn,
    principal: toPrincipalType(s.principal),
  };
}

function toPrincipalType(p: Principal): PrincipalType {
  return {
    user_id: p.userId,
    organization_id: p.organizationId,
    store_ids: p.storeIds,
    permissions: p.permissions,
  };
}

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthPayloadType)
  async staffRegister(@Args('input') input: SignupInputType) {
    return toAuthPayload(await this.auth.signup(input));
  }

  @Mutation(() => AuthPayloadType)
  async staffLogin(@Args('input') input: LoginInputType) {
    return toAuthPayload(await this.auth.login(input));
  }

  @Mutation(() => AuthPayloadType)
  async refreshToken(@Args('input') input: RefreshInputType) {
    return toAuthPayload(await this.auth.refresh(input.refreshToken));
  }

  @Mutation(() => Boolean)
  async logout(@Args('input') input: RefreshInputType) {
    await this.auth.logout(input.refreshToken);
    return true;
  }

  @Query(() => PrincipalType)
  @UseGuards(AuthGuard)
  me(@CurrentPrincipal() principal: Principal) {
    return toPrincipalType(principal);
  }
}
