import { describe, expect, test } from 'bun:test';
import { CurrencyMismatchError, Money, minorUnitExponent } from './money';

describe('Money', () => {
  test('constructs from minor units and normalizes currency case', () => {
    const m = Money.of(2499, 'eur');
    expect(m.amountMinor).toBe(2499);
    expect(m.currency).toBe('EUR');
  });

  test('rejects non-integer amounts and bad currency codes', () => {
    expect(() => Money.of(10.5, 'USD')).toThrow(TypeError);
    expect(() => Money.of(100, 'US')).toThrow(TypeError);
  });

  test('adds and subtracts within the same currency', () => {
    const a = Money.of(2499, 'EUR');
    const b = Money.of(1, 'EUR');
    expect(a.add(b).amountMinor).toBe(2500);
    expect(a.subtract(b).amountMinor).toBe(2498);
  });

  test('refuses to mix currencies', () => {
    const usd = Money.of(100, 'USD');
    const eur = Money.of(100, 'EUR');
    expect(() => usd.add(eur)).toThrow(CurrencyMismatchError);
  });

  test('multiply scales by an integer quantity', () => {
    expect(Money.of(2499, 'EUR').multiply(3).amountMinor).toBe(7497);
  });

  test('allocate distributes remainder without losing units', () => {
    const parts = Money.of(10, 'USD').allocate(3);
    expect(parts.map((p) => p.amountMinor)).toEqual([4, 3, 3]);
    const sum = parts.reduce((acc, p) => acc.add(p), Money.zero('USD'));
    expect(sum.amountMinor).toBe(10);
  });

  test('serializes to the wire shape', () => {
    expect(Money.of(2499, 'EUR').toJSON()).toEqual({ amount_minor: 2499, currency: 'EUR' });
  });

  test('formats per locale', () => {
    const m = Money.of(2499, 'EUR');
    // exact spacing/glyphs vary by ICU; assert the number and currency appear.
    expect(m.format('en-US')).toContain('24.99');
  });

  test('knows minor-unit exponents for zero-decimal currencies', () => {
    expect(minorUnitExponent('JPY')).toBe(0);
    expect(minorUnitExponent('USD')).toBe(2);
    expect(minorUnitExponent('BHD')).toBe(3);
  });
});
