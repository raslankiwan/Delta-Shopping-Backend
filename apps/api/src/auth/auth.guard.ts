import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { getRequest } from '../common/request-context';
import { verifyAccessToken } from './jwt';

/**
 * Authenticates a request from its `Authorization: Bearer` access token, attaches
 * the resolved Principal, and enforces store scope: if the request resolved a
 * store (via the X-Store-Id header), that store must be within the token's
 * authorized `storeIds`.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = getRequest(ctx);
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException({ code: 'unauthenticated', detail: 'Missing bearer token.' });
    }
    try {
      req.principal = await verifyAccessToken(header.slice(7));
    } catch {
      throw new UnauthorizedException({ code: 'invalid_token', detail: 'Invalid or expired token.' });
    }
    const storeId = req.headers['x-store-id'] as string | undefined;
    if (storeId && !req.principal.storeIds.includes(storeId)) {
      throw new ForbiddenException({
        code: 'store_forbidden',
        detail: 'Your token is not scoped to the requested store.',
      });
    }
    return true;
  }
}
