/**
 * Money — an integer-minor-unit value object.
 *
 * Money is stored and computed as an integer number of minor units (cents,
 * pence, fils, …) plus an ISO-4217 currency. Floats are never used for money.
 * All arithmetic guards against mixing currencies, which is a bug, not a feature.
 */

/** Serializable money shape used across the API and DB boundaries. */
export interface MoneyLike {
  readonly amount_minor: number;
  readonly currency: string;
}

export class CurrencyMismatchError extends Error {
  constructor(a: string, b: string) {
    super(`Cannot operate on Money with different currencies: ${a} vs ${b}`);
    this.name = 'CurrencyMismatchError';
  }
}

const CURRENCY_RE = /^[A-Z]{3}$/;

export class Money {
  private constructor(
    /** Integer minor units. Positive, negative, or zero. */
    readonly amountMinor: number,
    /** ISO-4217 uppercase code, e.g. "USD", "EUR". */
    readonly currency: string,
  ) {}

  static of(amountMinor: number, currency: string): Money {
    if (!Number.isInteger(amountMinor)) {
      throw new TypeError(`Money.amountMinor must be an integer, got ${amountMinor}`);
    }
    const code = currency.toUpperCase();
    if (!CURRENCY_RE.test(code)) {
      throw new TypeError(`Invalid ISO-4217 currency code: ${currency}`);
    }
    return new Money(amountMinor, code);
  }

  static from(m: MoneyLike): Money {
    return Money.of(m.amount_minor, m.currency);
  }

  static zero(currency: string): Money {
    return Money.of(0, currency);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountMinor + other.amountMinor, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountMinor - other.amountMinor, this.currency);
  }

  /** Multiply by an integer quantity (e.g. line item qty). */
  multiply(quantity: number): Money {
    if (!Number.isInteger(quantity)) {
      throw new TypeError(`Money.multiply expects an integer quantity, got ${quantity}`);
    }
    return new Money(this.amountMinor * quantity, this.currency);
  }

  /**
   * Split into n parts without losing minor units. The remainder is distributed
   * one unit at a time to the earliest parts, so the parts always sum to the total.
   */
  allocate(n: number): Money[] {
    if (!Number.isInteger(n) || n <= 0) {
      throw new TypeError(`Money.allocate expects a positive integer, got ${n}`);
    }
    const base = Math.trunc(this.amountMinor / n);
    let remainder = this.amountMinor - base * n;
    const step = remainder >= 0 ? 1 : -1;
    remainder = Math.abs(remainder);
    const parts: Money[] = [];
    for (let i = 0; i < n; i++) {
      const extra = i < remainder ? step : 0;
      parts.push(new Money(base + extra, this.currency));
    }
    return parts;
  }

  isZero(): boolean {
    return this.amountMinor === 0;
  }

  isNegative(): boolean {
    return this.amountMinor < 0;
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amountMinor === other.amountMinor;
  }

  toJSON(): MoneyLike {
    return { amount_minor: this.amountMinor, currency: this.currency };
  }

  /** Locale-aware display string via Intl. Never used for storage or math. */
  format(locale: string): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amountMinor / minorUnitDivisor(this.currency));
  }
}

/**
 * Minor-unit exponent per currency (how many minor units per major unit).
 * Most currencies use 2; a few use 0 (JPY, KRW) or 3 (BHD, KWD).
 */
const MINOR_UNIT_EXPONENT: Record<string, number> = {
  JPY: 0,
  KRW: 0,
  VND: 0,
  BHD: 3,
  JOD: 3, // Jordanian dinar — 1000 fils, widely used alongside ILS in the West Bank
  KWD: 3,
  OMR: 3,
  TND: 3,
};

export function minorUnitExponent(currency: string): number {
  return MINOR_UNIT_EXPONENT[currency.toUpperCase()] ?? 2;
}

function minorUnitDivisor(currency: string): number {
  return 10 ** minorUnitExponent(currency);
}
