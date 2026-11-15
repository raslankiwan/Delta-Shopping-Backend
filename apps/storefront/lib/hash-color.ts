/**
 * The catalog has no product imagery, so each product gets a deterministic
 * "swatch" derived from its slug instead of a placeholder image — a stable
 * colored ticket stub, consistent with the market-ledger design language
 * (see app/globals.css). Pure functions, safe to import from server or
 * client code.
 */

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Deterministic hue (0-359) for a product slug. */
export function hueFromSlug(slug: string): number {
  return hashString(slug) % 360;
}

/** First letter of a title, uppercased, for the swatch monogram. */
export function monogramFromTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed[0]!.toUpperCase() : "?";
}

/** CSS gradient string for a product's ticket swatch. */
export function swatchGradient(slug: string): string {
  const hue = hueFromSlug(slug);
  const hue2 = (hue + 42) % 360;
  return `linear-gradient(135deg, hsl(${hue} 72% 58%), hsl(${hue2} 68% 42%))`;
}
