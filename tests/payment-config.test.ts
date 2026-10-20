import { test } from "node:test";
import assert from "node:assert/strict";
import { paymentReadiness } from "../packages/server/commerce/payment-config";
const configured = {
  COMMERCE_GATEWAY_URL: "https://connector.example/api/",
  COMMERCE_GATEWAY_SECRET: "a".repeat(32),
  COMMERCE_GATEWAY_WEBHOOK_SECRET: "b".repeat(32),
  COMMERCE_PAYMENT_HOSTS:
    "checkout.example,testsecureacceptance.cybersource.com",
};
test("missing setup stays disabled without exposing values", () => {
  assert.equal(paymentReadiness({}).ready, false);
  assert.equal(paymentReadiness(configured).ready, true);
});
test("rejects unsafe connector URLs and reused signing keys", () => {
  for (const url of [
    "http://connector.example",
    "https://user:secret@connector.example",
    "https://connector.example?key=secret",
    "invalid",
  ])
    assert.equal(
      paymentReadiness({ ...configured, COMMERCE_GATEWAY_URL: url }).ready,
      false,
    );
  assert.equal(
    paymentReadiness({
      ...configured,
      COMMERCE_GATEWAY_WEBHOOK_SECRET: configured.COMMERCE_GATEWAY_SECRET,
    }).ready,
    false,
  );
});
test("rejects ambiguous checkout allowlists", () => {
  for (const host of [
    "*.example",
    "https://checkout.example",
    "checkout.example/pay",
    "checkout.example:443",
    "checkout.example,",
    "checkout.example?x=1",
  ])
    assert.equal(
      paymentReadiness({ ...configured, COMMERCE_PAYMENT_HOSTS: host }).ready,
      false,
      host,
    );
});
