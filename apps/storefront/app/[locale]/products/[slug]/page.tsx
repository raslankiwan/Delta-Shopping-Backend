import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApolloError } from "@apollo/client";
import { ProductDocument } from "@mercato/graphql";
import { createT } from "@mercato/i18n";
import { getServerClient } from "@/lib/server-client";
import { resolveLocale } from "@/lib/locale";
import { errorCode } from "@/lib/graphql-error";
import { monogramFromTitle, swatchGradient } from "@/lib/hash-color";
import { productTypeBadge } from "@/lib/product-types";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { ProductGallery } from "@/components/ProductGallery";

type ProductPageParams = { locale: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<ProductPageParams>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const client = getServerClient();

  try {
    const { data } = await client.query({ query: ProductDocument, variables: { slug, locale } });
    const product = data.product;
    if (!product) return {};
    return {
      title: product.seo_title || product.title,
      description: product.seo_description || product.description || undefined,
    };
  } catch {
    return {};
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<ProductPageParams>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const t = createT(locale);
  const client = getServerClient();

  const product = await (async () => {
    try {
      const { data } = await client.query({ query: ProductDocument, variables: { slug, locale } });
      return { ok: true as const, product: data.product };
    } catch (err) {
      if (err instanceof ApolloError && errorCode(err) === "product_not_found") {
        notFound();
      }
      return { ok: false as const };
    }
  })();

  if (!product.ok) {
    return (
      <div className="page">
        <p className="alert alert--error" role="alert">
          {t("common.error")}
        </p>
      </div>
    );
  }
  if (!product.product) notFound();
  const p = product.product;
  const typeBadge = productTypeBadge(p.type, locale);

  return (
    <div className="page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href={`/${locale}`}>{t("nav.catalog")}</a>
        <span aria-hidden="true">/</span>
        <span>{p.title}</span>
      </nav>
      <div className="product-layout">
        <ProductGallery
          images={p.images}
          title={p.title}
          placeholder={{
            gradient: swatchGradient(p.slug),
            monogram: monogramFromTitle(p.title),
          }}
        />
        <div>
          {p.vendor && <span className="product-vendor">{p.vendor}</span>}
          <div className="product-title-row">
            <h1 className="product-title">{p.title}</h1>
            {typeBadge && <span className="badge">{typeBadge}</span>}
          </div>
          {p.subtitle && <p className="product-subtitle">{p.subtitle}</p>}
          {p.description && <p className="product-description">{p.description}</p>}
          {p.tags.length > 0 && (
            <ul className="product-tags">
              {p.tags.map((tag) => (
                <li key={tag} className="product-tag">
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <ProductPurchasePanel product={p} locale={locale} />
        </div>
      </div>
    </div>
  );
}
