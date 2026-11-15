import { DEFAULT_LOCALE, isLocale, type Locale } from "@mercato/i18n";

/**
 * Resolves a route `[locale]` segment to a typed `Locale`. The `[locale]`
 * layout already 404s unknown segments via `isLocale`, so by the time a
 * page component runs the value is guaranteed valid — this just gives
 * TypeScript that guarantee too, with a defensive fallback.
 */
export function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
