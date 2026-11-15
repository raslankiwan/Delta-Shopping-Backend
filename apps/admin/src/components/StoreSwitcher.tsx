import type { ChangeEvent } from "react";
import { useAuth } from "../auth/useAuth";
import { selectStore } from "../auth/authStore";
import { useT } from "../i18n/LocaleContext";

export function StoreSwitcher() {
  const { stores, storeId, storesLoading } = useAuth();
  const t = useT();

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    selectStore(e.target.value);
  }

  if (storesLoading && stores.length === 0) {
    return (
      <span className="text-faint" style={{ fontSize: "var(--text-xs)" }}>
        {t("common.loading")}
      </span>
    );
  }

  if (stores.length === 0) {
    return null;
  }

  return (
    <label className="row" aria-label={t("admin.store")}>
      <span className="text-muted" style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>
        {t("admin.store")}
      </span>
      <select className="select" value={storeId ?? ""} onChange={handleChange} style={{ height: 32, minWidth: 160 }}>
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>
    </label>
  );
}
