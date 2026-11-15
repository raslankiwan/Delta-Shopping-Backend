import { z } from 'zod';

/** ISO-4217 currency code, e.g. "USD". Uppercased on parse. */
export const currencyCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'must be a 3-letter ISO-4217 currency code');
export type CurrencyCode = z.infer<typeof currencyCode>;

/** BCP-47 locale tag, e.g. "en", "fr-FR", "ar". Loosely validated. */
export const localeCode = z
  .string()
  .trim()
  .regex(/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/, 'must be a BCP-47 locale tag');
export type LocaleCode = z.infer<typeof localeCode>;

/** Serializable money schema shared across API boundaries. */
export const money = z.object({
  amount_minor: z.number().int(),
  currency: currencyCode,
});
export type MoneyDto = z.infer<typeof money>;

/** Right-to-left base languages, used to decide `dir="rtl"`. */
const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ug', 'yi']);

export function isRtlLocale(locale: string): boolean {
  const base = locale.toLowerCase().split('-')[0]!;
  return RTL_LANGUAGES.has(base);
}

export function textDirection(locale: string): 'rtl' | 'ltr' {
  return isRtlLocale(locale) ? 'rtl' : 'ltr';
}
