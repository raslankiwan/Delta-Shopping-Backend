"use client";

import { use, useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import {
  CartDocument,
  CartUpdateLineDocument,
  CartRemoveLineDocument,
  CartApplyDiscountDocument,
  CartRemoveDiscountDocument,
  type CartQuery,
} from "@mercato/graphql";
import type { Locale } from "@mercato/i18n";
import { getBrowserClient } from "@/lib/client";
import { useCart } from "@/lib/cart-context";
import { useT } from "@/lib/locale-context";
import { formatMoney } from "@/lib/money";
import { errorCode, errorMessage } from "@/lib/graphql-error";
import { CartLineRow } from "@/components/CartLineRow";

type LoadState = "loading" | "ready" | "empty" | "error";
type CartData = CartQuery["cart"];

// Strings with no catalog key yet — gap list is in the storefront i18n summary.
const SUMMARY_HEADING: Record<Locale, string> = { ar: "الملخص", en: "Summary" };
const LOAD_ERROR_FALLBACK: Record<Locale, string> = {
  ar: "تعذّر تحميل سلتك.",
  en: "Could not load your cart.",
};
const UPDATE_ERROR_FALLBACK: Record<Locale, string> = {
  ar: "تعذّر تحديث سلتك.",
  en: "Could not update your cart.",
};
const DISCOUNT_ERROR_FALLBACK: Record<Locale, string> = {
  ar: "تعذّر تطبيق هذا الرمز.",
  en: "That code could not be applied.",
};
const DISCOUNT_REMOVE_ERROR_FALLBACK: Record<Locale, string> = {
  ar: "تعذّرت إزالة الرمز.",
  en: "Could not remove the code.",
};
const REMOVE_CODE: Record<Locale, string> = { ar: "إزالة الرمز", en: "Remove code" };

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params) as { locale: Locale };
  const { cartId, refreshCount, clearCart } = useCart();
  const t = useT();

  const [cart, setCart] = useState<CartData | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [busyLineId, setBusyLineId] = useState<string | null>(null);

  const [discountCode, setDiscountCode] = useState("");
  const [discountBusy, setDiscountBusy] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const [updateLine] = useMutation(CartUpdateLineDocument);
  const [removeLine] = useMutation(CartRemoveLineDocument);
  const [applyDiscountMutation] = useMutation(CartApplyDiscountDocument);
  const [removeDiscountMutation] = useMutation(CartRemoveDiscountDocument);

  const load = useCallback(async () => {
    if (!cartId) {
      setCart(null);
      setState("empty");
      return;
    }
    setState("loading");
    setError(null);
    try {
      const client = getBrowserClient();
      const { data } = await client.query({ query: CartDocument, variables: { id: cartId } });
      setCart(data.cart);
      setState(data.cart.lines.length === 0 ? "empty" : "ready");
      void refreshCount(data.cart);
    } catch (err) {
      if (errorCode(err) === "cart_not_found") {
        clearCart();
        setCart(null);
        setState("empty");
        return;
      }
      setError(errorMessage(err, LOAD_ERROR_FALLBACK[locale]));
      setState("error");
    }
  }, [cartId, refreshCount, clearCart, locale]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateQuantity(lineId: string, quantity: number) {
    if (!cartId) return;
    setBusyLineId(lineId);
    setError(null);
    try {
      const updated =
        quantity <= 0
          ? (await removeLine({ variables: { cartId, lineId } })).data?.cartRemoveLine
          : (await updateLine({ variables: { cartId, lineId, input: { quantity } } })).data
              ?.cartUpdateLine;
      if (!updated) throw new Error("Missing cart in mutation response");
      setCart(updated);
      setState(updated.lines.length === 0 ? "empty" : "ready");
      void refreshCount(updated);
    } catch (err) {
      setError(errorMessage(err, UPDATE_ERROR_FALLBACK[locale]));
    } finally {
      setBusyLineId(null);
    }
  }

  async function applyDiscount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cartId || !discountCode.trim()) return;
    setDiscountBusy(true);
    setDiscountError(null);
    try {
      const { data } = await applyDiscountMutation({
        variables: { cartId, input: { code: discountCode.trim() } },
      });
      if (data?.cartApplyDiscount) setCart(data.cartApplyDiscount);
      setDiscountCode("");
    } catch (err) {
      setDiscountError(errorMessage(err, DISCOUNT_ERROR_FALLBACK[locale]));
    } finally {
      setDiscountBusy(false);
    }
  }

  async function removeDiscount() {
    if (!cartId) return;
    setDiscountBusy(true);
    setDiscountError(null);
    try {
      const { data } = await removeDiscountMutation({ variables: { cartId } });
      if (data?.cartRemoveDiscount) setCart(data.cartRemoveDiscount);
    } catch (err) {
      setDiscountError(errorMessage(err, DISCOUNT_REMOVE_ERROR_FALLBACK[locale]));
    } finally {
      setDiscountBusy(false);
    }
  }

  if (state === "loading") {
    return (
      <div className="page">
        <p className="alert alert--muted" role="status">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="page">
        <p className="alert alert--error" role="alert">
          {error}
        </p>
        <button type="button" className="button button--secondary" style={{ marginTop: "1rem" }} onClick={load}>
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (state === "empty" || !cart) {
    return (
      <div className="page">
        <h1 className="page__title">{t("cart.title")}</h1>
        <p className="alert alert--muted">
          <Link href={`/${locale}`}>{t("cart.empty")}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page__title">{t("cart.title")}</h1>
      <div className="cart-layout">
        <ul className="cart-lines">
          {cart.lines.map((line) => (
            <CartLineRow
              key={line.id}
              line={line}
              busy={busyLineId === line.id}
              onQuantityChange={updateQuantity}
            />
          ))}
        </ul>

        <aside className="receipt">
          <h2 className="receipt__heading">{SUMMARY_HEADING[locale]}</h2>
          <div className="receipt__rows">
            <div className="receipt__row">
              <span>{t("cart.subtotal")}</span>
              <span className="receipt__row-value">{formatMoney(cart.subtotal)}</span>
            </div>
            {cart.discount_code && (
              <div className="receipt__row receipt__row--discount">
                <span>
                  {t("cart.discount")} · <span className="i18n-ltr">{cart.discount_code}</span>
                </span>
                <span className="receipt__row-value">−{formatMoney(cart.discount)}</span>
              </div>
            )}
          </div>
          <div className="receipt__tear" aria-hidden="true" />
          <div className="receipt__total">
            <span>{t("cart.total")}</span>
            <span>{formatMoney(cart.total)}</span>
          </div>

          <form className="discount-form" onSubmit={applyDiscount}>
            <label htmlFor="discount-code" className="field-label">
              {t("cart.discountCode")}
            </label>
            <div className="discount-form__row">
              <input
                id="discount-code"
                className="input"
                dir="ltr"
                placeholder="e.g. WELCOME10"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                disabled={discountBusy}
              />
              <button
                type="submit"
                className="button button--secondary"
                disabled={discountBusy || !discountCode.trim()}
              >
                {t("cart.apply")}
              </button>
            </div>
            {cart.discount_code && (
              <button type="button" className="link-button" onClick={removeDiscount} disabled={discountBusy}>
                {REMOVE_CODE[locale]}
              </button>
            )}
            {discountError && (
              <p className="alert alert--error" role="alert">
                {discountError}
              </p>
            )}
          </form>

          <Link href={`/${locale}/checkout`} className="button button--primary receipt__checkout">
            {t("cart.checkout")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
