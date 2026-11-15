import type { AdminCategoriesQuery } from "@mercato/graphql";
import type { Locale } from "@mercato/i18n";
import { Field, Input, Select } from "./ui";

/**
 * Product type/category/shipping/service fields shared by the "new product"
 * form (CatalogPage) and the product editor (ProductDetailPage). No key for
 * these exists in @mercato/i18n yet — kept as a local bilingual literal per
 * the task brief instead of editing the shared package, same convention as
 * the rest of ProductDetailPage's local strings.
 */
export const productTypeFieldsStr = {
  type: { ar: "النوع", en: "Type" },
  typePhysical: { ar: "مادي", en: "Physical" },
  typeDigital: { ar: "رقمي", en: "Digital" },
  typeService: { ar: "خدمة", en: "Service" },
  category: { ar: "الفئة", en: "Category" },
  categoryNone: { ar: "بدون فئة", en: "No category" },
  requiresShipping: { ar: "يتطلب شحنًا", en: "Requires shipping" },
  serviceDuration: { ar: "مدة الخدمة (بالدقائق)", en: "Duration (minutes)" },
  serviceLocation: { ar: "مكان تقديم الخدمة", en: "Service location" },
  serviceLocationSelect: { ar: "اختر الموقع", en: "Select location" },
  serviceLocationOnsite: { ar: "في الموقع", en: "Onsite" },
  serviceLocationRemote: { ar: "عن بُعد", en: "Remote" },
  serviceLocationCustomer: { ar: "لدى العميل", en: "At the customer" },
} as const satisfies Record<string, Record<Locale, string>>;

/** requiresShipping is auto-implied by type unless the user overrides it. */
export function defaultRequiresShippingForType(type: string): boolean {
  return type === "physical";
}

type CategoryOption = AdminCategoriesQuery["adminCategories"][number];

export function ProductTypeCategoryRow({
  idPrefix,
  locale,
  type,
  onTypeChange,
  categoryId,
  onCategoryChange,
  categories,
  requiresShipping,
  onRequiresShippingChange,
}: {
  idPrefix: string;
  locale: Locale;
  type: string;
  onTypeChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories: CategoryOption[];
  requiresShipping: boolean;
  onRequiresShippingChange: (checked: boolean) => void;
}) {
  const s = productTypeFieldsStr;
  return (
    <div className="form-row">
      <Field label={s.type[locale]} htmlFor={`${idPrefix}-type`}>
        <Select id={`${idPrefix}-type`} value={type} onChange={(e) => onTypeChange(e.target.value)}>
          <option value="physical">{s.typePhysical[locale]}</option>
          <option value="digital">{s.typeDigital[locale]}</option>
          <option value="service">{s.typeService[locale]}</option>
        </Select>
      </Field>
      <Field label={s.category[locale]} htmlFor={`${idPrefix}-category`}>
        <Select id={`${idPrefix}-category`} value={categoryId} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">{s.categoryNone[locale]}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={s.requiresShipping[locale]} htmlFor={`${idPrefix}-requires-shipping`}>
        <div style={{ display: "flex", alignItems: "center", height: 36 }}>
          <input
            id={`${idPrefix}-requires-shipping`}
            type="checkbox"
            checked={requiresShipping}
            onChange={(e) => onRequiresShippingChange(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
          />
        </div>
      </Field>
    </div>
  );
}

export function ServiceFieldsRow({
  idPrefix,
  locale,
  serviceDurationMinutes,
  onServiceDurationChange,
  serviceLocation,
  onServiceLocationChange,
}: {
  idPrefix: string;
  locale: Locale;
  serviceDurationMinutes: string;
  onServiceDurationChange: (value: string) => void;
  serviceLocation: string;
  onServiceLocationChange: (value: string) => void;
}) {
  const s = productTypeFieldsStr;
  return (
    <div className="form-row">
      <Field label={s.serviceDuration[locale]} htmlFor={`${idPrefix}-service-duration`}>
        <Input
          id={`${idPrefix}-service-duration`}
          type="number"
          min="0"
          step="1"
          className="ltr-num"
          value={serviceDurationMinutes}
          onChange={(e) => onServiceDurationChange(e.target.value)}
          placeholder="30"
        />
      </Field>
      <Field label={s.serviceLocation[locale]} htmlFor={`${idPrefix}-service-location`}>
        <Select
          id={`${idPrefix}-service-location`}
          value={serviceLocation}
          onChange={(e) => onServiceLocationChange(e.target.value)}
        >
          <option value="">{s.serviceLocationSelect[locale]}</option>
          <option value="onsite">{s.serviceLocationOnsite[locale]}</option>
          <option value="remote">{s.serviceLocationRemote[locale]}</option>
          <option value="customer">{s.serviceLocationCustomer[locale]}</option>
        </Select>
      </Field>
    </div>
  );
}
