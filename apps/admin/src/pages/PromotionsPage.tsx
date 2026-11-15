import { useState, type FormEvent } from "react";
import {
  CreateDiscountCodeDocument,
  DiscountCodesDocument,
  type CreateDiscountCodeInputType,
} from "@mercato/graphql";
import { useAdminMutation, useAdminQuery } from "../lib/apolloHooks";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage } from "../lib/errors";
import { Button, Card, EmptyState, ErrorBanner, Field, Input, LoadingBlock, Select, StatusBadge } from "../components/ui";
import { useT } from "../i18n/LocaleContext";

type DiscountType = "percentage" | "fixed" | "free_shipping";

function describeValue(type: string, value: number): string {
  if (type === "percentage") return `${value}%`;
  if (type === "fixed") return value.toFixed(2);
  return "Free shipping";
}

function NewDiscountForm() {
  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("percentage");
  const [value, setValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const [createDiscount, createDiscountState] = useAdminMutation(CreateDiscountCodeDocument, {
    refetchQueries: [{ query: DiscountCodesDocument }],
    onCompleted: () => {
      setCode("");
      setValue("");
      setUsageLimit("");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    if (type !== "free_shipping" && !value.trim()) return;
    const input: CreateDiscountCodeInputType = {
      code: code.toUpperCase(),
      type,
      value: type === "free_shipping" ? undefined : Number.parseFloat(value),
      usageLimit: usageLimit.trim() ? Number.parseInt(usageLimit, 10) : undefined,
    };
    void createDiscount({ variables: { input } });
  }

  return (
    <Card title="New discount code">
      <form onSubmit={handleSubmit} className="stack">
        {createDiscountState.error ? <ErrorBanner message={getErrorMessage(createDiscountState.error)} /> : null}
        <div className="form-row">
          <Field label="Code" htmlFor="discount-code">
            <Input
              id="discount-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SUMMER20"
              style={{ textTransform: "uppercase" }}
            />
          </Field>
          <Field label="Type" htmlFor="discount-type">
            <Select id="discount-type" value={type} onChange={(e) => setType(e.target.value as DiscountType)}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
              <option value="free_shipping">Free shipping</option>
            </Select>
          </Field>
          {type !== "free_shipping" ? (
            <Field
              label={type === "percentage" ? "Value (%)" : "Value ($)"}
              htmlFor="discount-value"
            >
              <Input
                id="discount-value"
                type="number"
                min="0"
                step={type === "percentage" ? "1" : "0.01"}
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </Field>
          ) : null}
          <Field label="Usage limit" htmlFor="discount-usage" hint="Optional">
            <Input
              id="discount-usage"
              type="number"
              min="1"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
            />
          </Field>
        </div>
        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={createDiscountState.loading}>
            {createDiscountState.loading ? "Creating…" : "Create discount"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function PromotionsPage() {
  const { storeId } = useAuth();
  const t = useT();

  const discountsQuery = useAdminQuery(DiscountCodesDocument, {
    skip: !storeId,
  });

  const discounts = discountsQuery.data?.discountCodes ?? [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("admin.promotions.title")}</h1>
          {/* No admin.promotions.subtitle key yet — inline literal, see task summary. */}
          <p className="page-subtitle">Discount codes customers can apply at checkout.</p>
        </div>
      </div>

      <div className="page-section">{storeId ? <NewDiscountForm /> : null}</div>

      <div className="page-section">
        {discountsQuery.loading ? (
          <LoadingBlock label={t("common.loading")} />
        ) : discountsQuery.error ? (
          <ErrorBanner message={getErrorMessage(discountsQuery.error)} onRetry={() => discountsQuery.refetch()} />
        ) : discounts.length === 0 ? (
          // No admin.promotions.empty.* keys yet — inline literals, see task summary.
          <EmptyState title="No discount codes yet" description="Create one using the form above." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              {/* No admin.promotions.column.* keys yet — inline literals, see task summary. */}
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th className="num">Value</th>
                  <th className="num">Usage</th>
                  <th>{t("admin.catalog.status")}</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((discount) => {
                  const action = discount.action as { type: string; value: number };
                  return (
                    <tr key={discount.id}>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        {discount.code}
                      </td>
                      <td>{action.type.replaceAll("_", " ")}</td>
                      <td className="num">{describeValue(action.type, action.value)}</td>
                      <td className="num">
                        {discount.used_count}
                        {discount.usage_limit != null ? ` / ${discount.usage_limit}` : ""}
                      </td>
                      <td>
                        <StatusBadge status={discount.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
