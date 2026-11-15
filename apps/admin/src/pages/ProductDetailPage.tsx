import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AddProductImageDocument,
  AddProductOptionDocument,
  AdminCategoriesDocument,
  AdminPriceListsDocument,
  AdminProductDocument,
  GenerateVariantsDocument,
  MediaUploadDocument,
  RemoveProductImageDocument,
  SetProductTranslationsDocument,
  SetVariantPriceDocument,
  UpdateProductDocument,
  type AddImageInput,
  type AddOptionInput,
  type AdminCategoriesQuery,
  type AdminProductQuery,
  type SetPriceInput,
  type SetTranslationsInput,
  type UpdateProductInput,
} from "@mercato/graphql";
import { dir, LOCALE_LABELS, type Locale } from "@mercato/i18n";
import { useAdminMutation, useAdminQuery } from "../lib/apolloHooks";
import { fileToBase64 } from "../lib/base64";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage } from "../lib/errors";
import { API_URL } from "../lib/client";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Field,
  Input,
  LoadingBlock,
  Select,
  StatusBadge,
  Textarea,
} from "../components/ui";
import {
  ProductTypeCategoryRow,
  ServiceFieldsRow,
  defaultRequiresShippingForType,
} from "../components/ProductTypeFields";
import { useLocale, useT } from "../i18n/LocaleContext";

const STATUS_OPTIONS = ["draft", "active", "archived"];
const CONTENT_LOCALES: Locale[] = ["ar", "en"];

type AdminProductDetail = AdminProductQuery["adminProduct"];
type AdminVariant = AdminProductDetail["variants"][number];
type PriceListOption = { id: string; name: string; currency: string };
type CategoryOption = AdminCategoriesQuery["adminCategories"][number];

/**
 * These product-detail strings have no key in @mercato/i18n yet. Keeping them
 * as a local bilingual literal per the task brief instead of editing the
 * shared package — see the summary for the full list to upstream.
 */
const STR = {
  details: { ar: "التفاصيل", en: "Details" },
  vendor: { ar: "المورد", en: "Vendor" },
  subtitle: { ar: "العنوان الفرعي", en: "Subtitle" },
  description: { ar: "الوصف", en: "Description" },
  tags: { ar: "الوسوم", en: "Tags" },
  tagsHint: { ar: "مفصولة بفواصل", en: "Comma-separated" },
  slugReadOnly: { ar: "لا يمكن تعديله هنا", en: "Not editable here" },
  images: { ar: "الصور", en: "Images" },
  noImages: { ar: "لا توجد صور بعد", en: "No images yet" },
  addImage: { ar: "إضافة صورة", en: "Add image" },
  uploading: { ar: "جارٍ الرفع…", en: "Uploading…" },
  remove: { ar: "إزالة", en: "Remove" },
  optionsAndVariants: { ar: "الخيارات والمتغيرات", en: "Options & variants" },
  options: { ar: "الخيارات", en: "Options" },
  noOptions: { ar: "لم تتم إضافة خيارات بعد", en: "No options added yet" },
  optionName: { ar: "اسم الخيار", en: "Option name" },
  optionValues: { ar: "القيم (مفصولة بفواصل)", en: "Values (comma-separated)" },
  addOption: { ar: "إضافة خيار", en: "Add option" },
  variants: { ar: "المتغيرات", en: "Variants" },
  noVariants: { ar: "لا توجد متغيرات بعد", en: "No variants yet" },
  generateVariants: { ar: "إنشاء المتغيرات", en: "Generate variants" },
  price: { ar: "السعر", en: "Price" },
  compareAtPrice: { ar: "سعر المقارنة", en: "Compare-at price" },
  savePrice: { ar: "حفظ السعر", en: "Save price" },
  noPriceLists: { ar: "لا توجد قوائم أسعار", en: "No price lists" },
  translations: { ar: "الترجمات", en: "Translations" },
  seoTitle: { ar: "عنوان SEO", en: "SEO title" },
  seoDescription: { ar: "وصف SEO", en: "SEO description" },
  backToCatalog: { ar: "الرجوع إلى الكتالوج", en: "Back to catalog" },
  productNotFound: { ar: "المنتج غير موجود", en: "Product not found" },
} as const satisfies Record<string, Record<Locale, string>>;

