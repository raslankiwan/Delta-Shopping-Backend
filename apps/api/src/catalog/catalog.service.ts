import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, sql } from 'drizzle-orm';
import {
  category,
  price,
  priceList,
  product,
  productImage,
  productOption,
  productOptionValue,
  productVariant,
  store,
  storeCurrency,
  storeLocale,
  translation,
  withStore,
  type DbHandle,
} from '@mercato/db';
import { type MoneyLike } from '@mercato/core';
import { DB_HANDLE } from '../db/database.module';
import { resolveProductFromPrice, resolveVariantPricing } from '../pricing/price-resolver';
import type {
  CreateCategoryInput,
  CreateProductInput,
  CreateVariantInput,
  SetPriceInput,
  UpdateProductInput,
} from './dto';

export interface CategoryRef {
  id: string;
  slug: string;
  name: string;
}

export interface ProductListItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  from_price: MoneyLike | null;
}

export interface CategoryView extends CategoryRef {
  parent_id: string | null;
  position: number;
}

export interface VariantDetail {
  id: string;
  sku: string;
  option_values: Record<string, string>;
  price: MoneyLike | null;
  compare_at: MoneyLike | null;
}

export interface ProductImageDto {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

export interface ProductOptionDto {
  name: string;
  values: string[];
}

export interface ProductDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  type: string;
  requires_shipping: boolean;
  service_duration_minutes: number | null;
  service_location: string | null;
  category: CategoryRef | null;
  vendor: string | null;
  tags: string[];
  status: string;
  currency: string;
  locale: string;
  seo_title: string | null;
  seo_description: string | null;
  images: ProductImageDto[];
  options: ProductOptionDto[];
  variants: VariantDetail[];
}

interface LocaleCurrency {
  locale: string;
  currency: string;
}

@Injectable()
export class CatalogService {
  constructor(@Inject(DB_HANDLE) private readonly handle: DbHandle) {}

  /** Run work bound to the tenant so RLS scopes every query to this store. */
  private run<T>(storeId: string, work: Parameters<typeof withStore<T>>[2]): Promise<T> {
    return withStore(this.handle.db, storeId, work);
  }

  // --- storefront reads ---------------------------------------------------

  /** Public store config for the storefront: supported locales, currencies, defaults. */
  async getStorefrontConfig(storeId: string) {
    return this.run(storeId, async (tx) => {
      const [s] = await tx
        .select({
          name: store.name,
          defaultLocale: store.defaultLocale,
          defaultCurrency: store.defaultCurrency,
          taxRateBps: store.taxRateBps,
        })
        .from(store)
        .limit(1);
      const locales = await tx
        .select({ locale: storeLocale.locale, isDefault: storeLocale.isDefault })
        .from(storeLocale)
        .where(eq(storeLocale.enabled, true));
      const currencies = await tx
        .select({ currency: storeCurrency.currency, isDefault: storeCurrency.isDefault })
        .from(storeCurrency)
        .where(eq(storeCurrency.enabled, true));
      return {
        name: s?.name ?? '',
        default_locale: s?.defaultLocale ?? 'ar',
        default_currency: s?.defaultCurrency ?? 'ILS',
        tax_bps: s?.taxRateBps ?? 0,
        locales: locales.map((l) => l.locale),
        currencies: currencies.map((c) => c.currency),
      };
    });
  }

  async listActiveProducts(
    storeId: string,
    opts: { locale?: string; currency?: string; limit?: number; categorySlug?: string; type?: string },
  ): Promise<{ data: ProductListItem[] }> {
    return this.run(storeId, async (tx) => {
      const { locale, currency } = await resolveLocaleCurrency(tx, opts);
      const limit = Math.min(opts.limit ?? 50, 100);

      const filters = [eq(product.status, 'active')];
      if (opts.categorySlug) {
        const [cat] = await tx
          .select({ id: category.id })
          .from(category)
          .where(eq(category.slug, opts.categorySlug))
          .limit(1);
        // Unknown category → no matches (rather than "all").
        filters.push(eq(product.categoryId, cat?.id ?? '00000000-0000-0000-0000-000000000000'));
      }
      if (opts.type) filters.push(eq(product.type, opts.type));

      const products = await tx
        .select()
        .from(product)
        .where(and(...filters))
        .orderBy(asc(product.slug))
        .limit(limit);

      const titles = await localizedTitles(
        tx,
        products.map((p) => p.id),
        locale,
      );

      const data: ProductListItem[] = [];
      for (const p of products) {
        data.push({
          id: p.id,
          slug: p.slug,
          title: titles.get(p.id) ?? p.title,
          type: p.type,
          status: p.status,
          from_price: await resolveProductFromPrice(tx, p.id, currency),
        });
      }
      return { data };
    });
  }

