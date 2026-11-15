import { Outlet, useNavigate } from "react-router-dom";
import { OrdersDocument, type OrdersQuery } from "@mercato/graphql";
import { useAdminQuery } from "../lib/apolloHooks";
import { formatMoney } from "../lib/money";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage } from "../lib/errors";
import { EmptyState, ErrorBanner, LoadingBlock, StatusBadge } from "../components/ui";
import { useT } from "../i18n/LocaleContext";

type OrderListItem = OrdersQuery["orders"][number];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function OrderRow({ order }: { order: OrderListItem }) {
  const navigate = useNavigate();

  return (
    <tr className="clickable" onClick={() => navigate(`/orders/${order.id}`)}>
      <td className="mono">{order.number}</td>
      <td>{order.email}</td>
      <td className="num">{formatMoney({ amount_minor: order.total_minor, currency: order.currency }, "en-US")}</td>
      <td>
        <StatusBadge status={order.financial_status} />
      </td>
      <td>
        <StatusBadge status={order.fulfillment_status} />
      </td>
      <td className="text-muted">{formatDate(order.placed_at)}</td>
    </tr>
  );
}

export function OrdersPage() {
  const { storeId } = useAuth();
  const t = useT();

  const ordersQuery = useAdminQuery(OrdersDocument, {
    variables: { limit: 100 },
    skip: !storeId,
  });

  const orders = ordersQuery.data?.orders ?? [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("admin.orders.title")}</h1>
          {/* No admin.orders.subtitle key yet — inline literal, see task summary. */}
          <p className="page-subtitle">Click an order to view details, fulfill, refund, or cancel it.</p>
        </div>
      </div>

      {ordersQuery.loading ? (
        <LoadingBlock label={t("common.loading")} />
      ) : ordersQuery.error ? (
        <ErrorBanner message={getErrorMessage(ordersQuery.error)} onRetry={() => ordersQuery.refetch()} />
      ) : orders.length === 0 ? (
        // No admin.orders.empty.* keys yet — inline literals, see task summary.
        <EmptyState title="No orders yet" description="Orders placed through checkout will show up here." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              {/* No admin.orders.column.* keys yet — inline literals, see task summary. */}
              <tr>
                <th>Number</th>
                <th>{t("checkout.email")}</th>
                <th className="num">{t("cart.total")}</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Outlet />
    </div>
  );
}
