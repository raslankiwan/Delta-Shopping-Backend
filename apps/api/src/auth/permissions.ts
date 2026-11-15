import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getRequest } from '../common/request-context';
import { hasPermission } from './principal';

export const PERMISSIONS_KEY = 'required_permissions';

/** Declares the permissions a handler requires, e.g. @RequirePermissions('catalog:write'). */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? [];
    if (required.length === 0) return true;

    const req = getRequest(ctx);
    if (!req.principal) {
      throw new UnauthorizedException({ code: 'unauthenticated', detail: 'Authentication required.' });
    }
    const ok = required.every((p) => hasPermission(req.principal!, p));
    if (!ok) {
      throw new ForbiddenException({
        code: 'forbidden',
        detail: `Requires permission: ${required.join(', ')}`,
      });
    }
    return true;
  }
}
