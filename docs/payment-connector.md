# Approved payment connector contract

This contract is an integration boundary owned by Delta. It is **not** Bank of Palestine's API specification. Implement it using the bank's actual merchant integration documentation after onboarding. No live bank endpoint or undocumented bank protocol is assumed.

## Configuration

Server-only environment variables:

- `APP_URL`: canonical HTTPS application origin.
- `COMMERCE_GATEWAY_URL`: HTTPS base URL of the approved connector.
- `COMMERCE_GATEWAY_SECRET`: outbound request signing key.
- `COMMERCE_GATEWAY_WEBHOOK_SECRET`: independent inbound event signing key.
- `COMMERCE_PAYMENT_HOSTS`: comma-separated exact allowed checkout hostnames. Redirects to other hosts are rejected.

A platform administrator assigns `merchantRef` and enabled=true using `POST /api/commerce/stores/:storeId/payments`. Never put API keys into merchantRef or browser settings. Actual bank keys belong in the connector's secret store. Store APIs omit internal payment configuration from public responses.

## Outbound calls

The platform sends JSON POST requests to `payments/create`, `payments/status`, `payments/cancel`, and `payments/refund` under the base URL. Requests contain `orderId`, `merchantRef`, and operation-specific parameters. Create includes integer `amount`, ISO `currency`, `idempotencyKey`, `customerEmail`, `expiresAt`, `returnUrl`, and `webhookUrl`. Refund includes the amount/currency and a stable idempotency key. Status/cancel include paymentId when available. Never collect raw card information in Delta.

Headers:

```
X-Commerce-Timestamp: <Unix seconds>
X-Commerce-Signature: <lowercase hex HMAC-SHA256(timestamp + '.' + exact raw JSON body)>
```

The connector must verify signatures with constant-time comparison and reject timestamps older/newer than 5 minutes. It must implement durable idempotency for create, cancel, and refund. Do not rely on an in-memory cache for financial idempotency.

Response:

```json
{
  "id": "provider-transaction-reference",
  "url": "https://approved-bank-checkout.example/pay/...",
  "status": "pending",
  "amount": 15000,
  "currency": "ILS",
  "orderId": "24-character-order-id"
}
```

Allowed states: pending, paid, failed, expired, refunded. Create must return pending; payment completion is verified separately. Status must resolve ambiguous create/network failures by stable orderId. Cancel may return expired/failed only after the provider guarantees no further capture. Never release inventory merely because a redirect was abandoned.

## Inbound events

POST JSON to `/api/commerce/payments/webhook` with `X-Commerce-Timestamp` and `X-Commerce-Signature`, signed with the webhook key using the same raw-body scheme:

```json
{
  "eventId": "unique-provider-event",
  "orderId": "24-character-order-id",
  "paymentId": "provider-transaction-reference",
  "merchantRef": "approved-store-merchant",
  "status": "paid",
  "amount": 15000,
  "currency": "ILS"
}
```

Allowed events: paid, failed, expired, refunded. The platform verifies amount, currency, merchant, order, and payment identity before applying an event inside a transaction. Event IDs have a unique index. Duplicates are acknowledged without repeating side effects. Out-of-order failures do not downgrade paid orders; payment on closed orders is rejected for operator reconciliation. Late paid events do not reopen refunded orders.

The connector must retry non-2xx webhooks with backoff and retain delivery/reconciliation records. Return pages cannot set payment status. Authenticated buyer refreshes retrieve provider status server-side. A CRON_SECRET-protected daily maintenance job reconciles up to 20 expired pending orders per run and asks the provider to cancel open sessions before releasing inventory. Provider expiry webhooks remain the primary expiry mechanism. Increase reconciliation frequency/capacity for a high-volume launch; the included schedule fits the current Vercel Hobby account. Buyer cancellation and refresh also reconcile payment state.

## Merchant approval and testing

Before enabling real cards: receive the bank's supported checkout/refund/status/webhook specifications, verify per-store settlement, implement the connector, use merchant sandbox credentials, test success/decline/3DS/abandonment/network uncertainty/duplicate callback/refund, reconcile actual provider reports, then enable the approved merchant reference. The repository integration tests use a simulated connector to verify the platform contract; they do not certify a live bank connection.

## Palestine provider setup

Arab Bank's Palestinian [payment gateway](https://www.arabbank.ps/mainmenu/home/smes-banking/digitalization-and-innovation/payment-gateway) explicitly uses Cybersource. Obtain the merchant account's integration pack before selecting Secure Acceptance, Unified Checkout or another interface; the bank's marketing page does not establish which API is provisioned. Bank of Palestine is an alternative acquirer. Reflect account availability is not evidence of a direct merchant API. PalPay and Jawwal Pay require their own approved merchant documentation. Do not configure a consumer transfer address as an automated gateway.

1. Obtain merchant approval and sandbox credentials; confirm each store's independent settlement and whether a platform/submerchant arrangement is permitted.
2. Confirm supported presentment and settlement currencies (ILS/USD/JOD), product restrictions, fees, refunds and reconciliation capabilities in the merchant agreement.
3. Implement the provider connector against the issued documentation, including durable idempotency, status, cancellation and refund support. Use provider sandbox hosts only during sandbox testing.
4. Store actual provider credentials in the connector's secret store. Set the four `COMMERCE_*` variables in Vercel, using separate random signing keys of at least 32 characters. Configure exact checkout hostnames; no URLs, wildcards or trailing commas.
5. Run `npm run payments:check` with the target environment loaded. It prints configuration names and validation errors without printing secrets. A successful check validates configuration only; it does not prove merchant approval or a working bank connection.
6. Complete the acceptance scenarios above and reconciliation against the provider's merchant reports. Then assign each approved store's merchant reference through the platform admin payment settings and enable it. Start with one approved store.

Admin payment settings expose configuration diagnostics only to platform administrators. Invalid/partial connector configuration keeps online checkout disabled. There is no direct Reflect, PalPay, Jawwal Pay or Cybersource bank adapter activated by this checklist.