  /** All categories for the store (storefront nav + admin picker). */
  async listCategories(storeId: string): Promise<{ data: CategoryView[] }> {
    return this.run(storeId, async (tx) => {
      const rows = await tx
        .select({
          id: category.id,
          slug: category.slug,
          name: category.name,
          parent_id: category.parentId,
          position: category.position,
        })
        .from(category)
        .orderBy(asc(category.position), asc(category.name));
      return { data: rows };
    });
  }

  async createCategory(storeId: string, input: CreateCategoryInput): Promise<{ id: string }> {
    return this.run(storeId, async (tx) => {
      const [row] = await tx
        .insert(category)
        .values({
          storeId,
          slug: input.slug,
          name: input.name,
          parentId: input.parentId ?? null,
          position: input.position ?? 0,
        })
        .returning({ id: category.id });
      return { id: row!.id };
    });
  }

  async getProductBySlug(
    storeId: string,
    slug: string,
    opts: { locale?: string; currency?: string },
  ): Promise<ProductDetail> {
    return this.run(storeId, async (tx) => {
      const { locale, currency } = await resolveLocaleCurrency(tx, opts);
      const [p] = await tx.select().from(product).where(eq(product.slug, slug)).limit(1);
      if (!p) throw new NotFoundException({ code: 'product_not_found', detail: `No product "${slug}"` });

      const [title, subtitle, description, seoTitle, seoDescription] = await Promise.all([
        localizedField(tx, 'product', p.id, 'title', locale),
        localizedField(tx, 'product', p.id, 'subtitle', locale),
        localizedField(tx, 'product', p.id, 'description', locale),
        localizedField(tx, 'product', p.id, 'seo_title', locale),
        localizedField(tx, 'product', p.id, 'seo_description', locale),
      ]);

      const variants = await tx
        .select()
        .from(productVariant)
        .where(eq(productVariant.productId, p.id))
        .orderBy(asc(productVariant.position));

      const variantDetails: VariantDetail[] = [];
      for (const v of variants) {
        const pricing = await resolveVariantPricing(tx, v.id, currency);
        variantDetails.push({
          id: v.id,
          sku: v.sku,
          option_values: (v.optionValues ?? {}) as Record<string, string>,
          price: pricing.price,
          compare_at: pricing.compare_at,
        });
      }

      return {
        id: p.id,
        slug: p.slug,
        title: title ?? p.title,
        subtitle: subtitle ?? p.subtitle,
        description: description ?? p.description,
        type: p.type,
        requires_shipping: p.requiresShipping,
        service_duration_minutes: p.serviceDurationMinutes,
        service_location: p.serviceLocation,
        category: await this.loadCategoryRef(tx, p.categoryId),
        vendor: p.vendor,
        tags: p.tags ?? [],
        status: p.status,
        currency,
        locale,
        seo_title: seoTitle ?? p.seoTitle,
        seo_description: seoDescription ?? p.seoDescription,
        images: await this.loadImages(tx, p.id),
        options: await this.loadOptions(tx, p.id),
        variants: variantDetails,
      };
    });
  }

  private async loadCategoryRef(tx: Tx, categoryId: string | null): Promise<CategoryRef | null> {
    if (!categoryId) return null;
    const [c] = await tx
      .select({ id: category.id, slug: category.slug, name: category.name })
      .from(category)
      .where(eq(category.id, categoryId))
      .limit(1);
    return c ?? null;
  }

  private async loadImages(tx: Tx, productId: string): Promise<ProductImageDto[]> {
    const rows = await tx
      .select({ id: productImage.id, url: productImage.url, alt: productImage.alt, position: productImage.position })
      .from(productImage)
      .where(eq(productImage.productId, productId))
      .orderBy(asc(productImage.position));
    return rows;
  }

