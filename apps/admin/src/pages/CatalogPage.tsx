import { useState, type FormEvent, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AdminCategoriesDocument,
  AdminProductsDocument,
  CreateCategoryDocument,
  CreateProductDocument,
  DeleteProductDocument,
  type AdminProductsQuery,
  type CreateCategoryInput,
  type CreateProductInput,
} from "@mercato/graphql";
import type { Locale } from "@mercato/i18n";
import { useAdminMutation, useAdminQuery } from "../lib/apolloHooks";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage } from "../lib/errors";
import { Button, Card, EmptyState, ErrorBanner, Field, Input, LoadingBlock, Select, StatusBadge } from "../components/ui";
import {
  ProductTypeCategoryRow,
  ServiceFieldsRow,
  defaultRequiresShippingForType,
} from "../components/ProductTypeFields";
import { useLocale, useT } from "../i18n/LocaleContext";

const STATUS_OPTIONS = ["draft", "active", "archived"];

/**
 * No key for these exists in @mercato/i18n yet — kept as a local bilingual
 * literal per the task brief instead of editing the shared package, same
 * convention as ProductDetailPage's STR block.
 */
const STR = {
  categoriesTitle: { ar: "الفئات", en: "Categories" },
  categoryName: { ar: "اسم الفئة", en: "Category name" },
  categorySlugHint: { ar: "معرف مخصص للرابط", en: "URL-friendly identifier" },
  categoryPosition: { ar: "الترتيب (اختياري)", en: "Position (optional)" },
  createCategory: { ar: "إضافة فئة", en: "Add category" },
  noCategories: { ar: "لا توجد فئات بعد", en: "No categories yet" },
  parent: { ar: "الفئة الأم", en: "Parent" },
  position: { ar: "الترتيب", en: "Position" },
} as const satisfies Record<string, Record<Locale, string>>;

type AdminProduct = AdminProductsQuery["adminProducts"][number];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function NewProductForm() {
  const t = useT();
  const { locale } = useLocale();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState("draft");
  const [type, setType] = useState("physical");
  const [categoryId, setCategoryId] = useState("");
  const [requiresShipping, setRequiresShipping] = useState(true);
  const [requiresShippingTouched, setRequiresShippingTouched] = useState(false);
  const [serviceDurationMinutes, setServiceDurationMinutes] = useState("");
  const [serviceLocation, setServiceLocation] = useState("");

  const categoriesQuery = useAdminQuery(AdminCategoriesDocument);
  const categories = categoriesQuery.data?.adminCategories ?? [];

  const [createProduct, createProductState] = useAdminMutation(CreateProductDocument, {
    refetchQueries: [{ query: AdminProductsDocument }],
    onCompleted: () => {
      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setStatus("draft");
      setType("physical");
      setCategoryId("");
      setRequiresShipping(true);
      setRequiresShippingTouched(false);
      setServiceDurationMinutes("");
      setServiceLocation("");
    },
  });

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

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
    if (!title.trim() || !slug.trim()) return;
    const input: CreateProductInput = {
      slug,
      title,
      status,
      type,
      categoryId: categoryId || null,
      requiresShipping,
      serviceDurationMinutes:
        type === "service" && serviceDurationMinutes.trim() ? Number.parseInt(serviceDurationMinutes, 10) : null,
      serviceLocation: type === "service" && serviceLocation ? serviceLocation : null,
    };
    void createProduct({ variables: { input } });
  }

  return (
    <Card title={t("admin.catalog.newProduct")}>
      <form onSubmit={handleSubmit} className="stack">
        {createProductState.error ? <ErrorBanner message={getErrorMessage(createProductState.error)} /> : null}
        <div className="form-row">
          <Field label={t("admin.catalog.productTitle")} htmlFor="new-product-title">
            <Input
              id="new-product-title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Classic Tee"
            />
          </Field>
          {/* No admin.catalog.slugHint key yet — inline literal, see task summary. */}
          <Field label={t("admin.catalog.slug")} htmlFor="new-product-slug" hint="URL-friendly identifier">
            <Input
              id="new-product-slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="classic-tee"
            />
          </Field>
          <Field label={t("admin.catalog.status")} htmlFor="new-product-status">
            <Select id="new-product-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <ProductTypeCategoryRow
          idPrefix="new-product"
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
            idPrefix="new-product"
            locale={locale}
            serviceDurationMinutes={serviceDurationMinutes}
            onServiceDurationChange={setServiceDurationMinutes}
            serviceLocation={serviceLocation}
            onServiceLocationChange={setServiceLocation}
          />
        ) : null}
        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={createProductState.loading}>
            {createProductState.loading ? `${t("admin.catalog.createProduct")}…` : t("admin.catalog.createProduct")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ProductRow({ product }: { product: AdminProduct }) {
  const t = useT();
  const navigate = useNavigate();

  const [removeProduct, removeProductState] = useAdminMutation(DeleteProductDocument, {
    variables: { id: product.id },
    refetchQueries: [{ query: AdminProductsDocument }],
  });

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    // No admin.catalog.confirmDelete key yet — inline literal, see task summary.
    if (window.confirm(`Delete "${product.title}"? This cannot be undone.`)) {
      void removeProduct();
    }
  }

  return (
    <tr className="clickable" onClick={() => navigate(`/catalog/${product.id}`)}>
      <td>{product.title}</td>
      <td className="table-mono">{product.slug}</td>
      <td>
        <StatusBadge status={product.status} />
      </td>
      <td className="num">
        <Button size="sm" variant="danger" onClick={handleDelete} disabled={removeProductState.loading}>
          {removeProductState.loading ? `${t("common.delete")}…` : t("common.delete")}
        </Button>
      </td>
    </tr>
  );
}

