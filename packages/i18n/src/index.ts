import ar from './catalogs/ar.json';
import en from './catalogs/en.json';

export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Arabic is the default — the platform's primary market. */
export const DEFAULT_LOCALE: Locale = 'ar';

export const LOCALE_LABELS: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
};

const RTL_LOCALES: Record<Locale, boolean> = { ar: true, en: false };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Text direction for a locale — Arabic is right-to-left. */
export function dir(locale: string): 'rtl' | 'ltr' {
  return isLocale(locale) && RTL_LOCALES[locale] ? 'rtl' : 'ltr';
}

type Catalog = Record<string, unknown>;
const CATALOGS: Record<Locale, Catalog> = { ar, en };

function lookupString(catalog: Catalog, key: string): string | undefined {
  const node = key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object') return (current as Record<string, unknown>)[part];
    return undefined;
  }, catalog);
  return typeof node === 'string' ? node : undefined;
}

export type TFunc = (key: string, params?: Record<string, string | number>) => string;

/**
 * Build a translator for a locale. Missing keys fall back to the default locale,
 * then to the key itself. `{placeholder}` tokens are interpolated from `params`.
 */
export function createT(locale: string): TFunc {
  const active: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return (key, params) => {
    const raw = lookupString(CATALOGS[active], key) ?? lookupString(CATALOGS[DEFAULT_LOCALE], key);
    if (raw === undefined) return key;
    if (!params) return raw;
    let out = raw;
    for (const [name, replacement] of Object.entries(params)) {
      out = out.replace(new RegExp(`\\{${name}\\}`, 'g'), String(replacement));
    }
    return out;
  };
}