  private async loadOptions(tx: Tx, productId: string): Promise<ProductOptionDto[]> {
    const opts = await tx
      .select({ id: productOption.id, name: productOption.name })
      .from(productOption)
      .where(eq(productOption.productId, productId))
      .orderBy(asc(productOption.position));
    const result: ProductOptionDto[] = [];
    for (const o of opts) {
      const values = await tx
        .select({ value: productOptionValue.value })
        .from(productOptionValue)
        .where(eq(productOptionValue.optionId, o.id))
        .orderBy(asc(productOptionValue.position));
      result.push({ name: o.name, values: values.map((v) => v.value) });
    }
    return result;
  }

  async searchProducts(
    storeId: string,
    q: string,
    opts: { locale?: string; currency?: string; limit?: number },
  ): Promise<{ data: ProductListItem[] }> {
    return this.run(storeId, async (tx) => {
      const { locale, currency } = await resolveLocaleCurrency(tx, opts);
      const limit = Math.min(opts.limit ?? 50, 100);

      // Postgres FTS over title + description ('simple' config, language-agnostic).
      const rows = await tx
        .select()
        .from(product)
        .where(
          and(
            eq(product.status, 'active'),
            sql`to_tsvector('simple', coalesce(${product.title}, '') || ' ' || coalesce(${product.description}, '')) @@ plainto_tsquery('simple', ${q})`,
          ),
        )
        .limit(limit);

      const titles = await localizedTitles(
        tx,
        rows.map((p) => p.id),
        locale,
      );
      const data: ProductListItem[] = [];
      for (const p of rows) {
        data.push({
          id: p.id,
          slug: p.slug,
          title: titles.get(p.id) ?? p.title,
          type: p.type,
          status: p.status,
          from_price: await resolveProductFromPrice(tx, p.id, currency),
        });
      }
      return { data };
    });
  }

  // --- admin writes -------------------------------------------------------

  async createProduct(storeId: string, input: CreateProductInput): Promise<{ id: string }> {
    return this.run(storeId, async (tx) => {
      const type = input.type ?? 'physical';
      const [row] = await tx
        .insert(product)
        .values({
          storeId,
          slug: input.slug,
          title: input.title,
          subtitle: input.subtitle,
          description: input.description,
          type,
          // Digital/service items never ship unless explicitly overridden.
          requiresShipping: input.requiresShipping ?? type === 'physical',
          categoryId: input.categoryId ?? null,
          serviceDurationMinutes: input.serviceDurationMinutes,
          serviceLocation: input.serviceLocation,
          vendor: input.vendor,
          tags: input.tags ?? [],
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          status: input.status ?? 'draft',
        })
        .returning({ id: product.id });
      return { id: row!.id };
    });
  }

