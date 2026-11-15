import { randomUUID } from 'node:crypto';

export interface AuthorizeInput {
  amountMinor: number;
  currency: string;
  orderRef: string;
}
export interface AuthorizeResult {
  ref: string;
  /**
   * `captured` — funds taken now (cards/gateways). `authorized` — collected later
   * (cash on delivery): the order is placed but stays financially pending until
   * the courier collects. `failed` — declined.
   */
  status: 'captured' | 'authorized' | 'failed';
}
export interface RefundInput {
  providerRef: string | null;
  amountMinor: number;
}

/**
 * Provider-agnostic payment port. Order logic depends only on this interface, so
 * new gateways (Stripe, PalPay, JawwalPay, Bank of Palestine) drop in without
 * touching checkout/orders.
 */
export interface PaymentProvider {
  readonly name: string;
  authorizeAndCapture(input: AuthorizeInput): Promise<AuthorizeResult>;
  refund(input: RefundInput): Promise<{ status: 'succeeded' | 'failed' }>;
}

/** Dev/test provider: authorizes and captures synchronously, no external calls. */
export class TestPaymentProvider implements PaymentProvider {
  readonly name = 'test';
  async authorizeAndCapture(_input: AuthorizeInput): Promise<AuthorizeResult> {
    return { ref: `test_${randomUUID()}`, status: 'captured' };
  }
  async refund(_input: RefundInput): Promise<{ status: 'succeeded' | 'failed' }> {
    return { status: 'succeeded' };
  }
}

/**
 * Cash on delivery — the default rail in the West Bank. No gateway call: the order
 * is placed and the amount is `authorized` (owed), collected by the courier on
 * delivery. Refunds are handled out-of-band (cash returned), so they always
 * "succeed" from the system's perspective.
 */
export class CashOnDeliveryProvider implements PaymentProvider {
  readonly name = 'cod';
  async authorizeAndCapture(_input: AuthorizeInput): Promise<AuthorizeResult> {
    return { ref: `cod_${randomUUID()}`, status: 'authorized' };
  }
  async refund(_input: RefundInput): Promise<{ status: 'succeeded' | 'failed' }> {
    return { status: 'succeeded' };
  }
}

/** A gateway adapter that is wired but not yet integrated; fails loudly if selected. */
class UnimplementedGateway implements PaymentProvider {
  constructor(
    readonly name: string,
    private readonly apiKey: string,
  ) {}
  async authorizeAndCapture(_input: AuthorizeInput): Promise<AuthorizeResult> {
    throw new Error(`${this.name} payment provider not implemented yet — integrate the ${this.name} API.`);
  }
  async refund(_input: RefundInput): Promise<{ status: 'succeeded' | 'failed' }> {
    throw new Error(`${this.name} payment provider not implemented yet — integrate the ${this.name} API.`);
  }
}

/** Stripe adapter (skeleton). Real capture uses PaymentIntents (PCI SAQ-A). */
export class StripePaymentProvider extends UnimplementedGateway {
  constructor(secretKey: string) {
    super('stripe', secretKey);
  }
}

/** PalPay (Palestinian payment gateway) adapter — skeleton. */
export class PalPayProvider extends UnimplementedGateway {
  constructor(apiKey: string) {
    super('palpay', apiKey);
  }
}

/** JawwalPay (mobile wallet) adapter — skeleton. */
export class JawwalPayProvider extends UnimplementedGateway {
  constructor(apiKey: string) {
    super('jawwalpay', apiKey);
  }
}

/** Bank of Palestine online payments adapter — skeleton. */
export class BankOfPalestineProvider extends UnimplementedGateway {
  constructor(apiKey: string) {
    super('bank_of_palestine', apiKey);
  }
}
