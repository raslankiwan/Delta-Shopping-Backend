"use client";
import { useEffect, useState, useCallback, type FormEvent } from "react";
import {
  ArrowUpRight,
  Plus,
  Package,
  ShoppingBag,
  BarChart3,
  Users,
  Settings,
  Tags,
  Ticket,
  Copy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  commerceCurrencies,
  minorAmount,
  displayMoney,
  fractionDigits,
} from "@delta/domain/commerce";
import { Button, Field } from "@delta/ui";
import { api, fields } from "./api";
import { Dialog, Status, EmptyState } from "./components";
import type { Store, Item } from "./types";
import OrderView from "./order-view";
type Run = (fn: () => Promise<void>) => Promise<void>;
export function AdminPanel({
  stores,
  run,
  reload,
}: {
  stores: Store[];
  run: Run;
  reload: () => void;
}) {
  const [create, setCreate] = useState(false),
    [invite, setInvite] = useState(""),
    [overview, setOverview] = useState<any>(null),
    [logs, setLogs] = useState<any[]>([]),
    [users, setUsers] = useState<any[]>([]),
    [paymentStore, setPaymentStore] = useState<Store | null>(null),
    [paymentConfig, setPaymentConfig] = useState<any>({});
  const close = useCallback(() => setCreate(false), []);
  useEffect(() => {
    run(async () => {
      setOverview(await api("admin/overview"));
      setLogs((await api("admin/audit")).events);
      setUsers((await api("admin/users")).users);
    });
  }, [stores]);
  return (
    <>
      <div className="section-heading">
        <div>
          <div className="eyebrow muted">PLATFORM CONTROL</div>
          <h2>Your commerce network</h2>
          <p>Create stores, invite owners, and oversee the platform.</p>
        </div>
        <Button onClick={() => setCreate(true)}>
          <Plus size={16} />
          Create store
        </Button>
      </div>
      <div className="stats">
        {[
          ["Stores", overview?.stores || 0],
          ["Customers", overview?.customers || 0],
          ["Orders", overview?.orders || 0],
          [
            "Online payments",
            overview?.paymentsConfigured ? "Configured" : "Setup needed",
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong className={label === "Online payments" ? "stat-text" : ""}>
              {value}
            </strong>
          </div>
        ))}
      </div>
      {invite && (
        <div className="invite-result">
          <strong>Owner invitation created</strong>
          <p>
            Share this private link with the intended owner. It expires in 7
            days and requires their matching account email.
          </p>
          <input value={invite} readOnly aria-label="Invitation link" />
          <Button
            className="small"
            onClick={() => navigator.clipboard.writeText(invite)}
          >
            Copy invitation
            <Copy size={14} />
          </Button>
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Store</th>
              <th>Country / currency</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store._id}>
                <td>
                  <strong>{store.name}</strong>
                  <small>/s/{store.slug}</small>
                </td>
                <td>
                  {store.country} · {store.currency}
                </td>
                <td>
                  <Status>{store.status}</Status>
                </td>
                <td>
                  <div className="inline-actions">
                    {["draft", "active", "suspended"]
                      .filter((s) => s !== store.status)
                      .map((status) => (
                        <Button
                          key={status}
                          className="secondary small"
                          onClick={() =>
                            run(async () => {
                              await api(`stores/${store._id}/status`, "POST", {
                                status,
                              });
                              reload();
                            })
                          }
                        >
                          {status === "active"
                            ? "Publish"
                            : status === "suspended"
                              ? "Suspend"
                              : "Unpublish"}
                        </Button>
                      ))}
                    <Button
                      className="secondary small"
                      onClick={() => {
                        const email = window.prompt("Owner email");
                        if (email)
                          run(async () => {
                            const d = await api(
                              `stores/${store._id}/team`,
                              "POST",
                              { email, role: "owner" },
                            );
                            setInvite(d.inviteUrl);
                          });
                      }}
                    >
                      Invite owner
                    </Button>
                    <Button
                      className="secondary small"
                      onClick={() =>
                        run(async () => {
                          setPaymentConfig(
                            await api(`stores/${store._id}/payments`),
                          );
                          setPaymentStore(store);
                        })
                      }
                    >
                      Payments
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!stores.length && <EmptyState title="Create your first store" />}
      </div>
      <div className="setup-card">
        <h3>Payments for Palestine</h3>
        <p>
          Bank of Palestine merchant onboarding and an approved payment
          connector are required for cards. Cash on delivery is available per
          store. Configure merchant settlement per store; customer payments are
          never treated as platform wallet balances.
        </p>
        <a
          className="text-button"
          target="_blank"
          rel="noreferrer"
          href="https://www.bankofpalestine.com/en/business/electronic-services/payment-gateway"
        >
          Merchant onboarding information
          <ArrowUpRight size={16} />
        </a>
      </div>
      <h3>Platform accounts</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {users.map((account) => (
              <tr key={account._id}>
                <td>{account.name}</td>
                <td>{account.email}</td>
                <td>{account.role}</td>
                <td>
                  {account.role !== "admin" && (
                    <Button
                      className="secondary small"
                      onClick={() =>
                        run(async () => {
                          await api(`admin/users/${account._id}`, "PATCH", {
                            disabled: !account.disabled,
                          });
                          reload();
                        })
                      }
                    >
                      {account.disabled ? "Restore access" : "Suspend"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>Recent activity</h3>
      <div className="activity-list">
        {logs.slice(0, 20).map((log) => (
          <div key={log._id}>
            <span>{log.action}</span>
            <small>{new Date(log.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
      {paymentStore && (
        <Dialog
          title={`Payments · ${paymentStore.name}`}
          onClose={() => setPaymentStore(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = fields(e.currentTarget);
              run(async () => {
                await api(`stores/${paymentStore._id}/payments`, "POST", {
                  merchantRef: f.merchantRef,
                  enabled: f.enabled === "on",
                });
                setPaymentStore(null);
                reload();
              });
            }}
          >
            <Field
              label="Bank-approved merchant reference"
              name="merchantRef"
              defaultValue={paymentConfig.merchantRef}
              required
            />
            <label className="check-field">
              <input
                name="enabled"
                type="checkbox"
                defaultChecked={paymentConfig.enabled}
                disabled={!paymentConfig.gatewayConfigured}
              />
              Enable online card payments
            </label>
            <p className="form-hint">
              {paymentConfig.gatewayConfigured
                ? "Assign the approved merchant settlement reference for this store. Do not enter bank API keys here."
                : "Configure the approved bank connector and webhook secrets in server settings first. Cards remain disabled until then."}
            </p>
            <Button>Save payment settings</Button>
          </form>
        </Dialog>
      )}
      {create && (
        <Dialog title="Create a store" onClose={close}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = fields(form);
              run(async () => {
                const result = await api("stores", "POST", data);
                setInvite(result.inviteUrl);
                setCreate(false);
                reload();
              });
            }}
          >
            <Field
              label="Store name"
              name="name"
              required
              minLength={2}
              maxLength={100}
            />
            <Field
              label="Store address (slug)"
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="olive-and-co"
              minLength={3}
              maxLength={60}
            />
            <Field
              label="Owner email"
              name="ownerEmail"
              type="email"
              required
            />
            <div className="form-row">
              <Field
                label="Country code"
                name="country"
                defaultValue="PS"
                pattern="[A-Z]{2}"
                required
              />
              <label className="field">
                <span>Store currency</span>
                <select name="currency" defaultValue="ILS">
                  {commerceCurrencies.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="form-hint">
              New stores start as drafts. Share the invitation, let the owner
              prepare the catalog, then publish here.
            </p>
            <Button>
              Create store & invitation
              <ArrowUpRight size={16} />
            </Button>
          </form>
        </Dialog>
      )}
    </>
  );
}
const sections = [
  ["overview", "Overview", BarChart3],
  ["products", "Products", Package],
  ["categories", "Categories", Tags],
  ["orders", "Orders", ShoppingBag],
  ["coupons", "Discounts", Ticket],
  ["customers", "Customers", Users],
  ["team", "Team", Users],
  ["settings", "Settings", Settings],
] as const;
export default function Dashboard({
  stores,
  run,
  reloadContext,
}: {
  stores: Store[];
  run: Run;
  reloadContext: () => void;
}) {
  const [storeId, setStoreId] = useState(stores[0]?._id || ""),
    [section, setSection] = useState("overview"),
    [data, setData] = useState<any>({}),
    [revision, setRevision] = useState(0),
    [editing, setEditing] = useState<Item | null | undefined>(undefined),
    [categories, setCategories] = useState<any[]>([]),
    [invite, setInvite] = useState("");
  const store = stores.find((s) => s._id === storeId) || stores[0];
  const refresh = () => setRevision((n) => n + 1);
  const close = useCallback(() => setEditing(undefined), []);
  useEffect(() => {
    if (!store) return;
    let alive = true;
    run(async () => {
      const endpoint = section === "overview" ? "analytics" : section;
      const response =
        section === "settings"
          ? {}
          : await api(`stores/${store._id}/${endpoint}`);
      const cats = await api(`stores/${store._id}/categories`);
      if (alive) {
        setData(response);
        setCategories(cats.categories);
      }
    });
    return () => {
      alive = false;
    };
  }, [store?._id, section, revision, stores]);
  if (!store)
    return (
      <EmptyState title="Your store workspace is ready">
        <p>
          A platform administrator must invite you to a store. Sign in with the
          invited email and open your invitation link.
        </p>
      </EmptyState>
    );
  return (
    <div className="workspace">
      <aside className="workspace-sidebar">
        <div className="workspace-label">YOUR WORKSPACE</div>
        <select
          aria-label="Choose store"
          value={store._id}
          onChange={(e) => {
            setStoreId(e.target.value);
            setData({});
          }}
        >
          {stores.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <span className="workspace-store-status">
          <Status>{store.status}</Status>
          <a href={`/s/${store.slug}`} target="_blank">
            View store
            <ExternalLink size={12} />
          </a>
        </span>
        <nav>
          {sections.map(([key, label, Icon]) => (
            <button
              key={key}
              className={section === key ? "selected" : ""}
              onClick={() => {
                setSection(key);
                setData({});
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="workspace-foot">
          <span className="live-dot" /> {store.country} · {store.currency}
        </div>
      </aside>
      <section className="workspace-content">
        <div className="section-heading">
          <div>
            <div className="eyebrow muted">{store.name}</div>
            <h2>{sections.find((s) => s[0] === section)?.[1]}</h2>
            <p>
              {section === "overview"
                ? "A clear view of your business."
                : section === "products"
                  ? "Your catalog, your way."
                  : section === "orders"
                    ? "Every order, from checkout to delivery."
                    : "Built around your store."}
            </p>
          </div>
          {section === "products" && (
            <Button onClick={() => setEditing(null)}>
              <Plus size={16} />
              Add product
            </Button>
          )}
          {section === "orders" && (
            <a
              className="button secondary small"
              href={`/api/commerce/stores/${store._id}/export`}
            >
              Export CSV
            </a>
          )}
        </div>
        {section === "overview" && (
          <>
            <div className="stats">
              <div>
                <span>Products</span>
                <strong>{data.products ?? "—"}</strong>
              </div>
              <div>
                <span>Orders</span>
                <strong>
                  {data.orders?.reduce(
                    (s: number, o: any) => s + o.orders,
                    0,
                  ) || 0}
                </strong>
              </div>
              <div>
                <span>Paid revenue</span>
                <strong className="stat-text">
                  {displayMoney(
                    data.orders?.reduce(
                      (s: number, o: any) => s + o.revenue,
                      0,
                    ) || 0,
                    store.currency,
                  )}
                </strong>
              </div>
              <div>
                <span>Awaiting payment</span>
                <strong>
                  {data.orders?.reduce(
                    (s: number, o: any) => s + o.pending,
                    0,
                  ) || 0}
                </strong>
              </div>
            </div>
            <div className="setup-card">
              <h3>Make it yours.</h3>
              <p>
                Add categories, create your products, and set delivery and
                return policies. Your storefront works for physical goods,
                digital products, and services.
              </p>
              <a className="text-button" href={`/s/${store.slug}`}>
                Visit storefront
                <ArrowUpRight size={16} />
              </a>
            </div>
            <h3>Low-stock alerts</h3>
            {data.lowStock?.length ? (
              <div className="activity-list">
                {data.lowStock.map((p: any) => (
                  <div key={p._id}>
                    <strong>{p.name}</strong>
                    <span>
                      {p.variants
                        .filter((v: any) => v.stock < 5)
                        .map((v: any) => `${v.name}: ${v.stock} left`)
                        .join(" · ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No products are running low.</p>
            )}
          </>
        )}
        {section === "products" && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.products?.map((p: Item) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.name}</strong>
                      <small>
                        {p.type} · {p.variants.length} variant(s)
                      </small>
                    </td>
                    <td>
                      {displayMoney(
                        Math.min(...p.variants.map((v) => v.price)),
                        store.currency,
                      )}
                    </td>
                    <td>
                      {p.trackStock
                        ? p.variants.reduce((n, v) => n + v.stock, 0)
                        : "Not tracked"}
                    </td>
                    <td>
                      <Status>{p.status}</Status>
                    </td>
                    <td>
                      <Button
                        className="secondary small"
                        onClick={() => setEditing(p)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.products?.length && (
              <EmptyState title="Your next bestseller starts here">
                <Button onClick={() => setEditing(null)}>
                  Add your first product
                </Button>
              </EmptyState>
            )}
          </div>
        )}
        {section === "categories" && (
          <>
            <form
              className="panel-form inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                run(async () => {
                  await api(
                    `stores/${store._id}/categories`,
                    "POST",
                    fields(form),
                  );
                  form.reset();
                  refresh();
                });
              }}
            >
              <Field
                label="Category name"
                name="name"
                required
                maxLength={80}
              />
              <Field
                label="URL slug"
                name="slug"
                required
                minLength={3}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
              />
              <label className="field">
                <span>Parent category</span>
                <select name="parentId">
                  <option value="">Top level</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button className="small">Add category</Button>
            </form>
            <div className="activity-list">
              {categories.map((c) => (
                <div key={c._id}>
                  <span>
                    {c.parentId ? "↳ " : ""}
                    {c.name}
                    <small>/{c.slug}</small>
                  </span>
                  <Button
                    className="secondary small"
                    onClick={() => {
                      const name = window.prompt("Category name", c.name);
                      if (name?.trim())
                        run(async () => {
                          await api(
                            `stores/${store._id}/categories/${c._id}`,
                            "PATCH",
                            { name },
                          );
                          refresh();
                        });
                    }}
                  >
                    Rename
                  </Button>{" "}
                  <Button
                    className="secondary small"
                    onClick={() =>
                      run(async () => {
                        await api(
                          `stores/${store._id}/categories/${c._id}`,
                          "DELETE",
                        );
                        refresh();
                      })
                    }
                  >
                    <Trash2 size={13} />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
        {section === "orders" && (
          <OrderView
            orders={data.orders || []}
            manage
            run={run}
            reload={refresh}
          />
        )}
        {section === "customers" && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Orders</th>
                  <th>Paid total</th>
                </tr>
              </thead>
              <tbody>
                {data.customers?.map((c: any) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.orders}</td>
                    <td>{displayMoney(c.paid, store.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {section === "coupons" && (
          <>
            <form
              className="panel-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const f = fields(form);
                run(async () => {
                  await api(`stores/${store._id}/coupons`, "POST", {
                    code: String(f.code).toUpperCase(),
                    kind: f.kind,
                    value:
                      f.kind === "percentage"
                        ? Math.round(Number(f.value) * 100)
                        : minorAmount(Number(f.value), store.currency),
                    minimum: minorAmount(
                      Number(f.minimum || 0),
                      store.currency,
                    ),
                    limit: Number(f.limit),
                    expiresAt: new Date(String(f.expiresAt)).toISOString(),
                    active: true,
                  });
                  form.reset();
                  refresh();
                });
              }}
            >
              <div className="form-row">
                <Field
                  label="Discount code"
                  name="code"
                  required
                  minLength={3}
                  maxLength={30}
                />
                <label className="field">
                  <span>Discount type</span>
                  <select name="kind">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">
                      Fixed amount ({store.currency})
                    </option>
                  </select>
                </label>
                <Field
                  label="Value"
                  name="value"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-row">
                <Field
                  label="Minimum order"
                  name="minimum"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                />
                <Field
                  label="Usage limit"
                  name="limit"
                  type="number"
                  min="1"
                  defaultValue="100"
                />
                <Field
                  label="Expires"
                  name="expiresAt"
                  type="datetime-local"
                  required
                />
              </div>
              <Button className="small">Create discount</Button>
            </form>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Used / limit</th>
                    <th>Expiry</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.coupons?.map((c: any) => (
                    <tr key={c._id}>
                      <td>{c.code}</td>
                      <td>
                        {c.kind === "percentage"
                          ? `${c.value / 100}%`
                          : displayMoney(c.value, store.currency)}
                      </td>
                      <td>
                        {c.used} / {c.limit}
                      </td>
                      <td>{new Date(c.expiresAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          className="secondary small"
                          onClick={() =>
                            run(async () => {
                              await api(
                                `stores/${store._id}/coupons/${c._id}`,
                                "PATCH",
                                { active: !c.active },
                              );
                              refresh();
                            })
                          }
                        >
                          {c.active ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {section === "team" && (
          <>
            <form
              className="inline-form panel-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = fields(e.currentTarget);
                run(async () => {
                  const result = await api(`stores/${store._id}/team`, "POST", {
                    ...f,
                    role: "staff",
                  });
                  setInvite(result.inviteUrl);
                  refresh();
                });
              }}
            >
              <Field
                label="Staff member email"
                name="email"
                type="email"
                required
              />
              <Button className="small">Create invitation</Button>
            </form>
            {invite && (
              <div className="invite-result">
                <input aria-label="Staff invitation" readOnly value={invite} />
                <Button
                  className="small"
                  onClick={() => navigator.clipboard.writeText(invite)}
                >
                  Copy private link
                </Button>
              </div>
            )}
            <div className="activity-list">
              {data.members?.map((m: any) => (
                <div key={m._id}>
                  <span>
                    <strong>{m.name}</strong>
                    <small>
                      {m.email} · {m.role}
                    </small>
                  </span>
                  {m.role !== "owner" && (
                    <Button
                      className="secondary small"
                      onClick={() =>
                        run(async () => {
                          await api(
                            `stores/${store._id}/team/${m._id}`,
                            "DELETE",
                          );
                          refresh();
                        })
                      }
                    >
                      Remove access
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="form-hint">
              Staff can manage products and orders. Owners control settings,
              team invitations, and refunds. Owner invitations are created by
              platform administrators.
            </p>
          </>
        )}
        {section === "settings" && (
          <StoreSettings
            key={store._id}
            store={store}
            run={run}
            reload={reloadContext}
          />
        )}
      </section>
      {editing !== undefined && (
        <Dialog
          title={editing ? "Edit product" : "Add a product"}
          onClose={close}
          wide
        >
          <ProductEditor
            item={editing}
            store={store}
            categories={categories}
            onSave={async (data) => {
              await api(
                `stores/${store._id}/products${editing ? "/" + editing._id : ""}`,
                editing ? "PATCH" : "POST",
                data,
              );
              setEditing(undefined);
              refresh();
            }}
            run={run}
          />
        </Dialog>
      )}
    </div>
  );
}
function StoreSettings({
  store,
  run,
  reload,
}: {
  store: Store;
  run: Run;
  reload: () => void;
}) {
  return (
    <form
      className="panel-form settings-form"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = fields(form);
        const check = (name: string) =>
          (form.elements.namedItem(name) as HTMLInputElement).checked;
        run(async () => {
          await api(`stores/${store._id}`, "PATCH", {
            name: f.name,
            description: f.description,
            country: f.country,
            currency: f.currency,
            accent: f.accent,
            logo: f.logo,
            phone: f.phone,
            contactEmail: f.contactEmail,
            address: f.address,
            deliveryCountries: String(f.deliveryCountries)
              .split(",")
              .map((s) => s.trim().toUpperCase())
              .filter(Boolean),
            shippingFee: minorAmount(Number(f.shippingFee), String(f.currency)),
            freeShippingAbove: minorAmount(
              Number(f.freeShippingAbove),
              String(f.currency),
            ),
            taxBps: Math.round(Number(f.tax) * 100),
            returnsDays: Number(f.returnsDays),
            codEnabled: check("codEnabled"),
            pickupEnabled: check("pickupEnabled"),
            shippingPolicy: f.shippingPolicy,
            returnPolicy: f.returnPolicy,
            privacyPolicy: f.privacyPolicy,
          });
          reload();
        });
      }}
    >
      <h3>Store identity</h3>
      <div className="form-row">
        <Field label="Name" name="name" defaultValue={store.name} required />
        <Field
          label="Brand color"
          name="accent"
          type="color"
          defaultValue={store.accent}
        />
      </div>
      <Field
        label="Logo URL"
        name="logo"
        type="url"
        defaultValue={store.logo}
      />
      <label className="field">
        <span>About your store</span>
        <textarea
          name="description"
          defaultValue={store.description}
          maxLength={2000}
        />
      </label>
      <div className="form-row">
        <Field
          label="Country code"
          name="country"
          defaultValue={store.country}
          required
          pattern="[A-Z]{2}"
        />
        <label className="field">
          <span>Currency (locked after first order)</span>
          <select name="currency" defaultValue={store.currency}>
            {commerceCurrencies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-row">
        <Field
          label="Contact email"
          name="contactEmail"
          type="email"
          defaultValue={store.contactEmail}
        />
        <Field label="Phone" name="phone" defaultValue={store.phone} />
      </div>
      <Field
        label="Pickup / business address"
        name="address"
        defaultValue={store.address}
      />
      <h3>Delivery & tax</h3>
      <div className="form-row">
        <Field
          label={`Shipping fee (${store.currency})`}
          name="shippingFee"
          type="number"
          min="0"
          step="any"
          defaultValue={
            store.shippingFee / 10 ** fractionDigits(store.currency)
          }
        />
        <Field
          label="Free shipping above (0 = off)"
          name="freeShippingAbove"
          type="number"
          min="0"
          step="any"
          defaultValue={
            store.freeShippingAbove / 10 ** fractionDigits(store.currency)
          }
        />
      </div>
      <div className="form-row">
        <Field
          label="Tax rate (%)"
          name="tax"
          type="number"
          min="0"
          max="100"
          step="0.01"
          defaultValue={store.taxBps / 100}
        />
        <Field
          label="Return window (days, 0 = no returns)"
          name="returnsDays"
          type="number"
          min="0"
          max="365"
          defaultValue={store.returnsDays}
        />
      </div>
      <Field
        label="Delivery countries (comma-separated ISO codes)"
        name="deliveryCountries"
        defaultValue={store.deliveryCountries.join(", ")}
        required
      />
      <label className="check-field">
        <input
          type="checkbox"
          name="codEnabled"
          defaultChecked={store.codEnabled}
        />
        Accept cash on delivery for physical goods
      </label>
      <label className="check-field">
        <input
          type="checkbox"
          name="pickupEnabled"
          defaultChecked={store.pickupEnabled}
        />
        Allow store pickup
      </label>
      <h3>Store policies</h3>
      {(["shippingPolicy", "returnPolicy", "privacyPolicy"] as const).map(
        (key) => (
          <label className="field" key={key}>
            <span>
              {key === "shippingPolicy"
                ? "Shipping policy"
                : key === "returnPolicy"
                  ? "Return policy"
                  : "Privacy policy"}
            </span>
            <textarea name={key} defaultValue={store[key]} maxLength={5000} />
          </label>
        ),
      )}
      <p className="form-hint">
        Tax is a store-configured percentage, exclusive of shipping. Have the
        store’s accountant confirm the applicable rate and policies.
      </p>
      <Button>Save store settings</Button>
    </form>
  );
}
function ProductEditor({
  item,
  store,
  categories,
  onSave,
  run,
}: {
  item: Item | null;
  store: Store;
  categories: any[];
  onSave: (data: any) => Promise<void>;
  run: Run;
}) {
  const scale = 10 ** fractionDigits(store.currency);
  const [variants, setVariants] = useState(
    item?.variants.map((v) => ({ ...v, price: v.price / scale })) || [
      {
        id: "default",
        name: "Default",
        sku: "",
        price: 0,
        stock: 0,
        attributes: {},
      },
    ],
  );
  const [type, setType] = useState(item?.type || "physical");
  const [attributes, setAttributes] = useState(
    Object.entries(item?.attributes || {}),
  );
  const [images, setImages] = useState(item?.images.join("\n") || "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = fields(e.currentTarget);
        run(async () => {
          await onSave({
            name: f.name,
            description: f.description,
            categoryId: f.categoryId,
            status: f.status,
            type,
            images: images
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            variants: variants.map((v) => ({
              ...v,
              price: minorAmount(Number(v.price), store.currency),
              stock: Number(v.stock),
            })),
            trackStock: f.trackStock === "on",
            featured: f.featured === "on",
            attributes: Object.fromEntries(
              attributes.filter(([k]) => k.trim()),
            ),
            deliveryUrl: type === "digital" ? f.deliveryUrl || "" : "",
            expectedVersion: item?.version || 0,
          });
        });
      }}
    >
      <Field
        label="Product name"
        name="name"
        required
        minLength={2}
        maxLength={150}
        defaultValue={item?.name}
      />
      <label className="field">
        <span>Description</span>
        <textarea
          name="description"
          required
          minLength={5}
          maxLength={10000}
          defaultValue={item?.description}
        />
      </label>
      <div className="form-row">
        <label className="field">
          <span>Product type</span>
          <select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="physical">Physical product</option>
            <option value="digital">Digital download</option>
            <option value="service">Service</option>
          </select>
        </label>
        <label className="field">
          <span>Category</span>
          <select name="categoryId" defaultValue={item?.categoryId || ""}>
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Visibility</span>
          <select name="status" defaultValue={item?.status || "draft"}>
            <option value="draft">Draft</option>
            <option value="active">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
      <label className="field">
        <span>Product images (one HTTPS URL per line, up to 8)</span>
        <textarea
          value={images}
          onChange={(e) => setImages(e.target.value)}
          placeholder="https://…"
        />
      </label>
      <label className="field">
        <span>Or upload an image (JPEG, PNG, WebP; up to 2 MB)</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            run(async () => {
              const data = new FormData();
              data.set("file", file);
              const response = await fetch(
                `/api/commerce/media?storeId=${store._id}`,
                { method: "POST", body: data },
              );
              const result = await response.json();
              if (!response.ok) throw new Error(result.error);
              setImages((s) => [s, result.url].filter(Boolean).join("\n"));
            });
          }}
        />
      </label>
      {type === "digital" && (
        <Field
          label="Private delivery URL (shown only after verified payment)"
          name="deliveryUrl"
          type="url"
          defaultValue={item?.deliveryUrl}
          required
          placeholder="https://…"
        />
      )}
      <h3>Variants, pricing & inventory</h3>
      <p className="form-hint">
        Use variants for sizes, colors, weights, packages, or service tiers.
        Stock is the quantity available to sell, after existing reservations.
      </p>
      <div className="variant-labels">
        <span>Option name</span>
        <span>SKU</span>
        <span>Price ({store.currency})</span>
        <span>Stock</span>
        <span />
      </div>
      {variants.map((v, i) => (
        <div className="variant-row" key={v.id}>
          {(["name", "sku", "price", "stock"] as const).map((key) => (
            <input
              key={key}
              aria-label={`Variant ${i + 1} ${key}`}
              value={v[key]}
              type={key === "price" || key === "stock" ? "number" : "text"}
              min={key === "price" ? "0.001" : "0"}
              step={key === "price" ? "any" : "1"}
              required
              maxLength={key === "name" ? 120 : 100}
              onChange={(e) =>
                setVariants((list) =>
                  list.map((x, j) =>
                    j === i ? { ...x, [key]: e.target.value } : x,
                  ),
                )
              }
            />
          ))}
          <button
            type="button"
            aria-label="Remove variant"
            disabled={variants.length === 1}
            onClick={() =>
              setVariants((list) => list.filter((_, j) => j !== i))
            }
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <Button
        type="button"
        className="secondary small"
        onClick={() =>
          setVariants((list) => [
            ...list,
            {
              id: crypto.randomUUID().slice(0, 12),
              name: "",
              sku: "",
              price: 0,
              stock: 0,
              attributes: {},
            },
          ])
        }
      >
        <Plus size={14} />
        Add variant
      </Button>
      <label className="check-field">
        <input
          name="trackStock"
          type="checkbox"
          defaultChecked={item?.trackStock ?? true}
        />
        Track inventory and prevent overselling
      </label>
      <label className="check-field">
        <input
          name="featured"
          type="checkbox"
          defaultChecked={item?.featured}
        />
        Feature this product
      </label>
      <h3>Custom product details</h3>
      {attributes.map(([k, v], i) => (
        <div className="inline-form" key={i}>
          <input
            aria-label={`Attribute ${i + 1} name`}
            value={k}
            maxLength={60}
            placeholder="Material, brand, dimensions…"
            onChange={(e) =>
              setAttributes((a) =>
                a.map((x, j) => (i === j ? [e.target.value, x[1]] : x)),
              )
            }
          />
          <input
            aria-label={`Attribute ${i + 1} value`}
            value={v}
            maxLength={200}
            placeholder="Value"
            onChange={(e) =>
              setAttributes((a) =>
                a.map((x, j) => (i === j ? [x[0], e.target.value] : x)),
              )
            }
          />
          <button
            type="button"
            onClick={() => setAttributes((a) => a.filter((_, j) => j !== i))}
            aria-label="Remove attribute"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <Button
        type="button"
        className="secondary small"
        onClick={() => setAttributes((a) => [...a, ["", ""]])}
      >
        Add detail
      </Button>
      <div className="form-submit">
        <Button>
          Save product
          <ArrowUpRight size={16} />
        </Button>
      </div>
    </form>
  );
}
