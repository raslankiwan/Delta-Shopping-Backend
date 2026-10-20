import { z } from "zod";
export const categories = [
  "Mobiles",
  "Laptops",
  "Cars",
  "Clothes",
  "Music",
  "Other",
] as const;
export const categoryImages: Record<string, string> = {
  Mobiles: "/images/cat5.jpg",
  Laptops: "/images/cat7.jpg",
  Cars: "/images/cat2.jpg",
  Clothes: "/images/cat4.jpg",
  Music: "/images/cat3.jpg",
  Other: "/images/cat1.jpg",
};
export const currencies = ["USD", "JOD", "NIS"] as const;
export const idSchema = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid ID");
export const credentialsSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  password: z.string().min(10).max(128),
});
export const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(80),
});
export const productSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  category: z.enum(categories),
  price: z.number().positive().max(100000000),
  currency: z.enum(currencies),
  company: z.string().trim().max(80).default(""),
  location: z.string().trim().min(2).max(120),
  image: z
    .union([
      z.literal(""),
      z.url().refine((s) => s.startsWith("https://"), "Use an HTTPS image URL"),
    ])
    .default(""),
  condition: z.enum(["New", "Like new", "Good", "Used"]).default("Good"),
});
export const reviewSchema = z.object({
  text: z.string().trim().min(3).max(1500),
  rating: z.number().int().min(1).max(5),
});
export const messageSchema = z.object({
  productId: idSchema,
  to: idSchema,
  text: z.string().trim().min(1).max(2000),
});
export type ProductInput = z.infer<typeof productSchema>;
export type Product = ProductInput & {
  _id: string;
  sellerId: string;
  sellerName: string;
  status: "active" | "sold" | "hidden";
  views: number;
  createdAt: string;
  sample?: boolean;
};
export type User = {
  _id: string;
  email: string;
  name: string;
  role: "member" | "admin";
  disabled?: boolean;
};
export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function money(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency === "NIS" ? "ILS" : currency,
    maximumFractionDigits: 2,
  }).format(value);
}