function CategoriesSection() {
  const t = useT();
  const { locale } = useLocale();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [position, setPosition] = useState("");

  const categoriesQuery = useAdminQuery(AdminCategoriesDocument);
  const categories = categoriesQuery.data?.adminCategories ?? [];

  const [createCategory, createCategoryState] = useAdminMutation(CreateCategoryDocument, {
    refetchQueries: [{ query: AdminCategoriesDocument }],
    onCompleted: () => {
      setName("");
      setSlug("");
      setSlugTouched(false);
      setPosition("");
    },
  });

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    const input: CreateCategoryInput = {
      slug,
      name,
      position: position.trim() ? Number.parseInt(position, 10) : undefined,
    };
    void createCategory({ variables: { input } });
  }

  function parentName(parentId: string | null | undefined): string {
    if (!parentId) return "—";
    return categories.find((c) => c.id === parentId)?.name ?? "—";
  }

  return (
    <Card title={STR.categoriesTitle[locale]}>
      <div className="stack">
        {createCategoryState.error ? <ErrorBanner message={getErrorMessage(createCategoryState.error)} /> : null}
        {categoriesQuery.loading ? (
          <LoadingBlock label={t("common.loading")} />
        ) : categoriesQuery.error ? (
          <ErrorBanner message={getErrorMessage(categoriesQuery.error)} onRetry={() => categoriesQuery.refetch()} />
        ) : categories.length === 0 ? (
          <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
            {STR.noCategories[locale]}
          </p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{STR.categoryName[locale]}</th>
                  <th>{t("admin.catalog.slug")}</th>
                  <th>{STR.parent[locale]}</th>
                  <th className="num">{STR.position[locale]}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td className="table-mono">{c.slug}</td>
                    <td className="text-muted">{parentName(c.parent_id)}</td>
                    <td className="num ltr-num">{c.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-row">
          <Field label={STR.categoryName[locale]} htmlFor="new-category-name">
            <Input id="new-category-name" required value={name} onChange={(e) => handleNameChange(e.target.value)} />
          </Field>
          <Field label={t("admin.catalog.slug")} htmlFor="new-category-slug" hint={STR.categorySlugHint[locale]}>
            <Input
              id="new-category-slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
            />
          </Field>
          <Field label={STR.categoryPosition[locale]} htmlFor="new-category-position">
            <Input
              id="new-category-position"
              type="number"
              min="0"
              step="1"
              className="ltr-num"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </Field>
          <div className="form-actions">
            <Button type="submit" size="sm" disabled={createCategoryState.loading}>
              {createCategoryState.loading ? `${STR.createCategory[locale]}…` : STR.createCategory[locale]}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}

export function CatalogPage() {
  const { storeId } = useAuth();
  const t = useT();

  const productsQuery = useAdminQuery(AdminProductsDocument, {
    skip: !storeId,
  });

  const products = productsQuery.data?.adminProducts ?? [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("admin.catalog.title")}</h1>
          <p className="page-subtitle">{t("admin.catalog.subtitle")}</p>
        </div>
      </div>

      <div className="page-section">
        {storeId ? <NewProductForm /> : null}
      </div>

      <div className="page-section">
        {productsQuery.loading ? (
          <LoadingBlock label={t("common.loading")} />
        ) : productsQuery.error ? (
          <ErrorBanner message={getErrorMessage(productsQuery.error)} onRetry={() => productsQuery.refetch()} />
        ) : products.length === 0 ? (
          // No admin.catalog.empty.* keys yet — inline literals, see task summary.
          <EmptyState title="No products yet" description="Create your first product using the form above." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("admin.catalog.productTitle")}</th>
                  <th>{t("admin.catalog.slug")}</th>
                  <th>{t("admin.catalog.status")}</th>
                  <th className="num">{t("admin.catalog.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="page-section">{storeId ? <CategoriesSection /> : null}</div>
    </div>
  );
}
