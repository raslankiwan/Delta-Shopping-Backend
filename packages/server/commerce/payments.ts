import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { reject } from "./shared";
// Adapter contract for a bank-approved payment connector. This is not a claim
// that Bank of Palestine exposes these endpoint shapes; its merchant integration
// must implement this contract after the bank supplies its integration pack.
export function gatewayReady() {
  return !!(
    process.env.COMMERCE_GATEWAY_URL &&
    process.env.COMMERCE_GATEWAY_SECRET &&
    process.env.COMMERCE_GATEWAY_WEBHOOK_SECRET &&
    process.env.COMMERCE_PAYMENT_HOSTS
  );
}
const paymentResult = z.object({
  id: z.string().min(1).max(200),
  url: z.url(),
  status: z.enum(["pending", "paid", "failed", "expired", "refunded"]),
  amount: z.number().int(),
  currency: z.string(),
  orderId: z.string(),
});
export async function gatewayCall(
  operation: "create" | "status" | "cancel" | "refund",
  payload: Record<string, unknown>,
) {
  if (!gatewayReady())
    reject(503, "Online payments are awaiting merchant gateway setup");
  const base = new URL(process.env.COMMERCE_GATEWAY_URL!);
  if (base.protocol !== "https:" && process.env.NODE_ENV !== "test")
    reject(503, "Payment connector must use HTTPS");
  const body = JSON.stringify(payload);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", process.env.COMMERCE_GATEWAY_SECRET!)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  const response = await fetch(
    new URL(
      `payments/${operation}`,
      base.href.endsWith("/") ? base : base.href + "/",
    ),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Commerce-Timestamp": timestamp,
        "X-Commerce-Signature": signature,
      },
      body,
      signal: AbortSignal.timeout(15000),
      redirect: "error",
    },
  );
  if (!response.ok)
    reject(502, "Payment provider unavailable; retry using the same order");
  const data = paymentResult.parse(await response.json());
  if (data.orderId !== payload.orderId)
    reject(502, "Payment provider returned a mismatched order");
  if (operation === "create") {
    const allowed = process.env
      .COMMERCE_PAYMENT_HOSTS!.split(",")
      .map((x) => x.trim());
    const url = new URL(data.url);
    if (url.protocol !== "https:" || !allowed.includes(url.hostname))
      reject(502, "Unrecognized payment destination");
  }
  return data;
}
export function verifyWebhook(
  body: string,
  timestamp: string | null,
  signature: string | null,
) {
  if (
    !process.env.COMMERCE_GATEWAY_WEBHOOK_SECRET ||
    !timestamp ||
    !signature ||
    !/^[a-f0-9]{64}$/.test(signature)
  )
    reject(401, "Invalid payment signature");
  const n = Number(timestamp);
  if (!Number.isFinite(n) || Math.abs(Date.now() / 1000 - n) > 300)
    reject(401, "Payment signature expired");
  const expected = createHmac(
    "sha256",
    process.env.COMMERCE_GATEWAY_WEBHOOK_SECRET,
  )
    .update(`${timestamp}.${body}`)
    .digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex")))
    reject(401, "Invalid payment signature");
}
export const paymentEventSchema = z.object({
  eventId: z.string().min(1).max(200),
  orderId: z.string().regex(/^[a-f0-9]{24}$/),
  paymentId: z.string().min(1).max(200),
  merchantRef: z.string().min(1).max(200),
  status: z.enum(["paid", "failed", "expired", "refunded"]),
  amount: z.number().int().positive(),
  currency: z.string().length(3),
});
