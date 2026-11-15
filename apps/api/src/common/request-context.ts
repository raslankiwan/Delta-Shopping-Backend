import type { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext, type GqlContextType } from '@nestjs/graphql';
import type { Request } from 'express';

/**
 * Get the underlying Express request whether the handler is REST or GraphQL.
 * Lets one set of guards/param-decorators serve both transports during (and
 * after) the GraphQL migration.
 */
export function getRequest(ctx: ExecutionContext): Request {
  if (ctx.getType<GqlContextType>() === 'graphql') {
    return GqlExecutionContext.create(ctx).getContext<{ req: Request }>().req;
  }
  return ctx.switchToHttp().getRequest<Request>();
}
