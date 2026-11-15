import type { ChangeEvent } from "react";
import { LOCALES, LOCALE_LABELS } from "@mercato/i18n";
import { StoreSwitcher } from "./StoreSwitcher";
import { useAuth } from "../auth/useAuth";
import { logout } from "../auth/authStore";
import { Button } from "./ui";
import { useLocale, useT } from "../i18n/LocaleContext";

function initialsFrom(userId: string): string {
  return userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "ST";
}

function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  const t = useT();

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (value === "ar" || value === "en") setLocale(value);
  }

  return (
    <label className="row" aria-label={t("common.language")}>
      <span className="text-muted" style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>
        {t("common.language")}
      </span>
      <select className="select" value={locale} onChange={handleChange} style={{ height: 32, minWidth: 120 }}>
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TopBar() {
  const { principal } = useAuth();
  const t = useT();

  return (
    <header className="topbar">
      <StoreSwitcher />

      <div className="row" style={{ gap: "var(--space-4)" }}>
        <LocaleSwitcher />
        {principal ? (
          <span className="row" title={principal.user_id}>
            <span
              className="row"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--accent-soft)",
                color: "var(--accent-strong)",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                justifyContent: "center",
              }}
            >
              {initialsFrom(principal.user_id)}
            </span>
            <span className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
              {t("admin.staff")}
            </span>
          </span>
        ) : null}
        <Button variant="ghost" size="sm" onClick={logout}>
          {t("admin.logout")}
        </Button>
      </div>
    </header>
  );
}
