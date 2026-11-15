"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import {
  CartDocument,
  CheckoutCompleteDocument,
  PaymentMethodsDocument,
  ShippingZonesDocument,
  type AddressInputType,
  type CartQuery,
  type CheckoutCompleteMutation,
  type PaymentMethodsQuery,
  type ShippingZonesQuery,
} from "@mercato/graphql";
import type { Locale } from "@mercato/i18n";
import { getBrowserClient } from "@/lib/client";
import { useCart } from "@/lib/cart-context";
import { useT } from "@/lib/locale-context";
import { formatMoney } from "@/lib/money";
import { errorMessage } from "@/lib/graphql-error";

interface ShippingFormState {
  email: string;
  line1: string;
  line2: string;
  city: string;
  governorate: string;
  region: string;
  postalCode: string;
  phone: string;
}

const EMPTY_FORM: ShippingFormState = {
  email: "",
  line1: "",
  line2: "",
  city: "",
  governorate: "",
  region: "",
  postalCode: "",
  phone: "",
};

type CartState = "loading" | "ready" | "empty" | "error";
type CartData = CartQuery["cart"];
type PlacedOrder = CheckoutCompleteMutation["checkoutComplete"];
type ShippingZone = ShippingZonesQuery["shippingZones"][number];
type PaymentMethodItem = PaymentMethodsQuery["paymentMethods"][number];

const DEFAULT_PAYMENT_METHOD = "cod";

