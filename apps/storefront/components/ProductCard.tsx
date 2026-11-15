import Link from "next/link";
import type { Locale } from "@mercato/i18n";
import { productTypeBadge, type ProductSummary } from "@/lib/product-types";
import { formatMoney } from "@/lib/money";
import { monogramFromTitle, swatchGradient } from "@/lib/hash-color";

// No catalog key for a standalone "View" verb — gap noted in the storefront
// i18n summary (closest key, product.viewCart, includes "cart" wording that
// doesn't fit this context).
const VIEW_LABEL: Record<Locale, string> = { ar: "عرض", en: "View" };

export function ProductCard({ product, locale }: { product: ProductSummary; locale: Locale }) {
  const badge = productTypeBadge(product.type, locale);

  return (
    <li>
      <Link
        href={`/${locale}/products/${product.slug}`}
        className="ticket-card"
        aria-label={`${VIEW_LABEL[locale]} ${product.title}`}
      >
        <span
          className="ticket-card__swatch"
          style={{ background: swatchGradient(product.slug) }}
        >
          {badge && <span className="ticket-card__badge badge">{badge}</span>}
          <span className="ticket-card__monogram" aria-hidden="true">
            {monogramFromTitle(product.title)}
          </span>
          <span className="ticket-card__hole" aria-hidden="true" />
        </span>
        <span className="ticket-card__body">
          <span className="ticket-card__title">{product.title}</span>
          <span className="ticket-card__price-row">
            <span className="ticket-card__price i18n-ltr">{formatMoney(product.from_price)}</span>
            <span className="ticket-card__arrow" aria-hidden="true">
              →
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}
