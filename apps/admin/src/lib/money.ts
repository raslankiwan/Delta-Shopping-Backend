/** Minor-unit money value, as returned by the GraphQL API (MoneyType). */
export interface Money {
  amount_minor: number;
  currency: string;
}

/** Formats a minor-unit amount as a localized currency string. */
export function formatMoney(money: Money | null | undefined, locale?: string): string {
  if (!money) return "—";
  return new Intl.NumberFormat(locale, { style: "currency", currency: money.currency }).format(
    money.amount_minor / 100,
  );
}
