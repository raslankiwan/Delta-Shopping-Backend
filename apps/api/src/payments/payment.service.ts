import { Injectable } from '@nestjs/common';
import {
  BankOfPalestineProvider,
  CashOnDeliveryProvider,
  JawwalPayProvider,
  PalPayProvider,
  StripePaymentProvider,
  TestPaymentProvider,
  type AuthorizeInput,
  type AuthorizeResult,
  type PaymentProvider,
  type RefundInput,
} from './payment-provider';

/**
 * Payment method metadata surfaced to the storefront so it can render the
 * checkout options (label per locale is applied client-side by method key).
 */
export interface PaymentMethodInfo {
  method: string;
  /** COD is captured on delivery; gateways capture immediately. */
  capture: 'on_delivery' | 'immediate';
}

/**
 * Registry of payment providers. Cash on delivery is always available (the West
 * Bank default). Card/gateway rails register only when their API key is present,
 * so local dev/CI falls back cleanly to COD + the test provider.
 */
@Injectable()
export class PaymentService {
  private readonly providers = new Map<string, PaymentProvider>();

  constructor() {
    const cod = new CashOnDeliveryProvider();
    this.providers.set(cod.name, cod);

    const test = new TestPaymentProvider();
    this.providers.set(test.name, test);

    const gateways: Array<[string | undefined, () => PaymentProvider]> = [
      [process.env.STRIPE_SECRET_KEY, () => new StripePaymentProvider(process.env.STRIPE_SECRET_KEY!)],
      [process.env.PALPAY_API_KEY, () => new PalPayProvider(process.env.PALPAY_API_KEY!)],
      [process.env.JAWWALPAY_API_KEY, () => new JawwalPayProvider(process.env.JAWWALPAY_API_KEY!)],
      [process.env.BOP_API_KEY, () => new BankOfPalestineProvider(process.env.BOP_API_KEY!)],
    ];
    for (const [key, make] of gateways) {
      if (key) {
        const p = make();
        this.providers.set(p.name, p);
      }
    }
  }

  /** The provider for a requested method, defaulting to cash on delivery. */
  private providerFor(method?: string): PaymentProvider {
    return this.providers.get(method ?? 'cod') ?? this.providers.get('cod')!;
  }

  /** Method keys the storefront may offer at checkout. */
  availableMethods(): PaymentMethodInfo[] {
    const infos: PaymentMethodInfo[] = [];
    for (const name of this.providers.keys()) {
      if (name === 'test') continue; // internal only
      infos.push({ method: name, capture: name === 'cod' ? 'on_delivery' : 'immediate' });
    }
    return infos;
  }

  providerName(method?: string): string {
    return this.providerFor(method).name;
  }

  authorizeAndCapture(input: AuthorizeInput, method?: string): Promise<AuthorizeResult> {
    return this.providerFor(method).authorizeAndCapture(input);
  }

  refund(input: RefundInput, method?: string): Promise<{ status: 'succeeded' | 'failed' }> {
    return this.providerFor(method).refund(input);
  }
}
