"use client";
import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Heart,
  ShoppingBag,
  Package,
  Store as StoreIcon,
  LayoutDashboard,
  ShieldCheck,
  UserRound,
  LogOut,
  Globe,
  X,
  ChevronDown,
  Check,
  MapPin,
  Menu,
  Bell,
} from "lucide-react";
import type { User } from "@delta/domain";
import { displayMoney } from "@delta/domain/commerce";
import { Button, Field } from "@delta/ui";
import { api, fields } from "./api";
import type { Store, Item, Cart } from "./types";
import { Dialog, ProductCard, EmptyState, Status } from "./components";
import Dashboard, { AdminPanel } from "./dashboard";
import Checkout from "./checkout";
import ResetPassword from "./reset";
import OrderView from "./order-view";
type View =
  | "discover"
  | "dashboard"
  | "admin"
  | "orders"
  | "cart"
  | "wishlist"
  | "account"
  | "invite"
  | "reset";
const words: Record<string, string> = {
  Discover: "اكتشف",
  "My stores": "متاجري",
  Orders: "الطلبات",
  Wishlist: "المفضلة",
  Cart: "السلة",
  "Sign in": "تسجيل الدخول",
  "Create account": "إنشاء حساب",
  "Your everyday, reimagined.": "كل ما تحتاجه، بتجربة جديدة.",
  "Every store.": "كل متجر.",
  "One place.": "في مكان واحد.",
  "Independent stores. Thoughtful products. A better way to shop local.":
    "متاجر مستقلة ومنتجات مميزة. طريقة أفضل للتسوق محلياً.",
  "Explore stores": "استكشف المتاجر",
  "Made for your next discovery.": "صُنع لاكتشافك القادم.",
  "Stores worth knowing.": "متاجر تستحق أن تعرفها.",
  "Discover something that feels like you.": "اكتشف ما يناسبك.",
  "Search stores...": "ابحث عن متجر...",
  "Search products...": "ابحث عن منتج...",
  "All products": "جميع المنتجات",
  "Add to cart": "أضف إلى السلة",
  Account: "الحساب",
  "Platform admin": "إدارة المنصة",
  "Made for local. Built for more.": "للمحلي اليوم، وللمزيد غداً.",
  "View store": "تصفح المتجر",
  "Recently added": "أضيف حديثاً",
  "Price: low to high": "السعر: من الأقل للأعلى",
  "Your bag": "حقيبتك",
  "Secure checkout": "إتمام الطلب",
  "Welcome back": "مرحباً بعودتك",
  "Join Delta": "انضم إلى دلتا",
  "Sign out": "تسجيل الخروج",
  Notifications: "الإشعارات",
  "Something for every kind of store.": "منصة تناسب كل أنواع المتاجر.",
};
export default function CommerceApp({
  initialView = "discover",
  storeSlug,
}: {
  initialView?: View;
  storeSlug?: string;
}) {
  const [view, setView] = useState<View>(initialView),
    [context, setContext] = useState<any>({
      user: null,
      stores: [],
      memberships: [],
    }),
    [stores, setStores] = useState<Store[]>([]),
    [storeData, setStoreData] = useState<any>(null),
    [query, setQuery] = useState(""),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [sort, setSort] = useState("recent"),
    [page, setPage] = useState(1),
    [revision, setRevision] = useState(0),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [auth, setAuth] = useState<"login" | "register" | null>(null),
    [selected, setSelected] = useState<any>(null),
    [variant, setVariant] = useState(""),
    [quantity, setQuantity] = useState(1),
    [carts, setCarts] = useState<Cart[]>([]),
    [orders, setOrders] = useState<any[]>([]),
    [favorites, setFavorites] = useState<Item[]>([]),
    [checkout, setCheckout] = useState<{ cart: Cart; store: Store } | null>(
      null,
    ),
    [notifications, setNotifications] = useState<any[] | null>(null),
    [profile, setProfile] = useState<any>(null),
    [lang, setLang] = useState("en"),
    [menu, setMenu] = useState(false);
  const user = context.user as User | null;
  const t = (s: string) => (lang === "ar" ? words[s] || s : s);
  const reload = () => setRevision((n) => n + 1);
  const run = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, []);
  const closeAuth = useCallback(() => setAuth(null), []),
    closeProduct = useCallback(() => setSelected(null), []),
    closeCheckout = useCallback(() => setCheckout(null), []),
    closeNotices = useCallback(() => setNotifications(null), []);
  useEffect(() => {
    const saved = localStorage.getItem("delta-language");
    if (saved === "ar") setLang(saved);
  }, []);
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("delta-language", lang);
  }, [lang]);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    run(async () => {
      const [c, s] = await Promise.all([api("context"), api("stores")]);
      if (!alive) return;
      setContext(c);
      setStores(s.stores);
      if (c.user) {
        const b = await api("cart");
        if (alive) setCarts(b.carts);
      }
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [revision]);
  useEffect(() => {
    if (!storeSlug) return;
    let alive = true;
    setLoading(true);
    run(async () => {
      const data = await api(
        `storefront/${storeSlug}?${new URLSearchParams({ q: search, category, sort, page: String(page) })}`,
      );
      if (alive) setStoreData(data);
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [storeSlug, search, category, sort, page, revision]);
  useEffect(() => {
    if (!user) return;
    run(async () => {
      if (view === "orders") {
        const id = new URLSearchParams(location.search).get("order");
        if (id) await api(`orders/${id}`);
        setOrders((await api("orders")).orders);
      }
      if (view === "wishlist") setFavorites((await api("favorites")).products);
      if (view === "account") setProfile((await api("profile")).profile);
    });
  }, [view, user?._id, revision]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(id);
  }, [notice]);
  function go(v: View) {
    if (v === view) reload();
    setView(v);
    setMenu(false);
    setSelected(null);
  }
  function needUser() {
    if (!user) {
      setAuth("login");
      return false;
    }
    return true;
  }
  async function openProduct(item: Item) {
    await run(async () => {
      const data = await api(`products/${item._id}`);
      setSelected(data);
      setVariant(data.product.variants[0].id);
      setQuantity(1);
    });
  }
  async function saveFavorite(item: Item) {
    if (!needUser()) return;
    await run(async () => {
      await api(`favorites/${item._id}`, "POST", {});
      setNotice("Saved to wishlist");
    });
  }
  async function addToCart() {
    if (!selected) return;
    if (selected.store.demo) {
      setNotice("Preview products are not for sale");
      return;
    }
    if (!needUser()) return;
    await run(async () => {
      const p = selected.product;
      const old = carts.find((c) => c.storeId === p.storeId) || {
        storeId: p.storeId,
        lines: [],
      };
      const existing = old.lines.find(
        (l) => l.productId === p._id && l.variantId === variant,
      );
      const next = {
        ...old,
        lines: existing
          ? old.lines.map((l) =>
              l === existing ? { ...l, quantity: l.quantity + quantity } : l,
            )
          : [...old.lines, { productId: p._id, variantId: variant, quantity }],
      };
      await api("cart", "POST", next);
      setCarts((list) => [
        ...list.filter((c) => c.storeId !== p.storeId),
        next,
      ]);
      setNotice("Added to your bag");
    });
  }
  async function updateCart(
    cart: Cart,
    productId: string,
    variantId: string,
    n: number,
  ) {
    await run(async () => {
      const next = {
        ...cart,
        lines: cart.lines
          .map((l) =>
            l.productId === productId && l.variantId === variantId
              ? { ...l, quantity: n }
              : l,
          )
          .filter((l) => l.quantity > 0),
      };
      await api("cart", "POST", next);
      setCarts((all) => [
        ...all.filter((c) => c.storeId !== cart.storeId),
        next,
      ]);
    });
  }
  const store = storeData?.store as Store | undefined;
  const activeVariant = selected?.product.variants.find(
    (v: any) => v.id === variant,
  );
  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div
      className="commerce-app"
      style={
        store ? ({ "--green": store.accent } as React.CSSProperties) : undefined
      }
    >
      <div className="topline">
        <span>
          {store ? store.name : "LOCAL STORES. LIMITLESS POSSIBILITIES."}
        </span>
        <span>
          {t("Made for local. Built for more.")}
          <ArrowUpRight size={12} />
        </span>
      </div>
      <header className="header">
        <a href="/" className="brand" aria-label="Delta home">
          <span className="brand-mark">Δ</span>delta
          <span className="brand-dot">.</span>
        </a>
        <nav className={menu ? "nav open" : "nav"}>
          <a
            className={`nav-link ${view === "discover" ? "active" : ""}`}
            href="/"
          >
            {t("Discover")}
          </a>
          {user && (
            <>
              <button
                className={
                  view === "dashboard" ? "nav-link active" : "nav-link"
                }
                onClick={() => go("dashboard")}
              >
                {t("My stores")}
              </button>
              <button
                className={view === "orders" ? "nav-link active" : "nav-link"}
                onClick={() => go("orders")}
              >
                {t("Orders")}
              </button>
            </>
          )}
          {user?.role === "admin" && (
            <button
              className={view === "admin" ? "nav-link active" : "nav-link"}
              onClick={() => go("admin")}
            >
              {t("Platform admin")}
            </button>
          )}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button language"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            aria-label="Change language"
          >
            <Globe size={17} />
            <span>{lang === "en" ? "العربية" : "EN"}</span>
          </button>
          <button
            className="icon-button"
            aria-label={t("Wishlist")}
            onClick={() => {
              go("wishlist");
              if (!user) setAuth("login");
            }}
          >
            <Heart size={18} />
          </button>
          <button
            className="icon-button bag-icon"
            aria-label={t("Cart")}
            onClick={() => {
              go("cart");
              if (!user) setAuth("login");
            }}
          >
            <ShoppingBag size={19} />
            {carts.reduce(
              (n, c) => n + c.lines.reduce((m, l) => m + l.quantity, 0),
              0,
            ) > 0 && (
              <span>{carts.reduce((n, c) => n + c.lines.length, 0)}</span>
            )}
          </button>
          {user ? (
            <button
              className="avatar"
              title={user.name}
              onClick={() => go("account")}
            >
              {user.name[0].toUpperCase()}
            </button>
          ) : (
            <button className="sign-in" onClick={() => setAuth("login")}>
              {t("Sign in")}
            </button>
          )}
          <button
            className="icon-button menu-button"
            aria-label="Menu"
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
        </div>
      </header>
      {error && (
        <div className="alert commerce-alert" role="alert">
          <span>{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
        </div>
      )}
      {view === "discover" && !storeSlug && (
        <>
          <section className="hero commerce-hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="live-dot" />
                {t("Your everyday, reimagined.")}
              </div>
              <h1>
                {t("Every store.")}
                <br />
                <em>{t("One place.")}</em>
              </h1>
              <p>
                {t(
                  "Independent stores. Thoughtful products. A better way to shop local.",
                )}
              </p>
              <div className="hero-buttons">
                <Button
                  onClick={() =>
                    document
                      .getElementById("stores")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  {t("Explore stores")}
                  <ArrowUpRight size={17} />
                </Button>
                <span className="hero-local">
                  <MapPin size={14} />
                  Palestine, and beyond.
                </span>
              </div>
              <div className="commerce-promises">
                <span>
                  <ShieldCheck size={15} />
                  Store by store
                </span>
                <span>
                  <Package size={15} />
                  Every kind of product
                </span>
                <span>
                  <Heart size={15} />
                  Keep it local
                </span>
              </div>
            </div>
            <div className="commerce-hero-art">
              <div className="commerce-orbit" />
              <div className="art-store-card">
                <div className="art-store-logo">o.</div>
                <div>
                  <span>THE NEXT CHAPTER</span>
                  <strong>
                    Your store.
                    <br />
                    Your story.
                  </strong>
                </div>
                <span className="art-card-footer">
                  A little discovery goes a long way.
                  <ArrowUpRight size={17} />
                </span>
              </div>
              <div className="art-order-note">
                <Check size={15} />
                <div>
                  Something good is on its way.
                  <small>From your favorite local store</small>
                </div>
              </div>
              <div className="art-product-note">
                <div className="drawn-bag">
                  <ShoppingBag size={65} strokeWidth={1} />
                </div>
                <span>Everyday, a little better.</span>
              </div>
              <div className="commerce-sticker">
                LOCAL FINDS
                <br />
                <ArrowUpRight size={23} />
                <br />
                BIG POSSIBILITIES
              </div>
            </div>
          </section>
        </>
      )}
      {view === "discover" && store && (
        <section className="store-hero">
          <div className="store-identity">
            <div className="store-logo">
              {store.logo ? (
                <img src={store.logo} alt="" />
              ) : (
                store.name.slice(0, 2)
              )}
            </div>
            <div>
              <div className="eyebrow muted">
                INDEPENDENT STORE · {store.country}
              </div>
              <h1>{store.name}</h1>
              <p>{store.description}</p>
            </div>
          </div>
          {store.demo && (
            <p className="demo-notice">
              Preview store · These products demonstrate the platform and are
              not for sale.
            </p>
          )}
          <div className="store-facts">
            <span>
              <Package size={16} />
              Physical, digital & more
            </span>
            <span>
              <MapPin size={16} />
              {store.address || store.country}
            </span>
            <span>
              <ShieldCheck size={16} />
              {store.returnsDays}-day return window
            </span>
          </div>
        </section>
      )}
      <main
        className={`main commerce-main ${view === "dashboard" ? "dashboard-main" : ""}`}
        id="stores"
      >
        {view === "discover" && !storeSlug && (
          <>
            <div className="section-heading">
              <div>
                <div className="eyebrow muted">THE STORE DIRECTORY</div>
                <h2>
                  {t("Stores worth knowing.")}
                  <span className="count">{stores.length}</span>
                </h2>
                <p>{t("Discover something that feels like you.")}</p>
              </div>
              <div className="search directory-search">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("Search stores...")}
                  aria-label="Search stores"
                />
              </div>
            </div>
            {loading ? (
              <div className="product-grid">
                {[1, 2, 3].map((n) => (
                  <div className="skeleton" key={n} />
                ))}
              </div>
            ) : filteredStores.length ? (
              <div className="stores-grid">
                {filteredStores.map((s, i) => (
                  <a className="store-card" href={`/s/${s.slug}`} key={s._id}>
                    <div
                      className={`store-card-art art-${i % 4}`}
                      style={
                        { "--store-accent": s.accent } as React.CSSProperties
                      }
                    >
                      <span className="store-category">
                        {s.demo
                          ? "PREVIEW STORE"
                          : s.country + " · INDEPENDENT STORE"}
                      </span>
                      <div className="store-monogram">
                        {s.logo ? (
                          <img src={s.logo} alt="" />
                        ) : (
                          s.name.slice(0, 2)
                        )}
                      </div>
                      <ArrowUpRight size={24} />
                    </div>
                    <div className="store-card-info">
                      <h3>{s.name}</h3>
                      <p>{s.description || "Something worth discovering."}</p>
                      <span>
                        {t("View store")}
                        <ArrowRight size={15} />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState title="New stores are on their way">
                <p>
                  Our store directory is invitation-only. Check back as stores
                  join the community.
                </p>
              </EmptyState>
            )}
            <section className="sell-banner">
              <div className="banner-icon">Δ</div>
              <div>
                <div className="eyebrow">A PLATFORM THAT GROWS WITH YOU</div>
                <h2>{t("Something for every kind of store.")}</h2>
                <p>
                  Products, categories, variants, inventory, orders. All in one
                  place.
                </p>
              </div>
              <Button
                className="light"
                onClick={() => {
                  if (!needUser()) return;
                  go("dashboard");
                }}
              >
                {t("My stores")}
                <ArrowUpRight size={17} />
              </Button>
            </section>
          </>
        )}
        {view === "discover" && storeSlug && (
          <>
            {!storeData && !loading ? (
              <EmptyState title="Store unavailable">
                <a href="/" className="text-button">
                  Explore other stores
                </a>
              </EmptyState>
            ) : (
              <>
                <div className="section-heading">
                  <div>
                    <div className="eyebrow muted">THE COLLECTION</div>
                    <h2>
                      {t("Made for your next discovery.")}
                      <span className="count">{storeData?.total || 0}</span>
                    </h2>
                  </div>
                </div>
                <div className="filters">
                  <div className="search">
                    <Search size={18} />
                    <input
                      placeholder={t("Search products...")}
                      aria-label="Search products"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <label className="sort">
                    <select
                      aria-label="Sort products"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="recent">{t("Recently added")}</option>
                      <option value="price">{t("Price: low to high")}</option>
                    </select>
                    <ChevronDown size={14} />
                  </label>
                </div>
                <div className="categories">
                  <button
                    className={!category ? "category active" : "category"}
                    onClick={() => setCategory("")}
                  >
                    {t("All products")}
                  </button>
                  {storeData?.categories.map((c: any) => (
                    <button
                      key={c._id}
                      className={
                        category === c._id ? "category active" : "category"
                      }
                      onClick={() => setCategory(c._id)}
                    >
                      {c.parentId ? "↳ " : ""}
                      {c.name}
                    </button>
                  ))}
                </div>
                {loading ? (
                  <div className="product-grid">
                    {[1, 2, 3, 4].map((n) => (
                      <div className="skeleton" key={n} />
                    ))}
                  </div>
                ) : storeData?.products.length ? (
                  <div className="product-grid">
                    {storeData.products.map((p: Item) => (
                      <ProductCard
                        item={p}
                        store={store!}
                        key={p._id}
                        onOpen={() => openProduct(p)}
                        onSave={() => saveFavorite(p)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No products found">
                    <p>Try another category or search.</p>
                  </EmptyState>
                )}
                {storeData?.total > 24 && (
                  <div className="pagination">
                    <Button
                      className="secondary small"
                      disabled={page === 1}
                      onClick={() => setPage((n) => n - 1)}
                    >
                      Previous
                    </Button>
                    <span>
                      {page} / {Math.ceil(storeData.total / 24)}
                    </span>
                    <Button
                      className="secondary small"
                      disabled={page * 24 >= storeData.total}
                      onClick={() => setPage((n) => n + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
                {store && (
                  <div className="store-policies">
                    <details>
                      <summary>Delivery & pickup</summary>
                      <p>
                        {store.shippingPolicy ||
                          "Contact the store for delivery information."}
                      </p>
                      <p>
                        Delivery countries: {store.deliveryCountries.join(", ")}
                      </p>
                      {store.pickupEnabled && (
                        <p>
                          Pickup: {store.address || "Arrange with the store"}
                        </p>
                      )}
                    </details>
                    <details>
                      <summary>Returns & refunds</summary>
                      <p>
                        {store.returnPolicy ||
                          `${store.returnsDays}-day return request window after delivery.`}
                      </p>
                    </details>
                    <details>
                      <summary>Contact & privacy</summary>
                      <p>
                        {store.contactEmail} · {store.phone}
                      </p>
                      <p>
                        {store.privacyPolicy ||
                          "Contact the store about its privacy practices."}
                      </p>
                    </details>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {view === "reset" ? (
          <ResetPassword run={run} />
        ) : view !== "discover" && !user ? (
          <EmptyState title="Make yourself at home">
            <Button onClick={() => setAuth("login")}>{t("Sign in")}</Button>
            <p>Sign in to manage your orders, wishlist, and stores.</p>
          </EmptyState>
        ) : view === "dashboard" ? (
          <Dashboard stores={context.stores} run={run} reloadContext={reload} />
        ) : view === "admin" ? (
          user?.role === "admin" ? (
            <AdminPanel stores={context.stores} run={run} reload={reload} />
          ) : (
            <EmptyState title="Platform administrator access required" />
          )
        ) : view === "orders" ? (
          <>
            <div className="section-heading">
              <div>
                <div className="eyebrow muted">YOUR PURCHASES</div>
                <h2>{t("Orders")}</h2>
                <p>Follow every order from checkout to your doorstep.</p>
              </div>
              <Button className="secondary small" onClick={reload}>
                Refresh
              </Button>
            </div>
            <OrderView orders={orders} run={run} reload={reload} />
          </>
        ) : view === "wishlist" ? (
          <>
            <div className="section-heading">
              <div>
                <div className="eyebrow muted">KEEP THE GOOD FINDS</div>
                <h2>{t("Wishlist")}</h2>
              </div>
            </div>
            {favorites.length ? (
              <div className="product-grid">
                {favorites.map((p) => (
                  <div key={p._id}>
                    <ProductCard
                      item={p}
                      store={p.store!}
                      onOpen={() => openProduct(p)}
                      onSave={() =>
                        run(async () => {
                          await api(`favorites/${p._id}`, "DELETE");
                          reload();
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Save something you love">
                <p>Tap the heart on any product to keep it here.</p>
              </EmptyState>
            )}
          </>
        ) : view === "cart" ? (
          <>
            <div className="section-heading">
              <div>
                <div className="eyebrow muted">GOOD THINGS IN STORE</div>
                <h2>{t("Your bag")}</h2>
                <p>
                  Each store has its own checkout, delivery settings, and
                  payment methods.
                </p>
              </div>
            </div>
            {carts.some((c) => c.lines.length) ? (
              carts
                .filter((c) => c.lines.length)
                .map((c) => (
                  <CartGroup
                    key={c.storeId}
                    cart={c}
                    stores={stores}
                    run={run}
                    onUpdate={updateCart}
                    onCheckout={(s) => setCheckout({ cart: c, store: s })}
                  />
                ))
            ) : (
              <EmptyState title="Your bag is waiting for a good find">
                <a className="button secondary" href="/">
                  {t("Explore stores")}
                </a>
              </EmptyState>
            )}
          </>
        ) : view === "account" && profile ? (
          <>
            <div className="section-heading">
              <div>
                <div className="eyebrow muted">MAKE YOURSELF AT HOME</div>
                <h2>{t("Account")}</h2>
                <p>{user?.email}</p>
              </div>
              <Button
                className="secondary small"
                onClick={() =>
                  run(async () => {
                    await api("auth/logout", "POST", {});
                    setContext({ user: null, stores: [] });
                    setCarts([]);
                    setView("discover");
                    reload();
                  })
                }
              >
                <LogOut size={15} />
                {t("Sign out")}
              </Button>
            </div>
            <div className="account-grid">
              <form
                className="panel-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = fields(e.currentTarget);
                  run(async () => {
                    await api("profile", "PATCH", {
                      name: f.profileName,
                      addresses: [
                        {
                          name: f.name,
                          phone: f.phone,
                          country: f.country,
                          city: f.city,
                          street: f.street,
                          postalCode: f.postalCode || "",
                        },
                      ],
                    });
                    setNotice("Profile saved");
                    reload();
                  });
                }}
              >
                <h3>Your profile & default address</h3>
                <Field
                  label="Display name"
                  name="profileName"
                  required
                  minLength={2}
                  defaultValue={profile.name}
                />
                <Field
                  label="Recipient name"
                  name="name"
                  required
                  minLength={2}
                  defaultValue={profile.addresses?.[0]?.name || profile.name}
                />
                <Field
                  label="Phone"
                  name="phone"
                  required
                  minLength={7}
                  defaultValue={profile.addresses?.[0]?.phone}
                />
                <div className="form-row">
                  <Field
                    label="Country code"
                    name="country"
                    defaultValue={profile.addresses?.[0]?.country || "PS"}
                    required
                    pattern="[A-Z]{2}"
                  />
                  <Field
                    label="City"
                    name="city"
                    required
                    minLength={2}
                    defaultValue={profile.addresses?.[0]?.city}
                  />
                </div>
                <Field
                  label="Street address"
                  name="street"
                  required
                  minLength={3}
                  defaultValue={profile.addresses?.[0]?.street}
                />
                <Field
                  label="Postal code"
                  name="postalCode"
                  defaultValue={profile.addresses?.[0]?.postalCode}
                />
                <Button>Save profile</Button>
              </form>
              <div className="setup-card">
                <h3>{t("Notifications")}</h3>
                <p>Stay up to date on your orders and store activity.</p>
                <Button
                  className="secondary small"
                  onClick={() =>
                    run(async () => {
                      const r = await fetch("/api/notifications");
                      const d = await r.json();
                      if (!r.ok) throw new Error(d.error);
                      setNotifications(d.notifications);
                    })
                  }
                >
                  Open notifications
                  <Bell size={15} />
                </Button>
              </div>
            </div>
          </>
        ) : view === "invite" ? (
          <div className="invitation-accept">
            <ShieldCheck size={38} />
            <h2>Your store invitation</h2>
            <p>
              Signed in as <strong>{user?.email}</strong>. Accept using the
              email address specified by your platform administrator.
            </p>
            <Button
              onClick={() =>
                run(async () => {
                  const token = new URLSearchParams(location.search).get(
                    "token",
                  );
                  await api("invitations", "POST", { token });
                  history.replaceState({}, "", location.pathname);
                  setNotice("Invitation accepted");
                  setView("dashboard");
                  reload();
                })
              }
            >
              Accept invitation
              <ArrowUpRight size={17} />
            </Button>
          </div>
        ) : null}
      </main>
      <footer>
        <a className="brand" href="/">
          <span className="brand-mark">Δ</span>delta
          <span className="brand-dot">.</span>
        </a>
        <p>{t("Made for local. Built for more.")}</p>
        <span>© {new Date().getFullYear()} Delta Commerce</span>
      </footer>
      {auth && (
        <Dialog
          title={t(auth === "login" ? "Welcome back" : "Join Delta")}
          onClose={closeAuth}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = fields(e.currentTarget);
              run(async () => {
                await api(`auth/${auth}`, "POST", data);
                setAuth(null);
                reload();
              });
            }}
          >
            {auth === "register" && (
              <Field
                label="Name"
                name="name"
                required
                minLength={2}
                autoComplete="name"
              />
            )}
            <Field
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
            <Field
              label="Password (at least 10 characters)"
              name="password"
              type="password"
              required
              minLength={10}
              maxLength={128}
              autoComplete={
                auth === "login" ? "current-password" : "new-password"
              }
            />
            <Button disabled={busy}>
              {t(auth === "login" ? "Sign in" : "Create account")}
              <ArrowRight size={16} />
            </Button>
          </form>
          <button
            className="auth-switch"
            onClick={() => setAuth(auth === "login" ? "register" : "login")}
          >
            {t(auth === "login" ? "Create account" : "Sign in")}
          </button>
          <a className="auth-switch" href="/reset-password">
            Forgot your password?
          </a>
          <p className="form-hint">
            Store ownership is by invitation from a platform administrator.
          </p>
        </Dialog>
      )}
      {selected && !auth && (
        <Dialog title={selected.product.name} onClose={closeProduct} wide>
          <div className="product-detail-grid">
            <div>
              {selected.product.images[0] ? (
                <img
                  className="detail-image"
                  src={selected.product.images[0]}
                  alt={selected.product.name}
                />
              ) : (
                <div className="product-placeholder">
                  <Package size={70} />
                </div>
              )}
              <div className="image-gallery">
                {selected.product.images.slice(1).map((src: string) => (
                  <img key={src} src={src} alt={selected.product.name} />
                ))}
              </div>
            </div>
            <div>
              <a className="eyebrow muted" href={`/s/${selected.store.slug}`}>
                {selected.store.name}
                <ArrowUpRight size={14} />
              </a>
              <p className="description">{selected.product.description}</p>
              <strong className="detail-price">
                {displayMoney(
                  activeVariant?.price || 0,
                  selected.store.currency,
                )}
              </strong>
              <label className="field variant-select">
                <span>Choose an option</span>
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                >
                  {selected.product.variants.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ·{" "}
                      {displayMoney(v.price, selected.store.currency)}
                      {selected.product.trackStock ? ` · ${v.stock} left` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Quantity"
                type="number"
                min="1"
                max={Math.min(
                  100,
                  selected.product.trackStock ? activeVariant?.stock || 1 : 100,
                )}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <div className="detail-actions">
                <Button
                  disabled={
                    busy ||
                    selected.store.demo ||
                    (selected.product.trackStock && activeVariant?.stock < 1)
                  }
                  onClick={addToCart}
                >
                  <ShoppingBag size={16} />
                  {selected.store.demo ? "Preview product" : t("Add to cart")}
                </Button>
                <Button
                  className="secondary"
                  onClick={() => saveFavorite(selected.product)}
                >
                  <Heart size={16} />
                </Button>
              </div>
              <dl className="attribute-list">
                {Object.entries(selected.product.attributes).map(
                  ([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{String(value)}</dd>
                    </div>
                  ),
                )}
              </dl>
              <span className="product-type-tag">
                {selected.product.type === "physical"
                  ? "Physical product"
                  : selected.product.type === "digital"
                    ? "Digital delivery after verified payment"
                    : "Service — arrange fulfillment with the store"}
              </span>
            </div>
          </div>
          <div className="detail-section">
            <h3>Verified buyer reviews</h3>
            {selected.reviews.map((review: any) => (
              <article className="review" key={review._id}>
                <strong>{review.userName}</strong>
                <span>{"★".repeat(review.rating)}</span>
                <p>{review.text}</p>
              </article>
            ))}
            {!selected.reviews.length && (
              <p className="muted">
                Be the first to share your experience after purchase.
              </p>
            )}
            {user && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = fields(e.currentTarget);
                  run(async () => {
                    await api(
                      `products/${selected.product._id}/reviews`,
                      "POST",
                      { text: f.text, rating: Number(f.rating) },
                    );
                    setSelected(await api(`products/${selected.product._id}`));
                    setNotice("Review added");
                  });
                }}
              >
                <textarea
                  name="text"
                  placeholder="Tell other shoppers about your purchase"
                  required
                  minLength={3}
                  maxLength={2000}
                />
                <div className="review-actions">
                  <select name="rating" aria-label="Rating">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {"★".repeat(n)}
                      </option>
                    ))}
                  </select>
                  <Button className="secondary small">Submit review</Button>
                </div>
              </form>
            )}
          </div>
        </Dialog>
      )}
      {checkout && (
        <Dialog title={t("Secure checkout")} onClose={closeCheckout} wide>
          <Checkout
            {...checkout}
            run={run}
            onComplete={() => {
              setCheckout(null);
              setView("orders");
              setNotice("Order placed");
              reload();
            }}
          />
        </Dialog>
      )}
      {notifications && (
        <Dialog title={t("Notifications")} onClose={closeNotices}>
          {notifications.map((n) => (
            <article
              className={`notification ${n.read ? "read" : ""}`}
              key={n._id}
            >
              <Bell size={17} />
              <div>
                <p>{n.text}</p>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
            </article>
          ))}
          {!notifications.length && <p className="muted">All caught up.</p>}
          <Button
            className="secondary small"
            onClick={() =>
              run(async () => {
                const r = await fetch("/api/notifications", {
                  method: "PATCH",
                });
                if (!r.ok) throw new Error("Could not update notifications");
                setNotifications(
                  (list) => list?.map((n) => ({ ...n, read: true })) || [],
                );
              })
            }
          >
            Mark all read
          </Button>
        </Dialog>
      )}
    </div>
  );
}
function CartGroup({
  cart,
  stores,
  run,
  onUpdate,
  onCheckout,
}: {
  cart: Cart;
  stores: Store[];
  run: (fn: () => Promise<void>) => Promise<void>;
  onUpdate: (
    cart: Cart,
    productId: string,
    variantId: string,
    n: number,
  ) => Promise<void>;
  onCheckout: (store: Store) => void;
}) {
  const [quote, setQuote] = useState<any>(null);
  const store = stores.find((s) => s._id === cart.storeId);
  useEffect(() => {
    let alive = true;
    setQuote(null);
    run(async () => {
      const q = await api("quote", "POST", cart);
      if (alive) setQuote(q);
    });
    return () => {
      alive = false;
    };
  }, [cart]);
  return (
    <section className="cart-group">
      <h3>{store?.name || "Store unavailable"}</h3>
      {quote ? (
        quote.lines.map((l: any) => (
          <div className="cart-line" key={`${l.productId}-${l.variantId}`}>
            <div className="cart-thumbnail">
              {l.image ? <img src={l.image} alt="" /> : <Package size={22} />}
            </div>
            <div>
              <strong>{l.name}</strong>
              <small>
                {l.variant} · {displayMoney(l.unitPrice, quote.currency)}
              </small>
            </div>
            <input
              type="number"
              aria-label={`Quantity for ${l.name}`}
              min="1"
              max="100"
              value={l.quantity}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (n >= 1 && n <= 100)
                  onUpdate(cart, l.productId, l.variantId, n);
              }}
            />
            <strong>
              {displayMoney(l.unitPrice * l.quantity, quote.currency)}
            </strong>
            <button
              aria-label={`Remove ${l.name}`}
              className="icon-button"
              onClick={() => onUpdate(cart, l.productId, l.variantId, 0)}
            >
              <X size={17} />
            </button>
          </div>
        ))
      ) : (
        <>
          <p className="muted">
            Reviewing availability… If an item is no longer available, remove it
            below.
          </p>
          {cart.lines.map((l) => (
            <div className="cart-line" key={`${l.productId}-${l.variantId}`}>
              <span>Saved item · {l.quantity} unit(s)</span>
              <Button
                className="secondary small"
                onClick={() => onUpdate(cart, l.productId, l.variantId, 0)}
              >
                Remove unavailable item
              </Button>
            </div>
          ))}
        </>
      )}
      <div className="cart-group-total">
        <span>
          {quote
            ? `Subtotal ${displayMoney(quote.subtotal, quote.currency)}`
            : "Availability required"}
          <small>Delivery, tax, and discounts shown at checkout.</small>
        </span>
        <Button
          disabled={!quote || !store}
          onClick={() => store && onCheckout(store)}
        >
          Checkout this store
          <ArrowUpRight size={17} />
        </Button>
      </div>
    </section>
  );
}
