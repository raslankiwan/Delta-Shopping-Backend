"use client";
import { useState } from "react";
import { displayMoney } from "@delta/domain/commerce";
import { Button } from "@delta/ui";
import { api } from "./api";
import { Status, EmptyState } from "./components";
export default function OrderView({
  orders,
  manage = false,
  run,
  reload,
}: {
  orders: any[];
  manage?: boolean;
  run: (fn: () => Promise<void>) => Promise<void>;
  reload: () => void;
}) {
  const [open, setOpen] = useState("");
  const [downloads, setDownloads] = useState<any[]>([]);
  if (!orders.length)
    return (
      <EmptyState title="No orders yet">
        <p>Your orders and delivery updates will appear here.</p>
      </EmptyState>
    );
  return (
    <div className="orders-list">
      {orders.map((order) => (
        <article className="order-card" key={order._id}>
          <button
            className="order-heading"
            onClick={() => {
              setOpen(open === order._id ? "" : order._id);
              setDownloads([]);
            }}
          >
            <div>
              <strong>{order.number}</strong>
              <span>
                {order.storeName} ·{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <Status>{order.paymentStatus}</Status>
            <Status>{order.fulfillment}</Status>
            <strong>{displayMoney(order.total, order.currency)}</strong>
          </button>
          {open === order._id && (
            <div className="order-body">
              <div className="order-lines">
                {order.lines.map((line: any) => (
                  <div key={`${line.productId}-${line.variantId}`}>
                    <span>
                      {line.name}
                      <small>
                        {line.variant} × {line.quantity}
                      </small>
                    </span>
                    <strong>
                      {displayMoney(
                        line.unitPrice * line.quantity,
                        order.currency,
                      )}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="order-summary">
                <span>
                  Subtotal {displayMoney(order.subtotal, order.currency)}
                </span>
                <span>
                  Discount −{displayMoney(order.discount, order.currency)}
                </span>
                <span>
                  Delivery {displayMoney(order.shipping, order.currency)}
                </span>
                <span>Tax {displayMoney(order.tax, order.currency)}</span>
                <strong>
                  Total {displayMoney(order.total, order.currency)}
                </strong>
              </div>
              <div className="order-info">
                <div>
                  <h4>
                    {order.delivery === "pickup"
                      ? "Store pickup"
                      : "Delivery address"}
                  </h4>
                  <p>
                    {order.address.name}
                    <br />
                    {order.address.street}, {order.address.city}
                    <br />
                    {order.address.country} · {order.address.phone}
                  </p>
                  {order.notes && <p>Note: {order.notes}</p>}
                </div>
                <div>
                  <h4>Tracking & updates</h4>
                  {order.tracking && (
                    <p>
                      {order.carrier} · {order.tracking}
                    </p>
                  )}
                  {order.history.map((h: any, i: number) => (
                    <p className="timeline-event" key={i}>
                      <i />
                      {h.event}
                      <small>{new Date(h.at).toLocaleString()}</small>
                    </p>
                  ))}
                </div>
              </div>
              {!manage && (
                <div className="detail-actions">
                  <Button
                    className="secondary small"
                    onClick={() =>
                      run(async () => {
                        await api(`orders/${order._id}`);
                        reload();
                      })
                    }
                  >
                    Refresh status
                  </Button>
                  {["unfulfilled", "processing"].includes(order.fulfillment) &&
                    order.paymentStatus !== "paid" && (
                      <Button
                        className="secondary small"
                        onClick={() =>
                          run(async () => {
                            await api(`orders/${order._id}/cancel`, "POST", {});
                            reload();
                          })
                        }
                      >
                        Cancel order
                      </Button>
                    )}
                  {order.paymentMethod === "card" &&
                    ["creating", "pending"].includes(order.paymentStatus) && (
                      <Button
                        className="small"
                        onClick={() =>
                          run(async () => {
                            const d = await api(
                              `orders/${order._id}/pay`,
                              "POST",
                              {},
                            );
                            if (d.order.paymentUrl)
                              window.location.assign(d.order.paymentUrl);
                          })
                        }
                      >
                        Continue payment
                      </Button>
                    )}
                  {order.paymentStatus === "paid" &&
                    order.lines.some((l: any) => l.type === "digital") && (
                      <Button
                        className="small"
                        onClick={() =>
                          run(async () =>
                            setDownloads(
                              (await api(`orders/${order._id}/downloads`))
                                .downloads,
                            ),
                          )
                        }
                      >
                        Get downloads
                      </Button>
                    )}
                  <Button
                    className="secondary small"
                    onClick={() => window.print()}
                  >
                    Print receipt
                  </Button>
                </div>
              )}
              {downloads.map((d) => (
                <p key={d.url}>
                  <a
                    className="text-button"
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download {d.name} ↗
                  </a>
                </p>
              ))}
              {manage && (
                <div className="management-order">
                  <form
                    className="inline-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      run(async () => {
                        await api(
                          `orders/${order._id}/fulfill`,
                          "POST",
                          Object.fromEntries(f),
                        );
                        reload();
                      });
                    }}
                  >
                    <select name="fulfillment" defaultValue="processing">
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered / completed</option>
                    </select>
                    <input name="carrier" placeholder="Carrier" />
                    <input name="tracking" placeholder="Tracking reference" />
                    <Button className="small">Update fulfillment</Button>
                  </form>
                  <div className="detail-actions">
                    {order.paymentMethod === "cod" &&
                      order.fulfillment === "delivered" &&
                      order.paymentStatus === "unpaid" && (
                        <Button
                          className="small"
                          onClick={() =>
                            run(async () => {
                              await api(
                                `orders/${order._id}/collect`,
                                "POST",
                                {},
                              );
                              reload();
                            })
                          }
                        >
                          Confirm cash collected
                        </Button>
                      )}
                    {["unfulfilled", "processing"].includes(
                      order.fulfillment,
                    ) &&
                      order.paymentStatus !== "paid" && (
                        <Button
                          className="secondary small"
                          onClick={() =>
                            run(async () => {
                              await api(
                                `orders/${order._id}/cancel`,
                                "POST",
                                {},
                              );
                              reload();
                            })
                          }
                        >
                          Cancel order
                        </Button>
                      )}
                    {order.paymentStatus === "paid" && (
                      <Button
                        className="secondary small"
                        onClick={() =>
                          run(async () => {
                            if (
                              order.paymentMethod === "cod" &&
                              !window.confirm(
                                "Confirm that the full cash amount has already been returned to the customer.",
                              )
                            )
                              return;
                            await api(`orders/${order._id}/refund`, "POST", {
                              confirmation: "CASH_RETURNED",
                            });
                            reload();
                          })
                        }
                      >
                        {order.paymentMethod === "cod"
                          ? "Record cash refund"
                          : "Refund full payment"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {order.returnRequest ? (
                <div className="return-box">
                  <h4>Return: {order.returnRequest.status}</h4>
                  <p>{order.returnRequest.reason}</p>
                  {manage && (
                    <div className="detail-actions">
                      {(order.returnRequest.status === "requested"
                        ? ["approved", "rejected"]
                        : order.returnRequest.status === "approved"
                          ? ["received"]
                          : []
                      ).map((status) => (
                        <Button
                          key={status}
                          className="secondary small"
                          onClick={() =>
                            run(async () => {
                              await api(
                                `orders/${order._id}/return-status`,
                                "POST",
                                { status },
                              );
                              reload();
                            })
                          }
                        >
                          {status === "received"
                            ? "Confirm return received"
                            : status}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                !manage &&
                order.fulfillment === "delivered" && (
                  <form
                    className="reply-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      run(async () => {
                        await api(`orders/${order._id}/return`, "POST", {
                          reason: f.get("reason"),
                        });
                        reload();
                      });
                    }}
                  >
                    <input
                      name="reason"
                      required
                      minLength={5}
                      maxLength={2000}
                      placeholder="Reason for return"
                    />
                    <Button className="secondary small">Request return</Button>
                  </form>
                )
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
