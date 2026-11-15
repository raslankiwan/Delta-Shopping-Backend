import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { getRequest } from '../common/request-context';

/**
 * Guards the internal operator (super-admin) API with a static operator token
 * (`X-Operator-Token` == `OPERATOR_TOKEN`). This surface is not exposed to
 * merchants and should additionally be network-restricted in production.
 */
@Injectable()
export class OperatorGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = getRequest(ctx);
    const expected = process.env.OPERATOR_TOKEN;
    if (!expected) {
      throw new UnauthorizedException({ code: 'operator_disabled', detail: 'Operator API is not configured.' });
    }
    if (req.header('x-operator-token') !== expected) {
      throw new UnauthorizedException({ code: 'operator_unauthorized', detail: 'Invalid operator token.' });
    }
    return true;
  }
}
