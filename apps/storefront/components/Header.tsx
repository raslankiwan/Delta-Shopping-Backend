"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_LABELS, type Locale } from "@mercato/i18n";
import { useCart } from "@/lib/cart-context";
import { useLocale, useT } from "@/lib/locale-context";

/** Swaps the leading /[locale] segment of a pathname, preserving the rest. */
function withLocale(pathname: string, current: Locale, next: Locale): string {
  const segments = pathname.split("/");
  if (segments[1] === current) {
    segments[1] = next;
    return segments.join("/");
  }
  return `/${next}${pathname}`;
}

export function Header() {
  const { itemCount } = useCart();
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname() ?? `/${locale}`;

  const otherLocale = LOCALES.find((candidate) => candidate !== locale) ?? locale;
  const switchHref = withLocale(pathname, locale, otherLocale);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href={`/${locale}`} className="wordmark">
          MERCATO
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <Link href={`/${locale}`} className="site-nav__link">
            {t("nav.home")}
          </Link>
          <Link href={`/${locale}/cart`} className="site-nav__link">
            {t("nav.cart")}
            {itemCount > 0 && (
              <span className="cart-badge" aria-label={t("cart.items", { count: itemCount })}>
                {itemCount}
              </span>
            )}
          </Link>
          <Link href={`/${locale}/account`} className="site-nav__link">
            {t("nav.account")}
          </Link>
          <Link
            href={switchHref}
            className="site-nav__link locale-switch"
            hrefLang={otherLocale}
            lang={otherLocale}
            aria-label={`${t("common.language")}: ${LOCALE_LABELS[otherLocale]}`}
          >
            {LOCALE_LABELS[otherLocale]}
          </Link>
        </nav>
      </div>
    </header>
  );
}
