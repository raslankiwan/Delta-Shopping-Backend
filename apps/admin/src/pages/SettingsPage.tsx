import { useState, type FormEvent } from "react";
import {
  AdminShippingZonesDocument,
  AdminStoresDocument,
  CreateStoreDocument,
  type CreateStoreInputType,
} from "@mercato/graphql";
import type { Locale } from "@mercato/i18n";
import { useAdminMutation, useAdminQuery } from "../lib/apolloHooks";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage } from "../lib/errors";
import { formatMoney } from "../lib/money";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, Input, LoadingBlock, StatusBadge } from "../components/ui";
import { useLocale, useT } from "../i18n/LocaleContext";

/**
 * No key for these exists in @mercato/i18n yet — kept as a local bilingual
 * literal per the task brief instead of editing the shared package, same
 * convention used elsewhere in the admin app (e.g. ProductDetailPage).
 */
const STR = {
  shippingZonesTitle: { ar: "مناطق الشحن", en: "Shipping zones" },
  shippingZonesSubtitle: {
    ar: "أسعار الشحن الثابتة لمحافظات الضفة الغربية.",
    en: "Flat shipping rates for the West Bank governorates.",
  },
  governorate: { ar: "المحافظة", en: "Governorate" },
  rate: { ar: "السعر", en: "Rate" },
  codAvailable: { ar: "الدفع عند الاستلام", en: "COD available" },
  etaDays: { ar: "مدة التوصيل (أيام)", en: "ETA (days)" },
  yes: { ar: "نعم", en: "Yes" },
  no: { ar: "لا", en: "No" },
  disabled: { ar: "معطّلة", en: "Disabled" },
  noZones: { ar: "لا توجد مناطق شحن", en: "No shipping zones" },
} as const satisfies Record<string, Record<Locale, string>>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function defaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function CreateStoreForm() {
  const t = useT();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [defaultLocale, setDefaultLocale] = useState("en-US");
  const [timezone, setTimezone] = useState(defaultTimezone());

  const [createStore, createStoreState] = useAdminMutation(CreateStoreDocument, {
    refetchQueries: [{ query: AdminStoresDocument }],
    onCompleted: () => {
      setName("");
      setSlug("");
      setSlugTouched(false);
    },
  });

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !timezone.trim()) return;
    const input: CreateStoreInputType = {
      name,
      slug,
      defaultCurrency,
      defaultLocale,
      timezone,
    };
    void createStore({ variables: { input } });
  }

  return (
    // No admin.settings.createStore/storeCreated key yet — inline literals, see task summary.
    <Card title="Create store">
      <form onSubmit={handleSubmit} className="stack">
        {createStoreState.error ? <ErrorBanner message={getErrorMessage(createStoreState.error)} /> : null}
        {createStoreState.data ? (
          <div className="error-banner" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
            Store created. Log out and back in to make it appear in the store switcher.
          </div>
        ) : null}

        <div className="form-grid">
          <Field label={t("account.name")} htmlFor="store-name">
            <Input id="store-name" required value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="North Store" />
          </Field>
          <Field label={t("admin.catalog.slug")} htmlFor="store-slug">
            <Input
              id="store-slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="north-store"
            />
          </Field>
          {/* No admin.settings.defaultCurrency/defaultLocale/timezone keys yet — closest key reused / inline literal, see task summary. */}
          <Field label={t("common.currency")} htmlFor="store-currency">
            <Input id="store-currency" required value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase())} maxLength={3} />
          </Field>
          <Field label="Default locale" htmlFor="store-locale">
            <Input id="store-locale" required value={defaultLocale} onChange={(e) => setDefaultLocale(e.target.value)} />
          </Field>
          <Field label="Timezone" htmlFor="store-timezone">
            <Input id="store-timezone" required value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="UTC" />
          </Field>
        </div>

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={createStoreState.loading}>
            {createStoreState.loading ? `${t("common.create")}…` : "Create store"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ShippingZonesCard() {
  const t = useT();
  const { locale } = useLocale();
  const zonesQuery = useAdminQuery(AdminShippingZonesDocument);
  const zones = zonesQuery.data?.shippingZones ?? [];

  return (
    <Card title={STR.shippingZonesTitle[locale]}>
      <div className="stack">
        <p className="text-muted" style={{ fontSize: "var(--text-sm)", marginTop: 0 }}>
          {STR.shippingZonesSubtitle[locale]}
        </p>
        {zonesQuery.loading ? (
          <LoadingBlock label={t("common.loading")} />
        ) : zonesQuery.error ? (
          <ErrorBanner message={getErrorMessage(zonesQuery.error)} onRetry={() => zonesQuery.refetch()} />
        ) : zones.length === 0 ? (
          <EmptyState title={STR.noZones[locale]} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{STR.governorate[locale]}</th>
                  <th>{STR.rate[locale]}</th>
                  <th>{STR.codAvailable[locale]}</th>
                  <th className="num">{STR.etaDays[locale]}</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td>
                      {zone.name}
                      {!zone.enabled ? <Badge tone="neutral">{STR.disabled[locale]}</Badge> : null}
                    </td>
                    <td className="ltr-num">{formatMoney(zone.rate, "en-US")}</td>
                    <td>
                      <Badge tone={zone.cod_available ? "success" : "danger"}>
                        {zone.cod_available ? STR.yes[locale] : STR.no[locale]}
                      </Badge>
                    </td>
                    <td className="num ltr-num">{zone.eta_days ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

export function SettingsPage() {
  const { stores, storeId, principal } = useAuth();
  const t = useT();
  const currentStore = stores.find((s) => s.id === storeId) ?? null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("admin.settings.title")}</h1>
          {/* No admin.settings.subtitle key yet — inline literal, see task summary. */}
          <p className="page-subtitle">Store and account details.</p>
        </div>
      </div>

      <div className="page-section">
        {/* No admin.settings.activeStore/noStoreSelected keys yet — inline literals, see task summary. */}
        <Card title="Active store">
          {currentStore ? (
            <div className="stack" style={{ gap: "var(--space-2)" }}>
              <div className="row-between">
                <span className="text-muted">{t("account.name")}</span>
                <span>{currentStore.name}</span>
              </div>
              <div className="row-between">
                <span className="text-muted">{t("admin.catalog.slug")}</span>
                <span className="mono ltr-num">{currentStore.slug}</span>
              </div>
              <div className="row-between">
                <span className="text-muted">{t("admin.catalog.status")}</span>
                <StatusBadge status={currentStore.status} />
              </div>
              <div className="row-between">
                <span className="text-muted">{t("common.currency")}</span>
                <span className="ltr-num">{currentStore.default_currency}</span>
              </div>
              <div className="row-between">
                <span className="text-muted">Default locale</span>
                <span className="ltr-num">{currentStore.default_locale}</span>
              </div>
              <div className="row-between">
                <span className="text-muted">Store ID</span>
                <span className="mono text-faint ltr-num" style={{ fontSize: "var(--text-xs)" }}>
                  {currentStore.id}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted">No store selected.</p>
          )}
        </Card>
      </div>

      <div className="page-section">
        <ShippingZonesCard />
      </div>

      <div className="page-section">
        {/* No admin.settings.account/userId/organizationId/permissions keys yet — inline literals, see task summary. */}
        <Card title="Account">
          <div className="stack" style={{ gap: "var(--space-2)" }}>
            <div className="row-between">
              <span className="text-muted">User ID</span>
              <span className="mono text-faint ltr-num" style={{ fontSize: "var(--text-xs)" }}>
                {principal?.user_id}
              </span>
            </div>
            <div className="row-between">
              <span className="text-muted">Organization ID</span>
              <span className="mono text-faint ltr-num" style={{ fontSize: "var(--text-xs)" }}>
                {principal?.organization_id}
              </span>
            </div>
            <div className="row-between">
              <span className="text-muted">Permissions</span>
              <span>{principal?.permissions.length ? principal.permissions.join(", ") : "—"}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="page-section">
        <CreateStoreForm />
        <p className="field-hint" style={{ marginTop: "var(--space-3)" }}>
          A newly created store is not automatically added to your session's scope. Log out and back in for it to
          appear in the store switcher above.
        </p>
      </div>
    </div>
  );
}
