import { useState } from "react";
import { ReportInventoryDocument, ReportSalesDocument, ReportTopProductsDocument } from "@mercato/graphql";
import { useAdminQuery } from "../lib/apolloHooks";
import { formatMoney } from "../lib/money";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage } from "../lib/errors";
import { EmptyState, ErrorBanner, Field, Input, LoadingBlock } from "../components/ui";
import { useT } from "../i18n/LocaleContext";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function ReportsPage() {
  const { storeId, stores } = useAuth();
  const t = useT();
  const currency = stores.find((s) => s.id === storeId)?.default_currency ?? "USD";

  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoDaysAgo(0));

  const salesQuery = useAdminQuery(ReportSalesDocument, {
    variables: { from, to },
    skip: !storeId,
  });

  const inventoryReportQuery = useAdminQuery(ReportInventoryDocument, {
    skip: !storeId,
  });

  const topProductsQuery = useAdminQuery(ReportTopProductsDocument, {
    variables: { limit: 10 },
    skip: !storeId,
  });

  const sales = salesQuery.data?.reportSales;
  const inventoryReport = inventoryReportQuery.data?.reportInventory;
  const topProducts = topProductsQuery.data?.reportTopProducts ?? [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("admin.reports.title")}</h1>
          <p className="page-subtitle">{t("admin.reports.subtitle")}</p>
        </div>
      </div>

      <div className="page-section">
        {/* No admin.reports.dateFrom/dateTo keys yet — inline literals, see task summary. */}
        <div className="form-row" style={{ marginBottom: "var(--space-4)" }}>
          <Field label="From" htmlFor="report-from">
            <Input id="report-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To" htmlFor="report-to">
            <Input id="report-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>

        {salesQuery.loading ? (
          <LoadingBlock label={t("common.loading")} />
        ) : salesQuery.error ? (
          <ErrorBanner message={getErrorMessage(salesQuery.error)} onRetry={() => salesQuery.refetch()} />
        ) : sales ? (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">{t("admin.reports.orders")}</div>
              <div className="stat-value ltr-num">{sales.orders_count}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{t("admin.reports.revenue")}</div>
              <div className="stat-value ltr-num">
                {formatMoney({ amount_minor: sales.revenue_minor, currency }, "en-US")}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{t("admin.reports.aov")}</div>
              <div className="stat-value ltr-num">
                {formatMoney({ amount_minor: sales.aov_minor, currency }, "en-US")}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="page-section">
        {/* Reuses admin.inventory.title for the section heading; no dedicated SKUs/onHand/reserved/lowStock keys yet — inline literals, see task summary. */}
        <div className="section-heading">{t("admin.inventory.title")}</div>
        {inventoryReportQuery.loading ? (
          <LoadingBlock label={t("common.loading")} />
        ) : inventoryReportQuery.error ? (
          <ErrorBanner message={getErrorMessage(inventoryReportQuery.error)} onRetry={() => inventoryReportQuery.refetch()} />
        ) : inventoryReport ? (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">SKUs</div>
              <div className="stat-value ltr-num">{inventoryReport.skus}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total on hand</div>
              <div className="stat-value ltr-num">{inventoryReport.total_on_hand}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total reserved</div>
              <div className="stat-value ltr-num">{inventoryReport.total_reserved}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Low stock SKUs</div>
              <div className="stat-value ltr-num">{inventoryReport.low_stock}</div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="page-section">
        <div className="section-heading">{t("admin.reports.topProducts")}</div>
        {topProductsQuery.loading ? (
          <LoadingBlock label={t("common.loading")} />
        ) : topProductsQuery.error ? (
          <ErrorBanner message={getErrorMessage(topProductsQuery.error)} onRetry={() => topProductsQuery.refetch()} />
        ) : topProducts.length === 0 ? (
          // No admin.reports.empty.* keys yet — inline literals, see task summary.
          <EmptyState title="No sales yet" description="Top products will appear once orders come in." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              {/* No admin.reports.column.unitsSold key yet — inline literal, see task summary. */}
              <thead>
                <tr>
                  <th>{t("product.sku")}</th>
                  <th>{t("admin.catalog.productTitle")}</th>
                  <th className="num">Units sold</th>
                  <th className="num">{t("admin.reports.revenue")}</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.sku}>
                    <td className="table-mono">{p.sku}</td>
                    <td>{p.title}</td>
                    <td className="num">{p.units}</td>
                    <td className="num">{formatMoney({ amount_minor: p.revenue_minor, currency }, "en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
