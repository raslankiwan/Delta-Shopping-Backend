import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { getRequest } from '../common/request-context';
import { verifyCustomerToken } from '../auth/jwt';

/**
 * Authenticates a storefront shopper from a customer access token and pins it to
 * the resolved store: the token's store must match the request's X-Store-Id.
 */
@Injectable()
export class CustomerAuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = getRequest(ctx);
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException({ code: 'unauthenticated', detail: 'Missing bearer token.' });
    }
    let token;
    try {
      token = await verifyCustomerToken(header.slice(7));
    } catch {
      throw new UnauthorizedException({ code: 'invalid_token', detail: 'Invalid or expired token.' });
    }
    const reqStoreId = req.headers['x-store-id'] as string | undefined;
    if (reqStoreId && token.storeId !== reqStoreId) {
      throw new ForbiddenException({ code: 'store_mismatch', detail: 'Token is for a different store.' });
    }
    req.customer = token;
    return true;
  }
}
