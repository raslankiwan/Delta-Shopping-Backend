import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { getRequest } from '../common/request-context';

export interface CustomerPrincipal {
  customerId: string;
  storeId: string;
}

declare module 'express' {
  interface Request {
    customer?: CustomerPrincipal;
  }
}

export const CurrentCustomer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CustomerPrincipal => {
    return getRequest(ctx).customer as CustomerPrincipal;
  },
);
