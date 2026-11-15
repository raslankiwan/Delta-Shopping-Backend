import type { CategoriesQuery, ProductQuery, ProductsQuery } from "@mercato/graphql";
import type { Locale } from "@mercato/i18n";

/** Catalog card shape used on the home page grid (`ProductsDocument`). */
export type ProductSummary = ProductsQuery["products"][number];

/** Full product detail shape used on the PDP (`ProductDocument`). */
export type ProductDetail = NonNullable<ProductQuery["product"]>;

export type ProductImage = ProductDetail["images"][number];
export type ProductVariant = ProductDetail["variants"][number];

/** Category nav entry shape (`CategoriesDocument`). */
export type CategorySummary = CategoriesQuery["categories"][number];

// No catalog keys for product-type badges yet — gap noted in the storefront
// i18n summary. "physical" intentionally has no badge (the default case).
const TYPE_BADGE_LABEL: Record<Locale, Partial<Record<string, string>>> = {
  ar: { digital: "رقمي", service: "خدمة" },
  en: { digital: "Digital", service: "Service" },
};

/** Small badge label for non-physical product types, or null for physical. */
export function productTypeBadge(type: string, locale: Locale): string | null {
  return TYPE_BADGE_LABEL[locale][type] ?? null;
}
