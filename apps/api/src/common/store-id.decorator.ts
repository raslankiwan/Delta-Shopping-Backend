import { BadRequestException, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { isUuid } from '@mercato/core';
import { getRequest } from './request-context';

/**
 * Resolves the active store id for a GraphQL resolver from the `X-Store-Id`
 * request header (validated as a UUID). This is the sole tenant selector now
 * that all traffic is GraphQL; RLS + `withStore` enforce isolation downstream.
 */
export const StoreId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const req = getRequest(ctx);
  const storeId = req.headers['x-store-id'] as string | undefined;
  if (!storeId || !isUuid(storeId)) {
    throw new BadRequestException({
      code: 'store_required',
      detail: 'A valid X-Store-Id header is required for this operation.',
    });
  }
  return storeId;
});