  /** Full product for the admin editor: fields + options + variants + images. */
  async getAdminProduct(storeId: string, id: string) {
    return this.run(storeId, async (tx) => {
      const [p] = await tx.select().from(product).where(eq(product.id, id)).limit(1);
      if (!p) throw new NotFoundException({ code: 'product_not_found', detail: `No product ${id}` });

      const variants = await tx
        .select()
        .from(productVariant)
        .where(eq(productVariant.productId, id))
        .orderBy(asc(productVariant.position));
      const defaultCurrency = (await resolveLocaleCurrency(tx, {})).currency;
      const variantRows = [];
      for (const v of variants) {
        const pricing = await resolveVariantPricing(tx, v.id, defaultCurrency);
        variantRows.push({
          id: v.id,
          sku: v.sku,
          option_values: (v.optionValues ?? {}) as Record<string, string>,
          status: v.status,
          price: pricing.price,
          compare_at: pricing.compare_at,
        });
      }

      // Translations grouped by locale.
      const trs = await tx
        .select({ locale: translation.locale, field: translation.field, value: translation.value })
        .from(translation)
        .where(and(eq(translation.entityType, 'product'), eq(translation.entityId, id)));
      const translations: Record<string, Record<string, string>> = {};
      for (const t of trs) (translations[t.locale] ??= {})[t.field] = t.value;

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle,
        description: p.description,
        type: p.type,
        requires_shipping: p.requiresShipping,
        service_duration_minutes: p.serviceDurationMinutes,
        service_location: p.serviceLocation,
        category: await this.loadCategoryRef(tx, p.categoryId),
        vendor: p.vendor,
        tags: p.tags ?? [],
        seo_title: p.seoTitle,
        seo_description: p.seoDescription,
        status: p.status,
        images: await this.loadImages(tx, id),
        options: await this.loadOptions(tx, id),
        variants: variantRows,
        translations,
      };
    });
  }

  async addOption(storeId: string, productId: string, name: string, values: string[]): Promise<{ id: string }> {
    return this.run(storeId, async (tx) => {
      const [existing] = await tx.select({ id: product.id }).from(product).where(eq(product.id, productId)).limit(1);
      if (!existing) throw new NotFoundException({ code: 'product_not_found', detail: `No product ${productId}` });
      const [count] = await tx
        .select({ n: sql<number>`count(*)::int` })
        .from(productOption)
        .where(eq(productOption.productId, productId));
      const [opt] = await tx
        .insert(productOption)
        .values({ storeId, productId, name, position: Number(count?.n ?? 0) })
        .returning({ id: productOption.id });
      if (values.length) {
        await tx
          .insert(productOptionValue)
          .values(values.map((value, i) => ({ storeId, optionId: opt!.id, value, position: i })));
      }
      return { id: opt!.id };
    });
  }

  /** Generate variants for the cartesian product of the product's options. */
  async generateVariants(storeId: string, productId: string): Promise<{ created: number }> {
    return this.run(storeId, async (tx) => {
      const [p] = await tx.select({ slug: product.slug }).from(product).where(eq(product.id, productId)).limit(1);
      if (!p) throw new NotFoundException({ code: 'product_not_found', detail: `No product ${productId}` });
      const options = await this.loadOptions(tx, productId);
      let combos: Array<Record<string, string>> = [{}];
      for (const opt of options) {
        const next: Array<Record<string, string>> = [];
        for (const combo of combos) for (const value of opt.values) next.push({ ...combo, [opt.name]: value });
        combos = next;
      }
      const existing = await tx
        .select({ optionValues: productVariant.optionValues })
        .from(productVariant)
        .where(eq(productVariant.productId, productId));
      const seen = new Set(existing.map((e) => JSON.stringify(e.optionValues ?? {})));
      const base = p.slug.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
      let created = 0;
      for (const combo of combos) {
        if (seen.has(JSON.stringify(combo))) continue;
        const suffix = Object.values(combo).map((v) => v.toUpperCase().replace(/\s+/g, '')).join('-');
        await tx.insert(productVariant).values({
          storeId,
          productId,
          sku: suffix ? `${base}-${suffix}` : `${base}-${created + 1}`,
          optionValues: combo,
        });
        created++;
      }
      return { created };
    });
  }

  async addImage(
    storeId: string,
    productId: string,
    input: { url: string; alt?: string; position?: number; variantId?: string },
  ): Promise<{ id: string }> {
    return this.run(storeId, async (tx) => {
      const [existing] = await tx.select({ id: product.id }).from(product).where(eq(product.id, productId)).limit(1);
      if (!existing) throw new NotFoundException({ code: 'product_not_found', detail: `No product ${productId}` });
      const [row] = await tx
        .insert(productImage)
        .values({
          storeId,
          productId,
          variantId: input.variantId ?? null,
          url: input.url,
          alt: input.alt,
          position: input.position ?? 0,
        })
        .returning({ id: productImage.id });
      return { id: row!.id };
    });
  }

  async deleteImage(storeId: string, imageId: string): Promise<void> {
    await this.run(storeId, async (tx) => {
      await tx.delete(productImage).where(eq(productImage.id, imageId));
    });
  }

  /** Upsert localized product fields for a locale (title/subtitle/description/seo). */
  async setProductTranslations(
    storeId: string,
    productId: string,
    locale: string,
    fields: Record<string, string>,
  ): Promise<void> {
    await this.run(storeId, async (tx) => {
      for (const [field, value] of Object.entries(fields)) {
        if (value == null) continue;
        await tx
          .insert(translation)
          .values({ storeId, entityType: 'product', entityId: productId, field, locale, value })
          .onConflictDoUpdate({
            target: [translation.storeId, translation.entityType, translation.entityId, translation.field, translation.locale],
            set: { value },
          });
      }
    });
  }

  listPriceLists(storeId: string) {
    return this.run(storeId, async (tx) => {
      const rows = await tx
        .select({ id: priceList.id, name: priceList.name, currency: priceList.currency })
        .from(priceList)
        .orderBy(asc(priceList.currency));
      return { data: rows };
    });
  }

  async listAdminProducts(storeId: string): Promise<{ data: Array<{ id: string; slug: string; title: string; status: string }> }> {
    return this.run(storeId, async (tx) => {
      const rows = await tx
        .select({ id: product.id, slug: product.slug, title: product.title, status: product.status })
        .from(product)
        .orderBy(asc(product.slug));
      return { data: rows };
    });
  }

  async updateProduct(storeId: string, id: string, input: UpdateProductInput): Promise<void> {
    await this.run(storeId, async (tx) => {
      const result = await tx
        .update(product)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(product.id, id))
        .returning({ id: product.id });
      if (result.length === 0) {
        throw new NotFoundException({ code: 'product_not_found', detail: `No product ${id}` });
      }
    });
  }

  async deleteProduct(storeId: string, id: string): Promise<void> {
    await this.run(storeId, async (tx) => {
      await tx.delete(product).where(eq(product.id, id));
    });
  }

  async addVariant(storeId: string, productId: string, input: CreateVariantInput): Promise<{ id: string }> {
    return this.run(storeId, async (tx) => {
      const [p] = await tx.select({ id: product.id }).from(product).where(eq(product.id, productId)).limit(1);
      if (!p) throw new NotFoundException({ code: 'product_not_found', detail: `No product ${productId}` });
      const [row] = await tx
        .insert(productVariant)
        .values({
          storeId,
          productId,
          sku: input.sku,
          barcode: input.barcode,
          optionValues: input.optionValues ?? {},
          weightGrams: input.weightGrams,
          position: input.position ?? 0,
        })
        .returning({ id: productVariant.id });
      return { id: row!.id };
    });
  }

  async setVariantPrice(storeId: string, variantId: string, input: SetPriceInput): Promise<{ id: string }> {
    return this.run(storeId, async (tx) => {
      const [v] = await tx.select({ id: productVariant.id }).from(productVariant).where(eq(productVariant.id, variantId)).limit(1);
      if (!v) throw new NotFoundException({ code: 'variant_not_found', detail: `No variant ${variantId}` });
      const [row] = await tx
        .insert(price)
        .values({
          storeId,
          priceListId: input.priceListId,
          variantId,
          amountMinor: input.amountMinor,
          compareAtAmountMinor: input.compareAtAmountMinor ?? null,
          minQuantity: input.minQuantity ?? 1,
          startsAt: input.startsAt ? new Date(input.startsAt) : null,
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
        })
        .returning({ id: price.id });
      return { id: row!.id };
    });
  }
}

