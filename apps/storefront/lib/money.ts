/** Minimal money shape shared by every GraphQL `MoneyType` selection. */
export interface Money {
  amount_minor: number;
  currency: string;
}

/** Format minor units as a localized currency string. */
export function formatMoney(money: Money | null | undefined, locale?: string): string {
  if (!money) return "—";
  return new Intl.NumberFormat(locale, { style: "currency", currency: money.currency }).format(
    money.amount_minor / 100,
  );
}
