import { describe, expect, test } from 'bun:test';
import { computeDiscount } from './discount';

describe('computeDiscount', () => {
  test('percentage discounts round down to whole minor units', () => {
    expect(computeDiscount({ type: 'percentage', value: 10 }, 12_345)).toEqual({
      discountMinor: 1_234,
      freeShipping: false,
    });
  });

  test('a percentage never exceeds the subtotal', () => {
    expect(computeDiscount({ type: 'percentage', value: 150 }, 5_000).discountMinor).toBe(5_000);
  });

  test('fixed discounts are capped at the subtotal', () => {
    expect(computeDiscount({ type: 'fixed', value: 2_000 }, 1_500).discountMinor).toBe(1_500);
    expect(computeDiscount({ type: 'fixed', value: 500 }, 1_500).discountMinor).toBe(500);
  });

  test('a negative fixed amount never adds to the total', () => {
    expect(computeDiscount({ type: 'fixed', value: -300 }, 1_500).discountMinor).toBe(0);
  });

  test('free shipping takes nothing off the subtotal', () => {
    expect(computeDiscount({ type: 'free_shipping', value: 0 }, 9_900)).toEqual({
      discountMinor: 0,
      freeShipping: true,
    });
  });
});
