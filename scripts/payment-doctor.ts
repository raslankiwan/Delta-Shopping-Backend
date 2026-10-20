import { paymentReadiness } from "../packages/server/commerce/payment-config";
const result = paymentReadiness();
console.log(
  "Payment connector configuration: " + (result.ready ? "VALID" : "INCOMPLETE"),
);
for (const issue of result.issues) console.log("- " + issue);
console.log(
  "Configuration validity does not certify a bank connection. Merchant approval, sandbox verification and per-store settlement approval are required before enabling payments.",
);
process.exitCode = result.ready ? 0 : 1;
