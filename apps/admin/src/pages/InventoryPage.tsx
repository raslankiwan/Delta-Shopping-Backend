import { useState, type FormEvent } from "react";
import { InventoryAdjustDocument, InventoryDocument, type AdjustInventoryInput } from "@mercato/graphql";
import { useAdminMutation, useAdminQuery } from "../lib/apolloHooks";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage } from "../lib/errors";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, Input, LoadingBlock, Select } from "../components/ui";
import { useT } from "../i18n/LocaleContext";

// No admin.inventory.adjust* / variant / delta / reorderPoint keys yet — inline literals, see task summary.
function AdjustForm({ variants }: { variants: Array<{ id: string; sku: string }> }) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [delta, setDelta] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");

  const [adjust, adjustState] = useAdminMutation(InventoryAdjustDocument, {
    refetchQueries: [{ query: InventoryDocument }],
    onCompleted: () => {
      setDelta("");
      setReorderPoint("");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!variantId || !delta.trim()) return;
    const input: AdjustInventoryInput = {
      variantId,
      delta: Number.parseInt(delta, 10) || 0,
      reorderPoint: reorderPoint.trim() ? Number.parseInt(reorderPoint, 10) : undefined,
    };
    void adjust({ variables: { input } });
  }

  return (
    <Card title="Adjust stock">
      <form onSubmit={handleSubmit} className="stack">
        {adjustState.error ? <ErrorBanner message={getErrorMessage(adjustState.error)} /> : null}
        <div className="form-row">
          <Field label="Variant" htmlFor="adjust-variant">
            <Select id="adjust-variant" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.sku}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Delta" htmlFor="adjust-delta" hint="Positive to add, negative to remove">
            <Input
              id="adjust-delta"
              type="number"
              required
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="e.g. 10 or -5"
            />
          </Field>
          <Field label="Reorder point" htmlFor="adjust-reorder" hint="Optional">
            <Input
              id="adjust-reorder"
              type="number"
              min="0"
              value={reorderPoint}
              onChange={(e) => setReorderPoint(e.target.value)}
            />
          </Field>
        </div>
        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={adjustState.loading || !variantId}>
            {adjustState.loading ? "Adjusting…" : "Apply adjustment"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function InventoryPage() {
  const { storeId } = useAuth();
  const t = useT();

  const inventoryQuery = useAdminQuery(InventoryDocument, {
    skip: !storeId,
  });

  const rows = inventoryQuery.data?.inventory ?? [];
  const variants = Array.from(new Map(rows.map((r) => [r.variant_id, { id: r.variant_id, sku: r.sku }])).values());

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("admin.inventory.title")}</h1>
          {/* No admin.inventory.subtitle key yet — inline literal, see task summary. */}
          <p className="page-subtitle">Stock levels for the active store.</p>
        </div>
      </div>

      <div className="page-section">{storeId && variants.length > 0 ? <AdjustForm variants={variants} /> : null}</div>

      <div className="page-section">
        {inventoryQuery.loading ? (
          <LoadingBlock label={t("common.loading")} />
        ) : inventoryQuery.error ? (
          <ErrorBanner message={getErrorMessage(inventoryQuery.error)} onRetry={() => inventoryQuery.refetch()} />
        ) : rows.length === 0 ? (
          // No admin.inventory.empty.* keys yet — inline literals, see task summary.
          <EmptyState title="No inventory records" description="Add variants to products to start tracking stock." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                {/* No admin.inventory.column.* / lowStock / inStock keys yet — inline literals, see task summary. */}
                <tr>
                  <th>{t("product.sku")}</th>
                  <th className="num">On hand</th>
                  <th className="num">Reserved</th>
                  <th className="num">Available</th>
                  <th className="num">Reorder point</th>
                  <th>{t("admin.catalog.status")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.variant_id}-${row.location_id}`}>
                    <td className="table-mono">{row.sku}</td>
                    <td className="num">{row.on_hand}</td>
                    <td className="num">{row.reserved}</td>
                    <td className="num">{row.available}</td>
                    <td className="num">{row.reorder_point}</td>
                    <td>
                      {row.available <= row.reorder_point ? (
                        <Badge tone="warning">Low stock</Badge>
                      ) : (
                        <Badge tone="success">In stock</Badge>
                      )}
                    </td>
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
