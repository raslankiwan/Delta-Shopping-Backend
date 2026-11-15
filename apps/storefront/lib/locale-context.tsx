"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createT, type Locale, type TFunc } from "@mercato/i18n";

interface LocaleContextValue {
  /** The active route locale (e.g. "ar" or "en"). */
  locale: Locale;
  /** Translator bound to the active locale. */
  t: TFunc;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Feeds the server-resolved [locale] segment to the client component tree.
 * Mount once, at the root of app/[locale]/layout.tsx, below <html lang dir>.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<LocaleContextValue>(() => ({ locale, t: createT(locale) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale/useT must be used within a LocaleProvider");
  return ctx;
}

/** The active locale, for building locale-prefixed hrefs, `<bdi>` calls, etc. */
export function useLocale(): Locale {
  return useLocaleContext().locale;
}

/** Translator bound to the active locale — the client-component counterpart of `createT(locale)`. */
export function useT(): TFunc {
  return useLocaleContext().t;
}
