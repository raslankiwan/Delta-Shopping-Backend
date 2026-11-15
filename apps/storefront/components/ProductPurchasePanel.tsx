"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { CartAddLineDocument } from "@mercato/graphql";
import type { Locale } from "@mercato/i18n";
import type { ProductDetail, ProductVariant } from "@/lib/product-types";
import { formatMoney } from "@/lib/money";
import { errorMessage } from "@/lib/graphql-error";
import { useCart } from "@/lib/cart-context";
import { useT } from "@/lib/locale-context";

type Status = "idle" | "adding" | "added" | "error";

// Strings with no catalog key yet — gap list is in the storefront i18n summary.
const NO_VARIANTS: Record<Locale, string> = {
  ar: "لا تتوفر لهذا المنتج خيارات قابلة للشراء بعد.",
  en: "This product has no purchasable variants yet.",
};
const PRICE_UNAVAILABLE: Record<Locale, string> = {
  ar: "السعر غير متاح لهذا الخيار",
  en: "Price unavailable for this option",
};
const ADDING: Record<Locale, string> = { ar: "جارٍ الإضافة…", en: "Adding…" };
const IN_YOUR_CART: Record<Locale, string> = { ar: "أُضيف إلى سلتك.", en: "In your cart." };
const ADD_ERROR_FALLBACK: Record<Locale, string> = {
  ar: "تعذّرت إضافة هذا المنتج إلى سلتك.",
  en: "Could not add this item to your cart.",
};
const DECREASE_QTY: Record<Locale, string> = { ar: "إنقاص الكمية", en: "Decrease quantity" };
const INCREASE_QTY: Record<Locale, string> = { ar: "زيادة الكمية", en: "Increase quantity" };

// Service/digital purchase-panel copy — no catalog keys yet, same gap noted
// in the storefront i18n summary as the rest of this file's local strings.
const BOOK_SERVICE: Record<Locale, string> = { ar: "احجز الخدمة", en: "Book service" };
const BOOKING: Record<Locale, string> = { ar: "جارٍ الحجز…", en: "Booking…" };
const BOOKED: Record<Locale, string> = { ar: "تم الحجز ✓", en: "Booked ✓" };
const BOOKED_CONFIRM: Record<Locale, string> = {
  ar: "تم حجز هذه الخدمة.",
  en: "This service is booked.",
};
const DIGITAL_DELIVERY_NOTE: Record<Locale, string> = {
  ar: "تسليم رقمي — لا حاجة للشحن.",
  en: "Digital delivery — no shipping required.",
};
const DURATION_LABEL: Record<Locale, string> = { ar: "المدة", en: "Duration" };
const DURATION_MINUTES: Record<Locale, (minutes: number) => string> = {
  ar: (minutes) => `${minutes} دقيقة`,
  en: (minutes) => `${minutes} min`,
};
const SERVICE_LOCATION_LABEL: Record<Locale, string> = { ar: "الموقع", en: "Location" };
const SERVICE_LOCATION_VALUE: Record<Locale, Record<string, string>> = {
  ar: { onsite: "في الموقع", remote: "عن بُعد", customer: "لدى العميل" },
  en: { onsite: "On-site", remote: "Remote", customer: "At customer" },
};

