import { z } from "zod";
import { idSchema } from "./index";
export const commerceCurrencies = [
  "ILS",
  "USD",
  "JOD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "KWD",
  "JPY",
] as const;
export const currencySchema = z.enum(commerceCurrencies);
export const countrySchema = z
  .string()
  .regex(/^[A-Z]{2}$/, "Use a two-letter country code");
export function fractionDigits(currency: string) {
  return (
    new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2
  );
}
export function minorAmount(amount: number, currency: string) {
  const scale = 10 ** fractionDigits(currency);
  const n = Math.round(amount * scale);
  if (!Number.isSafeInteger(n) || n < 0 || Math.abs(n / scale - amount) > 1e-8)
    throw new Error("Invalid money precision");
  return n;
}
export function displayMoney(minor: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(
    minor / 10 ** fractionDigits(currency),
  );
}
export const slugSchema = z
  .string()
  .min(3)
  .max(60)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase words separated by hyphens",
  );
const imageSchema = z.union([
  z.literal(""),
  z.string().regex(/^\/api\/commerce\/media\/[a-f0-9]{24}$/),
  z.url().refine((s) => s.startsWith("https://"), "Use an HTTPS image URL"),
]);
export const storeSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: slugSchema,
  description: z.string().trim().max(2000).default(""),
  country: countrySchema.default("PS"),
  currency: currencySchema.default("ILS"),
  logo: imageSchema.default(""),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#275d45"),
  contactEmail: z.union([z.literal(""), z.email()]).default(""),
  phone: z.string().trim().max(30).default(""),
  address: z.string().trim().max(500).default(""),
  shippingFee: z.number().int().min(0).max(100000000).default(0),
  freeShippingAbove: z.number().int().min(0).max(100000000).default(0),
  taxBps: z.number().int().min(0).max(10000).default(0),
  deliveryCountries: z.array(countrySchema).min(1).max(100).default(["PS"]),
  codEnabled: z.boolean().default(true),
  pickupEnabled: z.boolean().default(true),
  returnsDays: z.number().int().min(0).max(365).default(14),
  shippingPolicy: z.string().max(5000).default(""),
  returnPolicy: z.string().max(5000).default(""),
  privacyPolicy: z.string().max(5000).default(""),
});
export const variantSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,60}$/),
  name: z.string().trim().min(1).max(120),
  sku: z.string().trim().min(1).max(100),
  price: z.number().int().min(1).max(100000000),
  stock: z.number().int().min(0).max(1000000),
  attributes: z.record(z.string().max(60), z.string().max(120)).default({}),
});
export const commerceProductSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    description: z.string().trim().min(5).max(10000),
    categoryId: z.union([z.literal(""), idSchema]).default(""),
    type: z.enum(["physical", "digital", "service"]).default("physical"),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    images: z.array(imageSchema).max(8).default([]),
    variants: z.array(variantSchema).min(1).max(100),
    trackStock: z.boolean().default(true),
    featured: z.boolean().default(false),
    attributes: z.record(z.string().max(60), z.string().max(200)).default({}),
    deliveryUrl: z
      .union([z.literal(""), z.url().refine((s) => s.startsWith("https://"))])
      .default(""),
  })
  .superRefine((p, ctx) => {
    if (new Set(p.variants.map((v) => v.id)).size !== p.variants.length)
      ctx.addIssue({ code: "custom", message: "Variant IDs must be unique" });
    if (new Set(p.variants.map((v) => v.sku)).size !== p.variants.length)
      ctx.addIssue({ code: "custom", message: "Variant SKUs must be unique" });
    if (p.type === "digital" && p.status === "active" && !p.deliveryUrl)
      ctx.addIssue({
        code: "custom",
        message: "Digital products need a delivery URL",
      });
  });
export const categorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: slugSchema,
  parentId: z.union([z.literal(""), idSchema]).default(""),
});
export const cartLineSchema = z.object({
  productId: idSchema,
  variantId: z.string().min(1).max(60),
  quantity: z.number().int().min(1).max(100),
});
export const cartSchema = z
  .object({ storeId: idSchema, lines: z.array(cartLineSchema).max(50) })
  .refine(
    (x) =>
      new Set(x.lines.map((l) => `${l.productId}:${l.variantId}`)).size ===
      x.lines.length,
    "Duplicate cart items",
  );
export const addressSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  country: countrySchema.default("PS"),
  city: z.string().trim().min(2).max(100),
  street: z.string().trim().min(3).max(300),
  postalCode: z.string().trim().max(30).default(""),
});
export const checkoutSchema = cartSchema
  .extend({
    address: addressSchema,
    delivery: z.enum(["shipping", "pickup"]).default("shipping"),
    paymentMethod: z.enum(["cod", "card"]).default("cod"),
    coupon: z.string().trim().max(40).default(""),
    notes: z.string().trim().max(1000).default(""),
    idempotencyKey: z.uuid(),
    expectedTotal: z.number().int().positive(),
    expectedCurrency: currencySchema,
  })
  .refine((x) => x.lines.length > 0, "Cart is empty");
export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[A-Z0-9_-]+$/),
    kind: z.enum(["percentage", "fixed"]),
    value: z.number().int().min(1).max(100000000),
    minimum: z.number().int().min(0).default(0),
    limit: z.number().int().min(1).max(1000000).default(100),
    expiresAt: z.iso.datetime(),
    active: z.boolean().default(true),
  })
  .refine(
    (x) => x.kind !== "percentage" || x.value <= 10000,
    "Percentage must be at most 10000 basis points",
  );
export function totals(
  subtotal: number,
  discount: number,
  shipping: number,
  taxBps: number,
) {
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round((taxable * taxBps) / 10000);
  const total = taxable + shipping + tax;
  if (!Number.isSafeInteger(total) || total < 1)
    throw new Error("Invalid order total");
  return { subtotal, discount, shipping, tax, total };
}
export const fulfillmentTransitions: Record<string, string[]> = {
  unfulfilled: ["processing", "cancelled"],
  processing: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
export type StoreInput = z.infer<typeof storeSchema>;
export type CommerceProductInput = z.infer<typeof commerceProductSchema>;
