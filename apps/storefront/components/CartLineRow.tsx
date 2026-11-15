"use client";

import type { CartQuery } from "@mercato/graphql";
import type { Locale } from "@mercato/i18n";
import { useLocale, useT } from "@/lib/locale-context";
import { formatMoney } from "@/lib/money";

type CartLine = CartQuery["cart"]["lines"][number];

// No catalog keys for these interpolated aria-labels yet — gap noted in the
// storefront i18n summary.
const REMOVE_LABEL: Record<Locale, (title: string) => string> = {
  ar: (title) => `إزالة ${title}`,
  en: (title) => `Remove ${title}`,
};
const DECREASE_LABEL: Record<Locale, (title: string) => string> = {
  ar: (title) => `إنقاص كمية ${title}`,
  en: (title) => `Decrease quantity of ${title}`,
};
const INCREASE_LABEL: Record<Locale, (title: string) => string> = {
  ar: (title) => `زيادة كمية ${title}`,
  en: (title) => `Increase quantity of ${title}`,
};

export function CartLineRow({
  line,
  busy,
  onQuantityChange,
}: {
  line: CartLine;
  busy: boolean;
  onQuantityChange: (lineId: string, quantity: number) => void;
}) {
  const locale = useLocale();
  const t = useT();

  return (
    <li className="cart-line">
      <div>
        <p className="cart-line__title">{line.title}</p>
        <p className="cart-line__sku">
          {t("product.sku")} <span className="i18n-ltr">{line.sku}</span>
        </p>
      </div>
      <div className="stepper stepper--compact">
        <button
          type="button"
          className="stepper__button"
          disabled={busy}
          onClick={() => onQuantityChange(line.id, line.quantity - 1)}
          aria-label={line.quantity === 1 ? REMOVE_LABEL[locale](line.title) : DECREASE_LABEL[locale](line.title)}
        >
          {line.quantity === 1 ? "×" : "−"}
        </button>
        <span className="stepper__value" aria-live="polite">
          {line.quantity}
        </span>
        <button
          type="button"
          className="stepper__button"
          disabled={busy}
          onClick={() => onQuantityChange(line.id, line.quantity + 1)}
          aria-label={INCREASE_LABEL[locale](line.title)}
        >
          +
        </button>
      </div>
      <p className="cart-line__total">
        <span className="i18n-ltr">{formatMoney(line.line_total)}</span>
      </p>
    </li>
  );
}
