/**
 * Product images come back from the API as store-relative paths (e.g.
 * "/uploads/x.png"), served from the API's origin — not under its "/v1"
 * prefix. Build an absolute <img> src from either an already-absolute URL
 * or one of those relative paths. Safe to import from server or client code.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/v1";
const API_ORIGIN = API_URL.replace(/\/v1$/, "");

export function mediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}
