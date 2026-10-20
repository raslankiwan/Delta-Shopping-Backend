import { reject } from "./shared";
export function emailReady() {
  return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  idempotencyKey: string,
) {
  if (!emailReady()) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      text,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) reject(503, "Email delivery is temporarily unavailable");
  return true;
}