const ORIGIN = API_URL.replace(/\/v1$/, "");

function imageSrc(url: string): string {
  return /^https?:\/\//.test(url) ? url : ORIGIN + url;
}

function DetailsForm({
  product,
  id,
  categories,
}: {
  product: AdminProductDetail;
  id: string;
  categories: CategoryOption[];
}) {
  const t = useT();
  const { locale } = useLocale();
  const [title, setTitle] = useState(product.title);
  const [subtitle, setSubtitle] = useState(product.subtitle ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [vendor, setVendor] = useState(product.vendor ?? "");
  const [tags, setTags] = useState(product.tags.join(", "));
  const [status, setStatus] = useState(product.status);
  const [type, setType] = useState(product.type);
  const [categoryId, setCategoryId] = useState(product.category?.id ?? "");
  const [requiresShipping, setRequiresShipping] = useState(product.requires_shipping);
  const [requiresShippingTouched, setRequiresShippingTouched] = useState(false);
  const [serviceDurationMinutes, setServiceDurationMinutes] = useState(
    product.service_duration_minutes != null ? String(product.service_duration_minutes) : "",
  );
  const [serviceLocation, setServiceLocation] = useState(product.service_location ?? "");

  const [save, saveState] = useAdminMutation(UpdateProductDocument, {
    refetchQueries: [{ query: AdminProductDocument, variables: { id } }],
  });

  function handleTypeChange(value: string) {
    setType(value);
    if (!requiresShippingTouched) setRequiresShipping(defaultRequiresShippingForType(value));
  }

  function handleRequiresShippingChange(checked: boolean) {
    setRequiresShipping(checked);
    setRequiresShippingTouched(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const input: UpdateProductInput = {
      title,
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      vendor: vendor.trim() || undefined,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      status,
      type,
      categoryId: categoryId || null,
      requiresShipping,
      serviceDurationMinutes:
        type === "service" && serviceDurationMinutes.trim() ? Number.parseInt(serviceDurationMinutes, 10) : null,
      serviceLocation: type === "service" && serviceLocation ? serviceLocation : null,
    };
    void save({ variables: { id, input } });
  }

  return (
    <Card title={STR.details[locale]}>
      <form onSubmit={handleSubmit} className="stack">
        {saveState.error ? <ErrorBanner message={getErrorMessage(saveState.error)} /> : null}
        <div className="form-row">
          <Field label={t("admin.catalog.productTitle")} htmlFor="pd-title">
            <Input id="pd-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label={STR.vendor[locale]} htmlFor="pd-vendor">
            <Input id="pd-vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </Field>
          <Field label={t("admin.catalog.status")} htmlFor="pd-status">
            <Select id="pd-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("admin.catalog.slug")} htmlFor="pd-slug" hint={STR.slugReadOnly[locale]}>
            <Input id="pd-slug" value={product.slug} disabled className="mono" />
          </Field>
        </div>
        <Field label={STR.subtitle[locale]} htmlFor="pd-subtitle">
          <Input id="pd-subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </Field>
        <Field label={STR.description[locale]} htmlFor="pd-description">
          <Textarea id="pd-description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label={STR.tags[locale]} htmlFor="pd-tags" hint={STR.tagsHint[locale]}>
          <Input id="pd-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="running, summer" />
        </Field>
        <ProductTypeCategoryRow
          idPrefix="pd"
          locale={locale}
          type={type}
          onTypeChange={handleTypeChange}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categories={categories}
          requiresShipping={requiresShipping}
          onRequiresShippingChange={handleRequiresShippingChange}
        />
        {type === "service" ? (
          <ServiceFieldsRow
            idPrefix="pd"
            locale={locale}
            serviceDurationMinutes={serviceDurationMinutes}
            onServiceDurationChange={setServiceDurationMinutes}
            serviceLocation={serviceLocation}
            onServiceLocationChange={setServiceLocation}
          />
        ) : null}
        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={saveState.loading}>
            {saveState.loading ? `${t("common.save")}…` : t("common.save")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ImagesCard({ product, id }: { product: AdminProductDetail; id: string }) {
  const { locale } = useLocale();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const refetchQueries = [{ query: AdminProductDocument, variables: { id } }];

  const [mediaUpload] = useAdminMutation(MediaUploadDocument);
  const [addProductImage] = useAdminMutation(AddProductImageDocument, { refetchQueries });
  const [removeImage, removeImageState] = useAdminMutation(RemoveProductImageDocument, { refetchQueries });

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const contentBase64 = await fileToBase64(file);
      const uploadRes = await mediaUpload({ variables: { filename: file.name, contentBase64 } });
      const url = uploadRes.data?.mediaUpload.url;
      if (!url) throw new Error("Upload failed.");
      const input: AddImageInput = { url };
      await addProductImage({ variables: { productId: id, input } });
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card title={STR.images[locale]}>
      <div className="stack">
        {uploadError ? <ErrorBanner message={uploadError} /> : null}
        {removeImageState.error ? <ErrorBanner message={getErrorMessage(removeImageState.error)} /> : null}
        {product.images.length === 0 ? (
          <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
            {STR.noImages[locale]}
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "var(--space-3)",
            }}
          >
            {product.images.map((img) => (
              <div
                key={img.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  background: "var(--surface-hover)",
                }}
              >
                <img
                  src={imageSrc(img.url)}
                  alt={img.alt ?? ""}
                  style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                />
                <div style={{ padding: "var(--space-2)" }}>
                  <Button
                    size="sm"
                    variant="danger"
                    block
                    onClick={() => void removeImage({ variables: { imageId: img.id } })}
                    disabled={removeImageState.loading}
                  >
                    {STR.remove[locale]}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div>
          <label className="btn btn-secondary btn-sm" style={{ cursor: uploading ? "not-allowed" : "pointer" }}>
            {uploading ? STR.uploading[locale] : STR.addImage[locale]}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>
    </Card>
  );
}

function VariantRow({
  variant,
  priceLists,
  productId,
}: {
  variant: AdminVariant;
  priceLists: PriceListOption[];
  productId: string;
}) {
  const { locale } = useLocale();
  const [priceListId, setPriceListId] = useState(priceLists[0]?.id ?? "");
  const [amount, setAmount] = useState(variant.price ? String(variant.price.amount_minor / 100) : "");
  const [compareAt, setCompareAt] = useState(
    variant.compare_at ? String(variant.compare_at.amount_minor / 100) : "",
  );

  const [setPrice, setPriceState] = useAdminMutation(SetVariantPriceDocument, {
    refetchQueries: [{ query: AdminProductDocument, variables: { id: productId } }],
  });

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!priceListId || !amount.trim() || Number.isNaN(Number.parseFloat(amount))) return;
    const input: SetPriceInput = {
      priceListId,
      amountMinor: Math.round(Number.parseFloat(amount) * 100),
      compareAtAmountMinor: compareAt.trim() ? Math.round(Number.parseFloat(compareAt) * 100) : undefined,
    };
    void setPrice({ variables: { variantId: variant.id, input } });
  }

  const optionSummary =
    Object.entries(variant.option_values as Record<string, string>)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ") || "—";

  return (
    <tr>
      <td className="table-mono">{variant.sku}</td>
      <td className="text-muted">{optionSummary}</td>
      <td colSpan={2}>
        {priceLists.length === 0 ? (
          <span className="text-faint">{STR.noPriceLists[locale]}</span>
        ) : (
          <form onSubmit={handleSave} className="row" style={{ flexWrap: "wrap", gap: "var(--space-2)" }}>
            {setPriceState.error ? <ErrorBanner message={getErrorMessage(setPriceState.error)} /> : null}
            <Select
              aria-label={STR.price[locale]}
              value={priceListId}
              onChange={(e) => setPriceListId(e.target.value)}
              style={{ width: 130 }}
            >
              {priceLists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.name}
                </option>
              ))}
            </Select>
            <Input
              aria-label={STR.price[locale]}
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="ltr-num"
              style={{ width: 90 }}
            />
            <Input
              aria-label={STR.compareAtPrice[locale]}
              type="number"
              min="0"
              step="0.01"
              value={compareAt}
              onChange={(e) => setCompareAt(e.target.value)}
              placeholder={STR.compareAtPrice[locale]}
              className="ltr-num"
              style={{ width: 110 }}
            />
            <Button type="submit" size="sm" disabled={setPriceState.loading}>
              {setPriceState.loading ? `${STR.savePrice[locale]}…` : STR.savePrice[locale]}
            </Button>
          </form>
        )}
      </td>
    </tr>
  );
}

function OptionsVariantsCard({
  product,
  id,
  priceLists,
}: {
  product: AdminProductDetail;
  id: string;
  priceLists: PriceListOption[];
}) {
  const { locale } = useLocale();
  const t = useT();
  const [optionName, setOptionName] = useState("");
  const [optionValues, setOptionValues] = useState("");

  const refetchQueries = [{ query: AdminProductDocument, variables: { id } }];

  const [addOption, addOptionState] = useAdminMutation(AddProductOptionDocument, {
    refetchQueries,
    onCompleted: () => {
      setOptionName("");
      setOptionValues("");
    },
  });

  const [generateVariants, generateVariantsState] = useAdminMutation(GenerateVariantsDocument, { refetchQueries });

  function handleAddOption(e: FormEvent) {
    e.preventDefault();
    if (!optionName.trim() || !optionValues.trim()) return;
    const input: AddOptionInput = {
      name: optionName,
      values: optionValues
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
    void addOption({ variables: { productId: id, input } });
  }

  return (
    <Card title={STR.optionsAndVariants[locale]}>
      <div className="stack">
        <div>
          <div className="section-heading">{STR.options[locale]}</div>
          {product.options.length === 0 ? (
            <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
              {STR.noOptions[locale]}
            </p>
          ) : (
            <div className="stack" style={{ gap: "var(--space-2)" }}>
              {product.options.map((opt) => (
                <div className="row-between" key={opt.name}>
                  <span style={{ fontWeight: 600 }}>{opt.name}</span>
                  <span className="text-muted">{opt.values.join(", ")}</span>
                </div>
              ))}
            </div>
          )}

          {addOptionState.error ? <ErrorBanner message={getErrorMessage(addOptionState.error)} /> : null}
          <form onSubmit={handleAddOption} className="form-row" style={{ marginTop: "var(--space-3)" }}>
            <Field label={STR.optionName[locale]} htmlFor="opt-name">
              <Input id="opt-name" value={optionName} onChange={(e) => setOptionName(e.target.value)} placeholder="Size" />
            </Field>
            <Field label={STR.optionValues[locale]} htmlFor="opt-values">
              <Input
                id="opt-values"
                value={optionValues}
                onChange={(e) => setOptionValues(e.target.value)}
                placeholder="S, M, L"
              />
            </Field>
            <div className="form-actions">
              <Button type="submit" size="sm" disabled={addOptionState.loading}>
                {addOptionState.loading ? `${STR.addOption[locale]}…` : STR.addOption[locale]}
              </Button>
            </div>
          </form>
        </div>

        <hr className="divider" />

        <div className="row-between">
          <div className="section-heading" style={{ marginBottom: 0 }}>
            {STR.variants[locale]}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void generateVariants({ variables: { productId: id } })}
            disabled={generateVariantsState.loading || product.options.length === 0}
          >
            {generateVariantsState.loading ? `${STR.generateVariants[locale]}…` : STR.generateVariants[locale]}
          </Button>
        </div>
        {generateVariantsState.error ? <ErrorBanner message={getErrorMessage(generateVariantsState.error)} /> : null}

        {product.variants.length === 0 ? (
          <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
            {STR.noVariants[locale]}
          </p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("product.sku")}</th>
                  <th>{STR.options[locale]}</th>
                  <th>{STR.price[locale]}</th>
                  <th>{STR.compareAtPrice[locale]}</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (
                  <VariantRow key={variant.id} variant={variant} priceLists={priceLists} productId={id} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

function TranslationLocaleForm({
  product,
  id,
  targetLocale,
}: {
  product: AdminProductDetail;
  id: string;
  targetLocale: Locale;
}) {
  const t = useT();
  const translations = product.translations as Record<string, Record<string, string> | undefined>;
  const existing = translations[targetLocale] ?? {};
  const [title, setTitle] = useState(existing.title ?? "");
  const [subtitle, setSubtitle] = useState(existing.subtitle ?? "");
  const [description, setDescription] = useState(existing.description ?? "");
  const [seoTitle, setSeoTitle] = useState(existing.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(existing.seo_description ?? "");

  const [save, saveState] = useAdminMutation(SetProductTranslationsDocument, {
    refetchQueries: [{ query: AdminProductDocument, variables: { id } }],
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input: SetTranslationsInput = {
      locale: targetLocale,
      title: title.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      seo_title: seoTitle.trim() || undefined,
      seo_description: seoDescription.trim() || undefined,
    };
    void save({ variables: { productId: id, input } });
  }

  return (
    <form onSubmit={handleSubmit} className="stack" dir={dir(targetLocale)}>
      <Badge tone="accent">{LOCALE_LABELS[targetLocale]}</Badge>
      {saveState.error ? <ErrorBanner message={getErrorMessage(saveState.error)} /> : null}
      <Field label={t("admin.catalog.productTitle")} htmlFor={`tr-${targetLocale}-title`}>
        <Input id={`tr-${targetLocale}-title`} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label={STR.subtitle[targetLocale]} htmlFor={`tr-${targetLocale}-subtitle`}>
        <Input id={`tr-${targetLocale}-subtitle`} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </Field>
      <Field label={STR.description[targetLocale]} htmlFor={`tr-${targetLocale}-description`}>
        <Textarea
          id={`tr-${targetLocale}-description`}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      <Field label={STR.seoTitle[targetLocale]} htmlFor={`tr-${targetLocale}-seo-title`}>
        <Input id={`tr-${targetLocale}-seo-title`} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
      </Field>
      <Field label={STR.seoDescription[targetLocale]} htmlFor={`tr-${targetLocale}-seo-description`}>
        <Textarea
          id={`tr-${targetLocale}-seo-description`}
          rows={2}
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
        />
      </Field>
      <div className="form-actions">
        <Button type="submit" variant="primary" size="sm" disabled={saveState.loading}>
          {saveState.loading ? `${t("common.save")}…` : t("common.save")}
        </Button>
      </div>
    </form>
  );
}

function TranslationsCard({ product, id }: { product: AdminProductDetail; id: string }) {
  const { locale } = useLocale();
  return (
    <Card title={STR.translations[locale]}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-6)" }}>
        {CONTENT_LOCALES.map((loc) => (
          <TranslationLocaleForm key={loc} product={product} id={id} targetLocale={loc} />
        ))}
      </div>
    </Card>
  );
}

export function ProductDetailPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const id = routeId!;
  const { storeId } = useAuth();
  const t = useT();
  const { locale } = useLocale();

  const productQuery = useAdminQuery(AdminProductDocument, {
    variables: { id },
    skip: !storeId || !id,
  });

  const priceListsQuery = useAdminQuery(AdminPriceListsDocument, {
    skip: !storeId,
  });

  const categoriesQuery = useAdminQuery(AdminCategoriesDocument, {
    skip: !storeId,
  });

  const product = productQuery.data?.adminProduct;
  const priceLists = priceListsQuery.data?.adminPriceLists ?? [];
  const categories = categoriesQuery.data?.adminCategories ?? [];

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/catalog" className="text-muted" style={{ fontSize: "var(--text-sm)", textDecoration: "none" }}>
            {STR.backToCatalog[locale]}
          </Link>
          <h1 className="page-title" style={{ marginTop: "var(--space-2)" }}>
            {product ? product.title : t("admin.catalog.productTitle")}
          </h1>
          {product ? <p className="page-subtitle mono">{product.slug}</p> : null}
        </div>
        {product ? <StatusBadge status={product.status} /> : null}
      </div>

      {productQuery.loading ? (
        <LoadingBlock label={t("common.loading")} />
      ) : productQuery.error ? (
        <ErrorBanner message={getErrorMessage(productQuery.error)} onRetry={() => productQuery.refetch()} />
      ) : !product ? (
        <EmptyState title={STR.productNotFound[locale]} />
      ) : (
        <div className="stack" style={{ gap: "var(--space-6)" }}>
          <DetailsForm product={product} id={id} categories={categories} />
          <ImagesCard product={product} id={id} />
          <OptionsVariantsCard product={product} id={id} priceLists={priceLists} />
          <TranslationsCard product={product} id={id} />
        </div>
      )}
    </div>
  );
}