// --- helpers (operate on the already tenant-bound transaction) ------------

type Tx = Parameters<Parameters<DbHandle['db']['transaction']>[0]>[0];

async function resolveLocaleCurrency(tx: Tx, opts: { locale?: string; currency?: string }): Promise<LocaleCurrency> {
  const [s] = await tx
    .select({ locale: store.defaultLocale, currency: store.defaultCurrency })
    .from(store)
    .limit(1);
  return {
    locale: opts.locale ?? s?.locale ?? 'en',
    currency: (opts.currency ?? s?.currency ?? 'USD').toUpperCase(),
  };
}

async function localizedField(
  tx: Tx,
  entityType: string,
  entityId: string,
  field: string,
  locale: string,
): Promise<string | null> {
  const [row] = await tx
    .select({ value: translation.value })
    .from(translation)
    .where(
      and(
        eq(translation.entityType, entityType),
        eq(translation.entityId, entityId),
        eq(translation.field, field),
        eq(translation.locale, locale),
      ),
    )
    .limit(1);
  return row?.value ?? null;
}

async function localizedTitles(tx: Tx, productIds: string[], locale: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (productIds.length === 0) return map;
  const rows = await tx
    .select({ entityId: translation.entityId, value: translation.value })
    .from(translation)
    .where(
      and(
        eq(translation.entityType, 'product'),
        eq(translation.field, 'title'),
        eq(translation.locale, locale),
      ),
    );
  for (const r of rows) {
    if (productIds.includes(r.entityId)) map.set(r.entityId, r.value);
  }
  return map;
}
