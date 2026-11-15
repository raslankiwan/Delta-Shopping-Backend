import Link from "next/link";
import type { Locale } from "@mercato/i18n";
import type { CategorySummary } from "@/lib/product-types";

// No catalog key for "All" yet — gap noted in the storefront i18n summary.
const ALL_LABEL: Record<Locale, string> = { ar: "الكل", en: "All" };

export function CategoryNav({
  categories,
  selectedSlug,
  locale,
}: {
  categories: CategorySummary[];
  selectedSlug?: string;
  locale: Locale;
}) {
  const sorted = [...categories].sort((a, b) => a.position - b.position);

  return (
    <nav className="category-nav" aria-label={ALL_LABEL[locale]}>
      <Link
        href={`/${locale}`}
        className={`pill-button${!selectedSlug ? " pill-button--active" : ""}`}
        aria-pressed={!selectedSlug}
      >
        {ALL_LABEL[locale]}
      </Link>
      {sorted.map((category) => (
        <Link
          key={category.id}
          href={`/${locale}?category=${category.slug}`}
          className={`pill-button${selectedSlug === category.slug ? " pill-button--active" : ""}`}
          aria-pressed={selectedSlug === category.slug}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
