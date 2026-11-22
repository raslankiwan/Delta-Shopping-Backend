import { describe, expect, test } from 'bun:test';
import {
  CashOnDeliveryProvider,
  PalPayProvider,
  StripePaymentProvider,
  TestPaymentProvider,
} from './payment-provider';

const order = { amountMinor: 12_000, currency: 'ILS', orderRef: 'order-1' };

describe('payment providers', () => {
  test('cash on delivery authorizes but does not capture', async () => {
    const result = await new CashOnDeliveryProvider().authorizeAndCapture(order);
    expect(result.status).toBe('authorized');
    expect(result.ref).toStartWith('cod_');
  });

  test('the test provider captures immediately', async () => {
    const result = await new TestPaymentProvider().authorizeAndCapture(order);
    expect(result.status).toBe('captured');
    expect(result.ref).toStartWith('test_');
  });

  test('each payment gets its own reference', async () => {
    const cod = new CashOnDeliveryProvider();
    const [a, b] = await Promise.all([cod.authorizeAndCapture(order), cod.authorizeAndCapture(order)]);
    expect(a.ref).not.toBe(b.ref);
  });

  test('gateways that are not integrated yet fail loudly instead of pretending', async () => {
    await expect(new StripePaymentProvider('sk_test').authorizeAndCapture(order)).rejects.toThrow(
      'not implemented',
    );
    await expect(new PalPayProvider('key').refund({ providerRef: 'x', amountMinor: 100 })).rejects.toThrow(
      'not implemented',
    );
  });
});
