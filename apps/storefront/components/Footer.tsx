import type { Locale } from "@mercato/i18n";

// No catalog keys exist yet for footer copy (see i18n gap list in the
// storefront i18n summary) — inline bilingual literals for now.
const TAGLINE: Record<Locale, string> = {
  ar: "متجر Mercato — سوق تجريبي متعدد المستأجرين.",
  en: "Mercato. A demo marketplace.",
};
const PRICE_DISCLAIMER: Record<Locale, string> = {
  ar: "الأسعار المعروضة توضيحية.",
  en: "Prices shown are illustrative.",
};
const VAT_NOTE: Record<Locale, string> = {
  ar: "الأسعار شاملة ضريبة القيمة المضافة",
  en: "Prices include VAT",
};

export function Footer({ locale, taxBps }: { locale: Locale; taxBps?: number | null }) {
  const year = new Date().getFullYear();
  // tax_bps is basis points (e.g. 1600 = 16%) — divide by 100 for a percent.
  const taxPercent = typeof taxBps === "number" ? taxBps / 100 : null;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>
          © <span className="i18n-ltr">{year}</span> {TAGLINE[locale]}
        </p>
        {taxPercent != null && (
          <p>
            {VAT_NOTE[locale]} <span className="i18n-ltr">{taxPercent}%</span>
          </p>
        )}
        <p>{PRICE_DISCLAIMER[locale]}</p>
      </div>
    </footer>
  );
}