export function ProductPurchasePanel({ product, locale }: { product: ProductDetail; locale: Locale }) {
  const { ensureCartId, refreshCount } = useCart();
  const t = useT();
  const [addLine] = useMutation(CartAddLineDocument);

  // Prefer the product's declared option defs (name + ordered values); fall back to
  // deriving both from the variants themselves for older data that predates them.
  const optionNames = useMemo(
    () =>
      product.options.length > 0
        ? product.options.map((option) => option.name)
        : Array.from(
            new Set(
              product.variants.flatMap((variant) =>
                Object.keys(variant.option_values as Record<string, string>),
              ),
            ),
          ),
    [product.options, product.variants],
  );

  const firstVariant = product.variants[0];
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    firstVariant ? { ...(firstVariant.option_values as Record<string, string>) } : {},
  );
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const selectedVariant: ProductVariant | undefined = useMemo(
    () =>
      product.variants.find((variant) =>
        optionNames.every(
          (name) => (variant.option_values as Record<string, string>)[name] === selection[name],
        ),
      ),
    [product.variants, optionNames, selection],
  );

  function optionValues(name: string): string[] {
    const declared = product.options.find((option) => option.name === name);
    if (declared) return declared.values;
    const values = product.variants
      .map((variant) => (variant.option_values as Record<string, string>)[name])
      .filter((value): value is string => value !== undefined);
    return Array.from(new Set(values));
  }

  async function handleAddToCart() {
    if (!selectedVariant || !selectedVariant.price) return;
    setStatus("adding");
    setMessage(null);
    try {
      const cartId = await ensureCartId();
      const { data } = await addLine({
        variables: { cartId, input: { variantId: selectedVariant.id, quantity } },
      });
      if (data?.cartAddLine) await refreshCount(data.cartAddLine);
      setStatus("added");
    } catch (err) {
      setStatus("error");
      setMessage(errorMessage(err, ADD_ERROR_FALLBACK[locale]));
    }
  }

  if (!firstVariant) {
    return <p className="alert alert--muted">{NO_VARIANTS[locale]}</p>;
  }

  const isService = product.type === "service";
  const isDigital = product.type === "digital";

  const ctaLabel = isService
    ? status === "adding"
      ? BOOKING[locale]
      : status === "added"
        ? BOOKED[locale]
        : BOOK_SERVICE[locale]
    : status === "adding"
      ? ADDING[locale]
      : status === "added"
        ? t("product.added")
        : t("product.addToCart");

  return (
    <div className="purchase-panel">
      {!selectedVariant ? (
        <p className="purchase-panel__price">{t("product.unavailable")}</p>
      ) : selectedVariant.price ? (
        <div className="purchase-panel__price-row">
          <p className="purchase-panel__price i18n-ltr">{formatMoney(selectedVariant.price)}</p>
          {selectedVariant.compare_at &&
            selectedVariant.compare_at.amount_minor > selectedVariant.price.amount_minor && (
              <p className="purchase-panel__compare-at">
                {t("product.was")} <span className="i18n-ltr">{formatMoney(selectedVariant.compare_at)}</span>
              </p>
            )}
        </div>
      ) : (
        <p className="purchase-panel__price">{PRICE_UNAVAILABLE[locale]}</p>
      )}

      {isDigital && <p className="purchase-panel__note">{DIGITAL_DELIVERY_NOTE[locale]}</p>}

      {isService && (product.service_duration_minutes != null || product.service_location) && (
        <div className="service-meta">
          {product.service_duration_minutes != null && (
            <div className="service-meta__row">
              <span className="service-meta__label">{DURATION_LABEL[locale]}</span>
              <span className="service-meta__value">
                {DURATION_MINUTES[locale](product.service_duration_minutes)}
              </span>
            </div>
          )}
          {product.service_location && (
            <div className="service-meta__row">
              <span className="service-meta__label">{SERVICE_LOCATION_LABEL[locale]}</span>
              <span className="service-meta__value">
                {SERVICE_LOCATION_VALUE[locale][product.service_location] ?? product.service_location}
              </span>
            </div>
          )}
        </div>
      )}

      {optionNames.length > 0 && (
        <div className="purchase-panel__options">
          {optionNames.map((name) => (
            <fieldset key={name} className="option-group">
              <legend className="option-group__label">{name}</legend>
              <div className="option-group__values">
                {optionValues(name).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`pill-button${selection[name] === value ? " pill-button--active" : ""}`}
                    aria-pressed={selection[name] === value}
                    onClick={() => setSelection((prev) => ({ ...prev, [name]: value }))}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      )}

      <div className="purchase-panel__quantity">
        <label htmlFor="quantity" className="field-label">
          {t("product.quantity")}
        </label>
        <div className="stepper">
          <button
            type="button"
            className="stepper__button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label={DECREASE_QTY[locale]}
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            min={1}
            dir="ltr"
            className="stepper__input"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          />
          <button
            type="button"
            className="stepper__button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label={INCREASE_QTY[locale]}
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        className="button button--primary purchase-panel__submit"
        onClick={handleAddToCart}
        disabled={!selectedVariant || !selectedVariant.price || status === "adding"}
      >
        {ctaLabel}
      </button>

      {status === "added" && (
        <p className="purchase-panel__confirm" role="status">
          {isService ? (
            BOOKED_CONFIRM[locale]
          ) : (
            <>
              {IN_YOUR_CART[locale]} <a href={`/${locale}/cart`}>{t("product.viewCart")}</a>
            </>
          )}
        </p>
      )}
      {status === "error" && message && (
        <p className="alert alert--error" role="alert">
          {message}
        </p>
      )}

      {selectedVariant && (
        <p className="purchase-panel__sku">
          {t("product.sku")} <span className="i18n-ltr">{selectedVariant.sku}</span>
        </p>
      )}
    </div>
  );
}
