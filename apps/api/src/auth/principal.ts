import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { getRequest } from '../common/request-context';

/** The authenticated actor, derived from a verified access token. */
export interface Principal {
  userId: string;
  organizationId: string;
  /** Stores this actor may operate on (explicit list; org-wide staff get all org stores). */
  storeIds: string[];
  /** Effective permissions; `['*']` means all. */
  permissions: string[];
  type: 'staff';
}

declare module 'express' {
  interface Request {
    principal?: Principal;
  }
}

/** Injects the authenticated Principal (populated by AuthGuard). */
export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Principal => {
    return getRequest(ctx).principal as Principal;
  },
);

export function hasPermission(principal: Principal, permission: string): boolean {
  return principal.permissions.includes('*') || principal.permissions.includes(permission);
}
