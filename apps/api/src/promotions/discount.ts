import type { PromotionAction } from '@mercato/db';

export interface DiscountResult {
  discountMinor: number;
  freeShipping: boolean;
}

/** Compute a discount from a promotion action against a subtotal (minor units). */
export function computeDiscount(action: PromotionAction, subtotalMinor: number): DiscountResult {
  switch (action.type) {
    case 'percentage':
      return {
        discountMinor: Math.min(subtotalMinor, Math.floor((subtotalMinor * action.value) / 100)),
        freeShipping: false,
      };
    case 'fixed':
      return { discountMinor: Math.min(subtotalMinor, Math.max(0, action.value)), freeShipping: false };
    case 'free_shipping':
      return { discountMinor: 0, freeShipping: true };
    default:
      return { discountMinor: 0, freeShipping: false };
  }
}
