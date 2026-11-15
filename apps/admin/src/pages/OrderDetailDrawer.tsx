import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CancelOrderDocument,
  FulfillOrderDocument,
  OrderDocument,
  OrdersDocument,
  RefundOrderDocument,
  type FulfillOrderInput,
  type RefundOrderInput,
} from "@mercato/graphql";
import { useAdminMutation, useAdminQuery } from "../lib/apolloHooks";
import { formatMoney } from "../lib/money";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage } from "../lib/errors";
import { Button, ErrorBanner, Field, Input, LoadingBlock, StatusBadge } from "../components/ui";
import { useT } from "../i18n/LocaleContext";

function money(amountMinor: number, currency: string): string {
  return formatMoney({ amount_minor: amountMinor, currency }, "en-US");
}

function FulfillForm({ orderId }: { orderId: string }) {
  // No admin.orders.tracking/carrier/markFulfilled keys yet — inline literals, see task summary.
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  const [fulfill, fulfillState] = useAdminMutation(FulfillOrderDocument, {
    refetchQueries: [{ query: OrderDocument, variables: { id: orderId } }, { query: OrdersDocument, variables: { limit: 100 } }],
    onCompleted: () => {
      setTrackingNumber("");
      setCarrier("");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input: FulfillOrderInput = {
      trackingNumber: trackingNumber || undefined,
      carrier: carrier || undefined,
    };
    void fulfill({ variables: { id: orderId, input } });
  }

  return (
    <form onSubmit={handleSubmit} className="stack">
      {fulfillState.error ? <ErrorBanner message={getErrorMessage(fulfillState.error)} /> : null}
      <div className="form-row">
        <Field label="Tracking number" htmlFor="fulfill-tracking">
          <Input
            id="fulfill-tracking"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="1Z999AA10123456784"
          />
        </Field>
        <Field label="Carrier" htmlFor="fulfill-carrier">
          <Input id="fulfill-carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="UPS" />
        </Field>
      </div>
      <div className="form-actions">
        <Button type="submit" variant="primary" size="sm" disabled={fulfillState.loading}>
          {/* No admin.orders.markFulfilled key yet — inline literal, see task summary. */}
          {fulfillState.loading ? "Fulfilling…" : "Mark fulfilled"}
        </Button>
      </div>
    </form>
  );
}

function RefundForm({ orderId }: { orderId: string }) {
  // No admin.orders.refundAmount/refundReason/issueRefund keys yet — inline literals, see task summary.
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const [refund, refundState] = useAdminMutation(RefundOrderDocument, {
    refetchQueries: [{ query: OrderDocument, variables: { id: orderId } }, { query: OrdersDocument, variables: { limit: 100 } }],
    onCompleted: () => {
      setAmount("");
      setReason("");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amountMinor = amount.trim() ? Math.round(Number.parseFloat(amount) * 100) : undefined;
    const input: RefundOrderInput = { amountMinor, reason: reason || undefined };
    void refund({ variables: { id: orderId, input } });
  }

  return (
    <form onSubmit={handleSubmit} className="stack">
      {refundState.error ? <ErrorBanner message={getErrorMessage(refundState.error)} /> : null}
      <div className="form-row">
        <Field label="Amount" htmlFor="refund-amount" hint="Leave blank to refund in full">
          <Input
            id="refund-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label="Reason" htmlFor="refund-reason">
          <Input id="refund-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional" />
        </Field>
      </div>
      <div className="form-actions">
        <Button type="submit" variant="danger" size="sm" disabled={refundState.loading}>
          {refundState.loading ? "Refunding…" : "Issue refund"}
        </Button>
      </div>
    </form>
  );
}

export function OrderDetailDrawer() {
  const { orderId } = useParams<{ orderId: string }>();
  const { storeId } = useAuth();
  const navigate = useNavigate();
  const t = useT();

  function close() {
    navigate("/orders");
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderQuery = useAdminQuery(OrderDocument, {
    variables: { id: orderId! },
    skip: !storeId || !orderId,
  });

  const [cancelOrder, cancelOrderState] = useAdminMutation(CancelOrderDocument, {
    variables: { id: orderId! },
    refetchQueries: [{ query: OrderDocument, variables: { id: orderId! } }, { query: OrdersDocument, variables: { limit: 100 } }],
  });

  function handleCancel() {
    // No admin.orders.confirmCancel key yet — inline literal, see task summary.
    if (window.confirm("Cancel this order? This cannot be undone.")) {
      void cancelOrder();
    }
  }

  const detail = orderQuery.data?.order;

  return (
    <>
      <div className="drawer-overlay" onClick={close} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Order detail">
        <div className="drawer-header">
          <div>
            <h2 className="mono" style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>
              {detail ? detail.order.number : "Order"}
            </h2>
            {detail ? <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>{detail.order.email}</p> : null}
          </div>
          {/* No common.close key yet — inline literal, see task summary. */}
          <Button variant="ghost" size="sm" onClick={close} aria-label="Close">
            Close
          </Button>
        </div>

        <div className="drawer-body">
          {orderQuery.loading ? (
            <LoadingBlock label={t("common.loading")} />
          ) : orderQuery.error ? (
            <ErrorBanner message={getErrorMessage(orderQuery.error)} onRetry={() => orderQuery.refetch()} />
          ) : detail ? (
            <>
              <section className="row" style={{ gap: "var(--space-2)" }}>
                <StatusBadge status={detail.order.financial_status} />
                <StatusBadge status={detail.order.fulfillment_status} />
                <StatusBadge status={detail.order.status} />
              </section>

              <section>
                {/* No admin.orders.summary/tax/shipping keys yet — inline literals, see task summary. */}
                <div className="section-heading">Summary</div>
                <div className="stack" style={{ gap: "var(--space-2)" }}>
                  <div className="row-between">
                    <span className="text-muted">{t("cart.subtotal")}</span>
                    <span className="ltr-num">{money(detail.order.subtotal_minor, detail.order.currency)}</span>
                  </div>
                  <div className="row-between">
                    <span className="text-muted">Tax</span>
                    <span className="ltr-num">{money(detail.order.tax_minor, detail.order.currency)}</span>
                  </div>
                  <div className="row-between">
                    <span className="text-muted">Shipping</span>
                    <span className="ltr-num">{money(detail.order.shipping_minor, detail.order.currency)}</span>
                  </div>
                  <div className="row-between" style={{ fontWeight: 700 }}>
                    <span>{t("cart.total")}</span>
                    <span className="ltr-num">{money(detail.order.total_minor, detail.order.currency)}</span>
                  </div>
                </div>
              </section>

              <section>
                {/* No admin.orders.lines/qty keys yet — inline literals, see task summary. */}
                <div className="section-heading">Lines</div>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t("product.sku")}</th>
                        <th>{t("admin.catalog.productTitle")}</th>
                        <th className="num">Qty</th>
                        <th className="num">{t("cart.total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.lines.map((line, i) => (
                        <tr key={`${line.sku}-${i}`}>
                          <td className="table-mono">{line.sku}</td>
                          <td>{line.title}</td>
                          <td className="num">{line.quantity}</td>
                          <td className="num">{money(line.total_minor, detail.order.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {detail.payments.length > 0 ? (
                <section>
                  {/* No admin.orders.payments key yet — inline literal, see task summary. */}
                  <div className="section-heading">Payments</div>
                  <div className="stack" style={{ gap: "var(--space-2)" }}>
                    {detail.payments.map((p, i) => (
                      <div className="row-between" key={i}>
                        <span className="text-muted">{p.provider}</span>
                        <span className="row" style={{ gap: "var(--space-2)" }}>
                          <StatusBadge status={p.status} />
                          <span className="ltr-num">{money(p.amount_minor, detail.order.currency)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {detail.fulfillments.length > 0 ? (
                <section>
                  {/* No admin.orders.fulfillments key yet — inline literal, see task summary. */}
                  <div className="section-heading">Fulfillments</div>
                  <div className="stack" style={{ gap: "var(--space-2)" }}>
                    {detail.fulfillments.map((f, i) => (
                      <div className="row-between" key={i}>
                        <span className="text-muted ltr-num">
                          {f.carrier ?? "—"} {f.tracking_number ? `· ${f.tracking_number}` : ""}
                        </span>
                        <StatusBadge status={f.status} />
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {detail.refunds.length > 0 ? (
                <section>
                  {/* No admin.orders.refunds/noReasonGiven keys yet — inline literals, see task summary. */}
                  <div className="section-heading">Refunds</div>
                  <div className="stack" style={{ gap: "var(--space-2)" }}>
                    {detail.refunds.map((r, i) => (
                      <div className="row-between" key={i}>
                        <span className="text-muted">{r.reason ?? "No reason given"}</span>
                        <span className="row" style={{ gap: "var(--space-2)" }}>
                          <StatusBadge status={r.status} />
                          <span className="ltr-num">{money(r.amount_minor, detail.order.currency)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section>
                {/* No admin.orders.fulfill key yet — inline literal, see task summary. */}
                <div className="section-heading">Fulfill</div>
                <FulfillForm orderId={detail.order.id} />
              </section>

              <section>
                {/* No admin.orders.refund key yet — inline literal, see task summary. */}
                <div className="section-heading">Refund</div>
                <RefundForm orderId={detail.order.id} />
              </section>

              <section>
                {/* No admin.orders.dangerZone/cancelOrder keys yet — inline literals, see task summary. */}
                <div className="section-heading">Danger zone</div>
                {cancelOrderState.error ? <ErrorBanner message={getErrorMessage(cancelOrderState.error)} /> : null}
                <Button variant="danger" size="sm" onClick={handleCancel} disabled={cancelOrderState.loading}>
                  {cancelOrderState.loading ? `${t("common.cancel")}…` : "Cancel order"}
                </Button>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
