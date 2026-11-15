import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@mercato/i18n";

// Storefront routing is always locale-prefixed (/ar, /en, ...). Arabic is the
// default locale (@mercato/i18n DEFAULT_LOCALE), so bare "/" and any other
// rootless path get redirected into "/ar/...". Paths that already start with
// a known locale segment (including unknown-locale segments like "/fr", which
// the [locale] layout will 404 on) are left alone.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1] ?? "";

  if (isLocale(firstSegment)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API-style/static-file paths (anything with a dot,
  // e.g. /icon-192.png), so only real app routes get the locale redirect.
  matcher: ["/((?!_next|.*\\..*).*)"],
};
