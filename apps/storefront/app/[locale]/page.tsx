import { CategoriesDocument, ProductsDocument } from "@mercato/graphql";
import { createT, type Locale } from "@mercato/i18n";
import { getServerClient } from "@/lib/server-client";
import { resolveLocale } from "@/lib/locale";
import { errorMessage } from "@/lib/graphql-error";
import { ProductCard } from "@/components/ProductCard";
import { CategoryNav } from "@/components/CategoryNav";

// No catalog key for a bare product count yet — gap noted in the storefront
// i18n summary (closest key, cart.items, is scoped to cart contents).
const ITEM_COUNT: Record<Locale, (count: number) => string> = {
  ar: (count) => `${count} ${count === 1 ? "منتج" : "منتجات"}`,
  en: (count) => `${count} item${count === 1 ? "" : "s"}`,
};

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { locale: rawLocale } = await params;
  const { category: rawCategory } = await searchParams;
  const categorySlug = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
  const locale = resolveLocale(rawLocale);
  const t = createT(locale);
  const client = getServerClient();

  try {
    const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
      client.query({
        query: ProductsDocument,
        variables: { locale, limit: 48, categorySlug: categorySlug || undefined },
      }),
      client.query({ query: CategoriesDocument }),
    ]);
    const products = productsData.products;
    const categories = categoriesData.categories;

    return (
      <div className="page">
        <div className="page__eyebrow-row">
          <p className="eyebrow">{t("home.eyebrow")}</p>
          <p className="eyebrow eyebrow--muted">{ITEM_COUNT[locale](products.length)}</p>
        </div>
        <h1 className="page__title">{t("home.title")}</h1>

        {categories.length > 0 && (
          <CategoryNav categories={categories} selectedSlug={categorySlug} locale={locale} />
        )}

        {products.length === 0 ? (
          <p className="alert alert--muted" role="status">
            {t("home.empty")}
          </p>
        ) : (
          <ul className="ticket-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </ul>
        )}
      </div>
    );
  } catch (err) {
    return (
      <div className="page">
        <p className="alert alert--error" role="alert">
          {errorMessage(err, t("common.error"))}
        </p>
      </div>
    );
  }
}