// Strings with no catalog key yet — gap list is in the storefront i18n summary.
const OPTIONAL: Record<Locale, string> = { ar: "اختياري", en: "optional" };
const ORDER_SUMMARY_HEADING: Record<Locale, string> = { ar: "ملخص الطلب", en: "Order summary" };
const STAMP_LINES: Record<Locale, [string, string]> = {
  ar: ["تأكيد", "الطلب"],
  en: ["ORDER", "CONFIRMED"],
};
const TOTAL_CHARGED: Record<Locale, string> = { ar: "المبلغ المدفوع:", en: "Total charged:" };
const AMOUNT_DUE: Record<Locale, string> = { ar: "المبلغ المستحق:", en: "Amount due:" };
const PAY_ON_DELIVERY_NOTE: Record<Locale, string> = {
  ar: "سيتم الدفع عند الاستلام.",
  en: "Payment will be collected on delivery.",
};
const RECEIPT_PREFIX: Record<Locale, string> = {
  ar: "سيصلك إيصال على",
  en: "A receipt is on its way to",
};
const CONTINUE_SHOPPING: Record<Locale, string> = { ar: "متابعة التسوق", en: "Continue shopping" };
const PLACING_ORDER: Record<Locale, string> = { ar: "جارٍ تأكيد الطلب…", en: "Placing order…" };
const SUBMIT_ERROR_FALLBACK: Record<Locale, string> = {
  ar: "حدث خطأ أثناء تأكيد طلبك.",
  en: "Something went wrong placing your order.",
};
const GOVERNORATE_LABEL: Record<Locale, string> = { ar: "المحافظة", en: "Governorate" };
const GOVERNORATE_PLACEHOLDER: Record<Locale, string> = {
  ar: "اختر المحافظة",
  en: "Select a governorate",
};
const SHIPPING_LABEL: Record<Locale, string> = { ar: "الشحن", en: "Shipping" };
const ETA_LABEL: Record<Locale, string> = { ar: "التوصيل خلال", en: "Delivery in" };
const DAYS_LABEL: Record<Locale, (days: number) => string> = {
  ar: (days) => `${days} ${days === 1 ? "يوم" : "أيام"}`,
  en: (days) => `${days} day${days === 1 ? "" : "s"}`,
};
const PAYMENT_METHOD_HEADING: Record<Locale, string> = { ar: "طريقة الدفع", en: "Payment method" };
const PAYMENT_METHOD_LABEL: Record<Locale, Record<string, string>> = {
  ar: {
    cod: "الدفع عند الاستلام",
    palpay: "PalPay",
    jawwalpay: "JawwalPay",
    bank_of_palestine: "بنك فلسطين",
  },
  en: {
    cod: "Cash on delivery",
    palpay: "PalPay",
    jawwalpay: "JawwalPay",
    bank_of_palestine: "Bank of Palestine",
  },
};
const COD_NOTE: Record<Locale, string> = {
  ar: "ستدفع المبلغ نقدًا عند استلام طلبك.",
  en: "You'll pay in cash when your order is delivered.",
};

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params) as { locale: Locale };
  const { cartId, clearCart } = useCart();
  const t = useT();

  const [cart, setCart] = useState<CartData | null>(null);
  const [cartState, setCartState] = useState<CartState>("loading");

  const [form, setForm] = useState<ShippingFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState<string | null>(null);
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>(DEFAULT_PAYMENT_METHOD);

  const [completeCheckout] = useMutation(CheckoutCompleteDocument);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!cartId) {
        setCartState("empty");
        return;
      }
      try {
        const client = getBrowserClient();
        const { data } = await client.query({ query: CartDocument, variables: { id: cartId } });
        if (cancelled) return;
        setCart(data.cart);
        setCartState(data.cart.lines.length === 0 ? "empty" : "ready");
      } catch {
        if (!cancelled) setCartState("error");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [cartId]);

  // Shipping zones + payment methods are checkout-selection data, independent
  // of the cart itself — fetched once on mount.
  useEffect(() => {
    let cancelled = false;
    async function loadCheckoutOptions() {
      try {
        const client = getBrowserClient();
        const [{ data: zonesData }, { data: methodsData }] = await Promise.all([
          client.query({ query: ShippingZonesDocument }),
          client.query({ query: PaymentMethodsDocument }),
        ]);
        if (cancelled) return;
        setZones(zonesData.shippingZones.filter((zone) => zone.enabled));
        setPaymentMethods(methodsData.paymentMethods);
        const firstMethod = methodsData.paymentMethods[0];
        if (firstMethod && !methodsData.paymentMethods.some((m) => m.method === DEFAULT_PAYMENT_METHOD)) {
          setPaymentMethod(firstMethod.method);
        }
      } catch {
        // Non-fatal — the governorate select / payment radios just stay
        // empty and the form's `required` governorate select blocks submit.
      }
    }
    void loadCheckoutOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedZone = zones.find((zone) => zone.governorate === form.governorate);
  // Client-side estimate only — the authoritative total (with tax + shipping)
  // comes back on the order once checkoutComplete resolves.
  const estimatedTotal = cart
    ? {
        amount_minor: cart.total.amount_minor + (selectedZone ? selectedZone.rate.amount_minor : 0),
        currency: cart.total.currency,
      }
    : null;

  function updateField<K extends keyof ShippingFormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cartId) return;
    setSubmitting(true);
    setErrorMessageText(null);
    try {
      const shippingAddress: AddressInputType = {
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        governorate: form.governorate || undefined,
        region: form.region || undefined,
        postalCode: form.postalCode || undefined,
        country: "PS",
        phone: form.phone || undefined,
      };
      const idempotencyKey = crypto.randomUUID();
      const { data } = await completeCheckout({
        variables: {
          input: { cartId, email: form.email, shippingAddress, paymentMethod },
          idempotencyKey,
        },
      });
      if (!data?.checkoutComplete) throw new Error("Checkout did not return an order");
      setOrder(data.checkoutComplete);
      clearCart();
    } catch (err) {
      setErrorMessageText(errorMessage(err, SUBMIT_ERROR_FALLBACK[locale]));
    } finally {
      setSubmitting(false);
    }
  }

  if (order) {
    const [stampLine1, stampLine2] = STAMP_LINES[locale];
    // COD orders come back with financial_status "pending" — the payment is
    // collected on delivery, not captured now, so the confirmation copy
    // must not claim the amount was already charged.
    const isPaymentPending = order.financial_status === "pending";
    return (
      <div className="page">
        <div className="confirmation">
          <div className="stamp" role="img" aria-label={t("checkout.orderPlaced")}>
            <span>
              {stampLine1}
              <br />
              {stampLine2}
            </span>
          </div>
          <h1 className="confirmation__heading">{t("checkout.orderPlaced")}</h1>
          <p className="confirmation__total">
            {(isPaymentPending ? AMOUNT_DUE : TOTAL_CHARGED)[locale]}{" "}
            <span className="i18n-ltr">{formatMoney({ amount_minor: order.total, currency: order.currency })}</span>
          </p>
          {isPaymentPending && (
            <p className="alert alert--muted">{PAY_ON_DELIVERY_NOTE[locale]}</p>
          )}
          <p className="confirmation__email">
            {t("checkout.orderNumber")}: <span className="i18n-ltr">{order.number}</span>
          </p>
          <p className="confirmation__email">
            {RECEIPT_PREFIX[locale]} <span className="i18n-ltr">{order.email}</span>.
          </p>
          <Link href={`/${locale}`} className="button button--primary">
            {CONTINUE_SHOPPING[locale]}
          </Link>
        </div>
      </div>
    );
  }

  if (cartState === "empty") {
    return (
      <div className="page">
        <h1 className="page__title">{t("checkout.title")}</h1>
        <p className="alert alert--muted">
          <Link href={`/${locale}`}>{t("cart.empty")}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page__title">{t("checkout.title")}</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <section className="form-section">
            <h2 className="form-section__heading">{t("checkout.contact")}</h2>
            <div className="field">
              <label htmlFor="email" className="field-label">
                {t("checkout.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                dir="ltr"
                className="input"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
          </section>

          <section className="form-section">
            <h2 className="form-section__heading">{t("checkout.shippingAddress")}</h2>
            <div className="field">
              <label htmlFor="line1" className="field-label">
                {t("checkout.line1")}
              </label>
              <input
                id="line1"
                required
                className="input"
                value={form.line1}
                onChange={(e) => updateField("line1", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="line2" className="field-label">
                {t("checkout.line2")} <span className="field-label__optional">({OPTIONAL[locale]})</span>
              </label>
              <input
                id="line2"
                className="input"
                value={form.line2}
                onChange={(e) => updateField("line2", e.target.value)}
              />
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="city" className="field-label">
                  {t("checkout.city")}
                </label>
                <input
                  id="city"
                  required
                  className="input"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="governorate" className="field-label">
                  {GOVERNORATE_LABEL[locale]}
                </label>
                <select
                  id="governorate"
                  required
                  className="input"
                  value={form.governorate}
                  onChange={(e) => updateField("governorate", e.target.value)}
                >
                  <option value="" disabled>
                    {GOVERNORATE_PLACEHOLDER[locale]}
                  </option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.governorate}>
                      {zone.name}
                    </option>
                  ))}
                </select>
                {selectedZone && (
                  <p className="field-hint">
                    {SHIPPING_LABEL[locale]}: <span className="i18n-ltr">{formatMoney(selectedZone.rate)}</span>
                    {selectedZone.eta_days != null && (
                      <>
                        {" · "}
                        {ETA_LABEL[locale]} {DAYS_LABEL[locale](selectedZone.eta_days)}
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="region" className="field-label">
                  {t("checkout.region")} <span className="field-label__optional">({OPTIONAL[locale]})</span>
                </label>
                <input
                  id="region"
                  className="input"
                  value={form.region}
                  onChange={(e) => updateField("region", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="postalCode" className="field-label">
                  {t("checkout.postalCode")} <span className="field-label__optional">({OPTIONAL[locale]})</span>
                </label>
                <input
                  id="postalCode"
                  dir="ltr"
                  className="input"
                  value={form.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="phone" className="field-label">
                {t("checkout.phone")} <span className="field-label__optional">({OPTIONAL[locale]})</span>
              </label>
              <input
                id="phone"
                type="tel"
                dir="ltr"
                className="input"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </section>

          <section className="form-section">
            <h2 className="form-section__heading">{PAYMENT_METHOD_HEADING[locale]}</h2>
            <div className="radio-group">
              {(paymentMethods.length > 0
                ? paymentMethods
                : [{ __typename: "PaymentMethodType", method: DEFAULT_PAYMENT_METHOD, capture: "on_delivery" }]
              ).map((pm) => (
                <label key={pm.method} className="radio-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.method}
                    checked={paymentMethod === pm.method}
                    onChange={() => setPaymentMethod(pm.method)}
                  />
                  <span>{PAYMENT_METHOD_LABEL[locale][pm.method] ?? pm.method}</span>
                </label>
              ))}
            </div>
            {paymentMethod === DEFAULT_PAYMENT_METHOD && (
              <p className="field-hint">{COD_NOTE[locale]}</p>
            )}
          </section>

          {errorMessageText && (
            <p className="alert alert--error" role="alert">
              {errorMessageText}
            </p>
          )}

          <button
            type="submit"
            className="button button--primary checkout-form__submit"
            disabled={submitting || cartState !== "ready"}
          >
            {submitting ? (
              PLACING_ORDER[locale]
            ) : estimatedTotal ? (
              <>
                {t("checkout.placeOrder")} · <span className="i18n-ltr">{formatMoney(estimatedTotal)}</span>
              </>
            ) : (
              t("checkout.placeOrder")
            )}
          </button>
        </form>

        {cart && (
          <aside className="receipt receipt--compact">
            <h2 className="receipt__heading">{ORDER_SUMMARY_HEADING[locale]}</h2>
            <div className="receipt__rows">
              {cart.lines.map((line) => (
                <div className="receipt__row" key={line.id}>
                  <span>
                    {line.title} × {line.quantity}
                  </span>
                  <span className="receipt__row-value">{formatMoney(line.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="receipt__tear" aria-hidden="true" />
            <div className="receipt__rows">
              <div className="receipt__row">
                <span>{t("cart.subtotal")}</span>
                <span className="receipt__row-value">{formatMoney(cart.subtotal)}</span>
              </div>
              {cart.discount_code && (
                <div className="receipt__row receipt__row--discount">
                  <span>{t("cart.discount")}</span>
                  <span className="receipt__row-value">−{formatMoney(cart.discount)}</span>
                </div>
              )}
              {selectedZone && (
                <div className="receipt__row">
                  <span>{SHIPPING_LABEL[locale]}</span>
                  <span className="receipt__row-value">{formatMoney(selectedZone.rate)}</span>
                </div>
              )}
            </div>
            <div className="receipt__total">
              <span>{t("cart.total")}</span>
              <span>{formatMoney(estimatedTotal)}</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
