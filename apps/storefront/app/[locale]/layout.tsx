import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { StoreConfigDocument } from "@mercato/graphql";
import { LOCALES, dir, isLocale, type Locale } from "@mercato/i18n";
import { CartProvider } from "@/lib/cart-context";
import { LocaleProvider } from "@/lib/locale-context";
import { MercatoApolloProvider } from "@/lib/apollo-provider";
import { getServerClient } from "@/lib/server-client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../globals.css";

export const metadata: Metadata = {
  title: "Mercato Store",
  description: "Mercato — multi-tenant commerce platform storefront.",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// This is the root layout: there is no app/layout.tsx above it because every
// route is nested under the [locale] segment, so it owns <html>/<body>.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  // Best-effort — the footer's VAT note is a nice-to-have, not worth failing
  // the whole layout over if the config query has a hiccup.
  let taxBps: number | null = null;
  try {
    const { data } = await getServerClient().query({ query: StoreConfigDocument });
    taxBps = data.storeConfig.tax_bps;
  } catch {
    taxBps = null;
  }

  return (
    <html lang={locale} dir={dir(locale)}>
      <body>
        <MercatoApolloProvider>
          <LocaleProvider locale={locale}>
            <CartProvider>
              <Header />
              <main className="site-main">{children}</main>
              <Footer locale={locale} taxBps={taxBps} />
            </CartProvider>
          </LocaleProvider>
        </MercatoApolloProvider>
      </body>
    </html>
  );
}
