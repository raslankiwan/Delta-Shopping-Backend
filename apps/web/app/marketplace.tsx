"use client";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type FormEvent,
} from "react";
import {
  Search,
  ArrowUpRight,
  Plus,
  Heart,
  ShoppingBag,
  MessageCircle,
  Bell,
  X,
  ArrowRight,
  LogOut,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  Smartphone,
  Laptop,
  Car,
  Shirt,
  Music2,
  LayoutGrid,
  Check,
  Menu,
  Globe,
  ChevronDown,
  Package,
  Star,
} from "lucide-react";
import {
  categories,
  categoryImages,
  currencies,
  money,
  type Product,
  type User,
} from "@delta/domain";
import { Button, Field, Empty } from "@delta/ui";
type View =
  | "browse"
  | "wishlist"
  | "cart"
  | "selling"
  | "messages"
  | "notifications"
  | "admin";
const icons = [Smartphone, Laptop, Car, Shirt, Music2, LayoutGrid];
const ar: Record<string, string> = {
  Discover: "اكتشف",
  Sell: "بيع",
  Messages: "الرسائل",
  Wishlist: "المفضلة",
  Cart: "السلة",
  Notifications: "الإشعارات",
  "My listings": "إعلاناتي",
  Admin: "الإدارة",
  "Sign in": "تسجيل الدخول",
  "Create account": "إنشاء حساب",
  "All finds": "كل المنتجات",
  Mobiles: "هواتف",
  Laptops: "حواسيب",
  Cars: "سيارات",
  Clothes: "ملابس",
  Music: "موسيقى",
  Other: "أخرى",
  "Fresh finds.": "اكتشافات جديدة.",
  "New possibilities.": "إمكانيات جديدة.",
  "Good things deserve a next chapter. Find yours here.":
    "الأشياء الجميلة تستحق فصلاً جديداً. اكتشف ما يناسبك هنا.",
  "Explore the marketplace": "استكشف السوق",
  "Sell something great": "اعرض منتجك للبيع",
  "Latest discoveries": "أحدث المنتجات",
  "Thoughtfully listed. Ready for what’s next.":
    "منتجات مختارة، جاهزة لفصل جديد.",
  "Search for your next find...": "ابحث عن منتجك القادم...",
  "Recently added": "أضيف حديثاً",
  "Price: low to high": "السعر: من الأقل للأعلى",
  "Community marketplace": "سوق المجتمع",
  "List an item": "أضف إعلاناً",
  Name: "الاسم",
  Email: "البريد الإلكتروني",
  Password: "كلمة المرور",
  Title: "العنوان",
  Description: "الوصف",
  Location: "الموقع",
  Company: "الشركة",
  Price: "السعر",
  "Image URL": "رابط الصورة",
  "Publish listing": "نشر الإعلان",
  "Save changes": "حفظ التغييرات",
  "Contact seller": "تواصل مع البائع",
  "Add to cart": "أضف إلى السلة",
  "Save to wishlist": "أضف للمفضلة",
  "Sign out": "تسجيل الخروج",
  "Nothing here yet.": "لا توجد عناصر بعد.",
  "Browse the marketplace": "تصفح السوق",
  "Welcome back": "مرحباً بعودتك",
  "Join the community": "انضم إلى المجتمع",
  New: "جديد",
  "Like new": "شبه جديد",
  Good: "جيد",
  Used: "مستعمل",
  Reviews: "التقييمات",
  "Write a review": "اكتب تقييماً",
  "Send message": "إرسال الرسالة",
  "Mark sold": "تم البيع",
  Relist: "إعادة النشر",
  Remove: "إزالة",
  Edit: "تعديل",
  Close: "إغلاق",
  Cancel: "إلغاء",
  Reply: "رد",
  Send: "إرسال",
  "Mark all read": "تعليم الكل كمقروء",
  Members: "الأعضاء",
  Listings: "الإعلانات",
  Active: "نشط",
  Hidden: "مخفي",
  Sold: "تم البيع",
  Hide: "إخفاء",
  Restore: "استعادة",
  Disable: "تعطيل",
  Enable: "تفعيل",
  Account: "الحساب",
  "Stay curious. Shop differently.": "اكتشف أكثر. تسوق بشكل مختلف.",
  "Made for the next chapter.": "صُنع للفصل القادم.",
  "No payments are collected here. Contact the seller to arrange the sale.":
    "لا يتم تحصيل المدفوعات هنا. تواصل مع البائع لترتيب عملية البيع.",
};
async function api(path: string, method = "GET", data?: unknown) {
  const r = await fetch(`/api/${path}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error || "Request failed");
  return json;
}
export default function Marketplace({
  initialView = "browse",
}: {
  initialView?: View;
}) {
  const modalRef = useRef<HTMLElement>(null);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const t = (s: string) => (lang === "ar" ? ar[s] || s : s);
  const [view, setView] = useState<View>(initialView),
    [user, setUser] = useState<User | null>(null),
    [products, setProducts] = useState<Product[]>([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(1),
    [q, setQ] = useState(""),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [sort, setSort] = useState("recent"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [auth, setAuth] = useState<"login" | "register" | null>(null),
    [selling, setSelling] = useState(false),
    [editing, setEditing] = useState<Product | null>(null),
    [selected, setSelected] = useState<Product | null>(null),
    [reviews, setReviews] = useState<any[]>([]),
    [busy, setBusy] = useState(false),
    [messages, setMessages] = useState<any[]>([]),
    [notifications, setNotifications] = useState<any[]>([]),
    [overview, setOverview] = useState<any>(null),
    [members, setMembers] = useState<User[]>([]),
    [mobileMenu, setMobileMenu] = useState(false),
    [refresh, setRefresh] = useState(0);
  const reload = () => setRefresh((x) => x + 1);
  useEffect(() => {
    api("auth/me")
      .then((x) => setUser(x.user))
      .catch((e) => setError(e.message));
    const saved = localStorage.getItem("delta-language");
    if (saved === "ar") setLang("ar");
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("delta-language", lang);
  }, [lang]);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(q), 300);
    return () => clearTimeout(timer);
  }, [q]);
  useEffect(() => {
    setPage(1);
  }, [search, category, sort, view]);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    (async () => {
      if (
        [
          "wishlist",
          "cart",
          "selling",
          "messages",
          "notifications",
          "admin",
        ].includes(view) &&
        !user
      ) {
        if (alive) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }
      if (view === "admin") {
        const [a, b, c] = await Promise.all([
          api("admin/overview"),
          api("admin/products"),
          api("admin/users"),
        ]);
        if (alive) {
          setOverview(a);
          setProducts(b.products);
          setMembers(c.users);
        }
        return;
      }
      if (view === "messages") {
        const d = await api("messages");
        if (alive) setMessages(d.messages);
        return;
      }
      if (view === "notifications") {
        const d = await api("notifications");
        if (alive) setNotifications(d.notifications);
        return;
      }
      const path =
        view === "cart" || view === "wishlist"
          ? `saved?kind=${view}`
          : `products?${new URLSearchParams({ q: search, category, sort, page: String(page), mine: String(view === "selling") })}`;
      const data = await api(path);
      if (alive) {
        setProducts(data.products);
        setTotal(data.total ?? data.products.length);
      }
    })()
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [view, user, search, category, sort, page, refresh]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!selected) return;
    let alive = true;
    api(`products/${selected._id}`)
      .then((d) => {
        if (alive) setReviews(d.reviews);
      })
      .catch((e) => setError(e.message));
    return () => {
      alive = false;
    };
  }, [selected, refresh]);
  const closeModal = useCallback(() => {
    setAuth(null);
    setSelling(false);
    setEditing(null);
    setSelected(null);
  }, []);
  useEffect(() => {
    if (!auth && !selling && !selected) return;
    const previous = document.activeElement as HTMLElement;
    const dialog = modalRef.current;
    const first = dialog?.querySelector<HTMLElement>(
      "input,button,textarea,select",
    );
    first?.focus();
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "Tab" && dialog) {
        const nodes = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input,textarea,select,a[href]",
          ),
        );
        const start = nodes[0],
          end = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === start) {
          e.preventDefault();
          end?.focus();
        } else if (!e.shiftKey && document.activeElement === end) {
          e.preventDefault();
          start?.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", listener);
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, [auth, selling, selected, closeModal]);
  async function act(task: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function navigate(v: View) {
    if (v === view) reload();
    setView(v);
    setSelected(null);
    setMobileMenu(false);
    setError("");
  }
  function showLogin() {
    setSelected(null);
    setAuth("login");
  }
  function sell() {
    if (!user) {
      showLogin();
      return;
    }
    setEditing(null);
    setSelling(true);
  }
  async function save(p: Product, kind: "cart" | "wishlist") {
    if (!user) {
      showLogin();
      return;
    }
    await act(async () => {
      await api(`saved/${p._id}?kind=${kind}`, "POST");
      setNotice(kind === "cart" ? "Added to cart" : "Saved to wishlist");
    });
  }
  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await act(async () => {
      const data = await api(`auth/${auth}`, "POST", Object.fromEntries(f));
      setUser(data.user);
      setAuth(null);
      setNotice("Welcome to Delta");
    });
  }
  async function publish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = { ...Object.fromEntries(f), price: Number(f.get("price")) };
    await act(async () => {
      await api(
        editing ? `products/${editing._id}` : "products",
        editing ? "PATCH" : "POST",
        data,
      );
      setSelling(false);
      setEditing(null);
      setView("selling");
      reload();
      setNotice("Listing saved");
    });
  }
  const nav = [
    ["browse", "Discover", Search],
    ["wishlist", "Wishlist", Heart],
    ["cart", "Cart", ShoppingBag],
    ["messages", "Messages", MessageCircle],
    ["selling", "My listings", Package],
    ["notifications", "Notifications", Bell],
  ] as const;
  return (
    <>
      <div className="topline">
        <span>{t("Community marketplace")}</span>
        <span>
          {lang === "ar"
            ? "كل منتج، بداية جديدة"
            : "A little discovery goes a long way."}
          <ArrowUpRight size={12} />
        </span>
      </div>
      <header className="header">
        <a className="brand" href="/" aria-label="Delta home">
          <span className="brand-mark">Δ</span>delta
          <span className="brand-dot">.</span>
        </a>
        <nav className={mobileMenu ? "nav open" : "nav"}>
          {nav.map(([v, label, Icon]) => (
            <button
              key={v}
              className={view === v ? "nav-link active" : "nav-link"}
              onClick={() => navigate(v)}
            >
              <Icon size={16} />
              {t(label)}
            </button>
          ))}
          {user?.role === "admin" && (
            <button
              className={view === "admin" ? "nav-link active" : "nav-link"}
              onClick={() => navigate("admin")}
            >
              <ShieldCheck size={16} />
              {t("Admin")}
            </button>
          )}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button language"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            title="Change language"
          >
            <Globe size={17} />
            <span>{lang === "en" ? "العربية" : "EN"}</span>
          </button>
          {user ? (
            <>
              <button
                className="icon-button"
                title={t("Notifications")}
                onClick={() => navigate("notifications")}
              >
                <Bell size={19} />
              </button>
              <button
                className="avatar"
                title={`${user.name} · ${t("Sign out")}`}
                onClick={() =>
                  act(async () => {
                    await api("auth/logout", "POST");
                    setUser(null);
                    navigate("browse");
                  })
                }
              >
                {user.name.slice(0, 1).toUpperCase()}
              </button>
            </>
          ) : (
            <button className="sign-in" onClick={() => showLogin()}>
              {t("Sign in")}
            </button>
          )}
          <Button className="small" onClick={sell}>
            <Plus size={16} />
            {t("Sell")}
          </Button>
          <button
            className="icon-button menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Menu"
          >
            <Menu />
          </button>
        </div>
      </header>
      {view === "browse" && (
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" />
              {t("Stay curious. Shop differently.")}
            </div>
            <h1>
              {t("Fresh finds.")}
              <br />
              <em>{t("New possibilities.")}</em>
            </h1>
            <p>{t("Good things deserve a next chapter. Find yours here.")}</p>
            <div className="hero-buttons">
              <Button
                onClick={() =>
                  document
                    .getElementById("discover")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("Explore the marketplace")}
                <ArrowUpRight size={17} />
              </Button>
              <button className="text-button" onClick={sell}>
                {t("Sell something great")}
                <ArrowRight size={17} />
              </button>
            </div>
            <div className="hero-note">
              <span className="mini-avatars">
                <b>R</b>
                <b>A</b>
                <b>M</b>
              </span>
              <span>
                {lang === "ar"
                  ? "أشياء رائعة. أشخاص رائعون."
                  : "Great things. Good people."}
                <br />
                <strong>
                  {lang === "ar"
                    ? "مجتمع يستحق الانضمام."
                    : "A community worth discovering."}
                </strong>
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="orb" />
            <div className="vertical-label">
              THE NEXT CHAPTER COLLECTION / 001
            </div>
            <div className="floating-label">
              <span className="live-dot" />{" "}
              {lang === "ar"
                ? "اكتشافات تستحق المشاهدة"
                : "FINDS WORTH FINDING"}
            </div>
            <div className="hero-photo">
              <img
                src="/images/cat7.jpg"
                alt="A new perspective on everyday finds"
              />
              <span className="photo-label">
                A new perspective
                <ArrowUpRight size={18} />
              </span>
            </div>
            <div className="hero-small-photo">
              <img
                src="/images/cat3.jpg"
                alt="Discover electronics in the marketplace"
              />
            </div>
            <div className="sticker">
              <ArrowUpRight size={23} />
              <span>
                GOOD FINDS.
                <br />
                BETTER STORIES.
              </span>
            </div>
            <span className="art-number">Δ / 01</span>
          </div>
        </section>
      )}
      <main className="main" id="discover">
        {error && (
          <div className="alert" role="alert">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={17} />
            </button>
          </div>
        )}
        {view === "browse" && (
          <>
            <div className="section-heading">
              <div>
                <div className="eyebrow muted">THE MARKETPLACE</div>
                <h2>
                  {t("Latest discoveries")}
                  <span className="count">{total}</span>
                </h2>
                <p>{t("Thoughtfully listed. Ready for what’s next.")}</p>
              </div>
              <span className="section-stamp">
                <ShieldCheck size={17} />
                {lang === "ar"
                  ? "من شخص إلى شخص"
                  : "From one person to another"}
              </span>
            </div>
            <div className="filters">
              <div className="search">
                <Search size={19} />
                <input
                  aria-label={t("Search for your next find...")}
                  placeholder={t("Search for your next find...")}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                {q && (
                  <button onClick={() => setQ("")} aria-label="Clear search">
                    <X size={15} />
                  </button>
                )}
              </div>
              <label className="sort">
                <SlidersHorizontal size={17} />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort listings"
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
                <LayoutGrid size={16} />
                {t("All finds")}
              </button>
              {categories.map((c, i) => {
                const Icon = icons[i];
                return (
                  <button
                    key={c}
                    className={category === c ? "category active" : "category"}
                    onClick={() => setCategory(c)}
                  >
                    <Icon size={16} />
                    {t(c)}
                  </button>
                );
              })}
            </div>
          </>
        )}
        {view !== "browse" && (
          <div className="section-heading">
            <div>
              <div className="eyebrow muted">YOUR DELTA</div>
              <h2>
                {t(
                  view === "selling"
                    ? "My listings"
                    : view === "admin"
                      ? "Admin"
                      : view === "messages"
                        ? "Messages"
                        : view === "notifications"
                          ? "Notifications"
                          : view === "cart"
                            ? "Cart"
                            : "Wishlist",
                )}
              </h2>
              <p>
                {view === "cart"
                  ? t(
                      "No payments are collected here. Contact the seller to arrange the sale.",
                    )
                  : t("Made for the next chapter.")}
              </p>
            </div>
            {view === "selling" && (
              <Button onClick={sell}>
                <Plus size={17} />
                {t("List an item")}
              </Button>
            )}
            {view === "notifications" && user && (
              <Button
                className="secondary"
                onClick={() =>
                  act(async () => {
                    await api("notifications", "PATCH");
                    reload();
                  })
                }
              >
                {t("Mark all read")}
              </Button>
            )}
          </div>
        )}
        {view !== "browse" && !user ? (
          <Empty icon={<ShieldCheck size={32} />}>
            <button className="text-button" onClick={() => showLogin()}>
              {t("Sign in")}
              <ArrowRight size={16} />
            </button>
          </Empty>
        ) : loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((x) => (
              <div className="skeleton" key={x} />
            ))}
          </div>
        ) : view === "admin" ? (
          user?.role !== "admin" ? (
            <Empty>Administrator access required.</Empty>
          ) : (
            <>
              <div className="stats">
                {overview &&
                  Object.entries(overview).map(([k, v]) => (
                    <div key={k}>
                      <span>
                        {t(
                          k === "users"
                            ? "Members"
                            : k === "listings"
                              ? "Listings"
                              : k === "active"
                                ? "Active"
                                : "Messages",
                        )}
                      </span>
                      <strong>{String(v)}</strong>
                    </div>
                  ))}
              </div>
              <h3>{t("Listings")}</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t("Title")}</th>
                      <th>{t("Price")}</th>
                      <th>Status</th>
                      <th>Moderation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td>
                          {p.title}
                          <small>{p.sellerName}</small>
                        </td>
                        <td>{money(p.price, p.currency)}</td>
                        <td>
                          <span className={`status ${p.status}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <Button
                            className="secondary small"
                            disabled={busy}
                            onClick={() =>
                              act(async () => {
                                await api(`admin/products/${p._id}`, "PATCH", {
                                  status:
                                    p.status === "hidden" ? "active" : "hidden",
                                });
                                reload();
                              })
                            }
                          >
                            {t(p.status === "hidden" ? "Restore" : "Hide")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3>{t("Members")}</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t("Name")}</th>
                      <th>{t("Email")}</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m._id}>
                        <td>{m.name}</td>
                        <td>{m.email}</td>
                        <td>{m.role}</td>
                        <td>
                          {m.role !== "admin" && (
                            <Button
                              className="secondary small"
                              disabled={busy}
                              onClick={() =>
                                act(async () => {
                                  await api(`admin/users/${m._id}`, "PATCH", {
                                    disabled: !m.disabled,
                                  });
                                  reload();
                                })
                              }
                            >
                              {t(m.disabled ? "Enable" : "Disable")}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="muted">
                Showing up to 200 recent listings and members.
              </p>
            </>
          )
        ) : view === "messages" ? (
          messages.length ? (
            <div className="message-list">
              {messages.map((m) => (
                <article className="message" key={m._id}>
                  <div className="message-avatar">{m.fromName.slice(0, 1)}</div>
                  <div>
                    <strong>
                      {m.from === user?._id ? `You → ${m.toName}` : m.fromName}
                    </strong>
                    <span className="message-context">
                      {m.productTitle} ·{" "}
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                    <p>{m.text}</p>
                    {m.from !== user?._id && (
                      <form
                        className="reply-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const text = new FormData(form).get("text");
                          act(async () => {
                            await api("messages", "POST", {
                              productId: m.productId,
                              to: m.from,
                              text,
                            });
                            form.reset();
                            reload();
                          });
                        }}
                      >
                        <input
                          name="text"
                          required
                          maxLength={2000}
                          placeholder={t("Reply")}
                        />
                        <Button className="small" disabled={busy}>
                          {t("Send")}
                        </Button>
                      </form>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty icon={<MessageCircle size={32} />}>
              {t("Nothing here yet.")}
            </Empty>
          )
        ) : view === "notifications" ? (
          notifications.length ? (
            <div className="message-list">
              {notifications.map((n) => (
                <article
                  className={`notification ${n.read ? "read" : ""}`}
                  key={n._id}
                >
                  <Bell size={20} />
                  <div>
                    <p>{n.text}</p>
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty icon={<Bell size={32} />}>{t("Nothing here yet.")}</Empty>
          )
        ) : (
          <>
            {products.length ? (
              <div className="product-grid">
                {products.map((p) => (
                  <article className="product-card" key={p._id}>
                    <div className="product-image">
                      <button
                        className="image-open"
                        onClick={() => setSelected(p)}
                        aria-label={`View ${p.title}`}
                      >
                        <img
                          src={p.image || categoryImages[p.category]}
                          alt={p.title}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/cat1.jpg";
                          }}
                        />
                      </button>
                      <span className="condition">
                        {p.sample
                          ? lang === "ar"
                            ? "مثال"
                            : "Sample"
                          : t(p.condition)}
                      </span>
                      <button
                        className="save-button"
                        title={t("Save to wishlist")}
                        onClick={() => save(p, "wishlist")}
                      >
                        <Heart size={18} />
                      </button>
                      {p.status !== "active" && (
                        <span className="image-status">
                          {t(p.status === "sold" ? "Sold" : "Hidden")}
                        </span>
                      )}
                    </div>
                    <div className="product-meta">
                      <span>{t(p.category)}</span>
                      <span>
                        <MapPin size={12} />
                        {p.location}
                      </span>
                    </div>
                    <button
                      className="product-title"
                      onClick={() => setSelected(p)}
                    >
                      {p.title}
                    </button>
                    <div className="product-bottom">
                      <strong>{money(p.price, p.currency)}</strong>
                      <span>{p.sellerName}</span>
                    </div>
                    {view === "selling" && (
                      <div className="card-actions">
                        <button
                          disabled={busy || p.status === "hidden"}
                          onClick={() =>
                            act(async () => {
                              await api(`products/${p._id}`, "PATCH", {
                                status: p.status === "sold" ? "active" : "sold",
                              });
                              reload();
                            })
                          }
                        >
                          {t(p.status === "sold" ? "Relist" : "Mark sold")}
                        </button>
                        <button
                          onClick={() => {
                            setEditing(p);
                            setSelling(true);
                          }}
                        >
                          {t("Edit")}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() =>
                            act(async () => {
                              await api(`products/${p._id}`, "DELETE");
                              reload();
                            })
                          }
                        >
                          {t("Remove")}
                        </button>
                      </div>
                    )}
                    {(view === "cart" || view === "wishlist") && (
                      <div className="card-actions">
                        <button
                          disabled={busy}
                          onClick={() =>
                            act(async () => {
                              await api(
                                `saved/${p._id}?kind=${view}`,
                                "DELETE",
                              );
                              reload();
                            })
                          }
                        >
                          {t("Remove")}
                        </button>
                        <button onClick={() => setSelected(p)}>
                          {t("Contact seller")}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <Empty icon={<Package size={32} />}>
                {t("Nothing here yet.")}
                <br />
                <button
                  className="text-button"
                  onClick={() => navigate("browse")}
                >
                  {t("Browse the marketplace")}
                  <ArrowRight size={16} />
                </button>
              </Empty>
            )}
            {view === "browse" && total > 24 && (
              <div className="pagination">
                <Button
                  className="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span>
                  {page} / {Math.ceil(total / 24)}
                </span>
                <Button
                  className="secondary"
                  disabled={page * 24 >= total}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
            {view === "cart" && products.length > 0 && (
              <div className="cart-totals">
                {currencies.map((c) => {
                  const group = products.filter((p) => p.currency === c);
                  return group.length ? (
                    <strong key={c}>
                      {c}:{" "}
                      {money(
                        group.reduce((a, p) => a + p.price, 0),
                        c,
                      )}
                    </strong>
                  ) : null;
                })}
                <span>
                  {t(
                    "No payments are collected here. Contact the seller to arrange the sale.",
                  )}
                </span>
              </div>
            )}
          </>
        )}
        {view === "browse" && (
          <section className="sell-banner">
            <div className="banner-icon">Δ</div>
            <div>
              <div className="eyebrow">MAKE ROOM FOR SOMETHING NEW</div>
              <h2>
                {lang === "ar"
                  ? "منتجك القديم، اكتشاف شخص آخر."
                  : "Your old favorite. Someone’s new find."}
              </h2>
              <p>
                {lang === "ar"
                  ? "امنح الأشياء فصلاً جديداً مع دلتا."
                  : "Give good things another go. List your first item in minutes."}
              </p>
            </div>
            <Button className="light" onClick={sell}>
              {t("List an item")}
              <ArrowUpRight size={18} />
            </Button>
          </section>
        )}
      </main>
      <footer>
        <a className="brand" href="/">
          <span className="brand-mark">Δ</span>delta
          <span className="brand-dot">.</span>
        </a>
        <p>{t("Made for the next chapter.")}</p>
        <span>© {new Date().getFullYear()} Delta Shopping</span>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
        </div>
      )}
      {(auth || selling || selected) && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <section
            ref={modalRef}
            className={`modal ${selected ? "detail-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={
              auth
                ? t(auth === "login" ? "Sign in" : "Create account")
                : selling
                  ? t("List an item")
                  : selected?.title
            }
          >
            <button
              className="modal-close icon-button"
              aria-label={t("Close")}
              onClick={closeModal}
            >
              <X size={21} />
            </button>
            {error && (
              <div className="alert" role="alert">
                {error}
              </div>
            )}
            {auth && (
              <>
                <span className="modal-logo">Δ</span>
                <div className="eyebrow muted">
                  YOUR NEXT CHAPTER STARTS HERE
                </div>
                <h2>
                  {t(auth === "login" ? "Welcome back" : "Join the community")}
                </h2>
                <form onSubmit={signIn}>
                  {auth === "register" && (
                    <Field
                      label={t("Name")}
                      name="name"
                      minLength={2}
                      maxLength={80}
                      required
                      autoComplete="name"
                    />
                  )}
                  <Field
                    label={t("Email")}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                  <Field
                    label={`${t("Password")} (10+ characters)`}
                    name="password"
                    type="password"
                    minLength={10}
                    maxLength={128}
                    required
                    autoComplete={
                      auth === "login" ? "current-password" : "new-password"
                    }
                  />
                  <Button disabled={busy} type="submit">
                    {busy
                      ? "…"
                      : t(auth === "login" ? "Sign in" : "Create account")}
                    <ArrowRight size={16} />
                  </Button>
                </form>
                <button
                  className="auth-switch"
                  onClick={() => {
                    setAuth(auth === "login" ? "register" : "login");
                    setError("");
                  }}
                >
                  {t(auth === "login" ? "Create account" : "Sign in")}
                </button>
              </>
            )}
            {selling && (
              <>
                <div className="eyebrow muted">PASS ON SOMETHING GOOD</div>
                <h2>{t(editing ? "Edit" : "List an item")}</h2>
                <form onSubmit={publish}>
                  <Field
                    label={t("Title")}
                    name="title"
                    required
                    minLength={3}
                    maxLength={120}
                    defaultValue={editing?.title}
                  />
                  <label className="field">
                    <span>{t("Description")}</span>
                    <textarea
                      name="description"
                      required
                      minLength={10}
                      maxLength={5000}
                      defaultValue={editing?.description}
                    />
                  </label>
                  <div className="form-row">
                    <label className="field">
                      <span>Category</span>
                      <select name="category" defaultValue={editing?.category}>
                        {categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Condition</span>
                      <select
                        name="condition"
                        defaultValue={editing?.condition || "Good"}
                      >
                        {["New", "Like new", "Good", "Used"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="form-row">
                    <Field
                      label={t("Price")}
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      max="100000000"
                      required
                      defaultValue={editing?.price}
                    />
                    <label className="field">
                      <span>Currency</span>
                      <select name="currency" defaultValue={editing?.currency}>
                        {currencies.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="form-row">
                    <Field
                      label={t("Location")}
                      name="location"
                      required
                      minLength={2}
                      maxLength={120}
                      defaultValue={editing?.location}
                    />
                    <Field
                      label={t("Company")}
                      name="company"
                      maxLength={80}
                      defaultValue={editing?.company}
                    />
                  </div>
                  <Field
                    label={t("Image URL")}
                    name="image"
                    type="url"
                    placeholder="https://…"
                    defaultValue={editing?.image}
                  />
                  <p className="form-hint">
                    Use a public HTTPS image URL. A category image is used when
                    empty.
                  </p>
                  <Button disabled={busy}>
                    {busy
                      ? "…"
                      : t(editing ? "Save changes" : "Publish listing")}
                    <ArrowUpRight size={17} />
                  </Button>
                </form>
              </>
            )}
            {selected && (
              <>
                <img
                  className="detail-image"
                  src={selected.image || categoryImages[selected.category]}
                  alt={selected.title}
                />
                <div className="product-meta">
                  <span>
                    {t(selected.category)} · {t(selected.condition)}
                  </span>
                  <span>
                    <MapPin size={13} />
                    {selected.location}
                  </span>
                </div>
                <h2>{selected.title}</h2>
                <strong className="detail-price">
                  {money(selected.price, selected.currency)}
                </strong>
                <p className="description">{selected.description}</p>
                {selected.sample && (
                  <p className="alert">
                    {lang === "ar"
                      ? "هذا إعلان تجريبي وليس عرضاً للبيع."
                      : "Sample listing — this is not a real offer. Create an account to publish your own."}
                  </p>
                )}
                <div className="seller">
                  <div className="avatar">{selected.sellerName[0]}</div>
                  <div>
                    <strong>{selected.sellerName}</strong>
                    <small>
                      {selected.company || t("Community marketplace")}
                    </small>
                  </div>
                  <span className="status">{selected.status}</span>
                </div>
                {selected.status === "active" &&
                  selected.sellerId !== user?._id && (
                    <div className="detail-actions">
                      <Button
                        disabled={busy}
                        onClick={() => save(selected, "cart")}
                      >
                        <ShoppingBag size={17} />
                        {t("Add to cart")}
                      </Button>
                      <Button
                        className="secondary"
                        disabled={busy}
                        onClick={() => save(selected, "wishlist")}
                      >
                        <Heart size={17} />
                        {t("Save to wishlist")}
                      </Button>
                    </div>
                  )}
                {!selected.sample && selected.sellerId !== user?._id && (
                  <div className="detail-section">
                    <h3>{t("Contact seller")}</h3>
                    {user ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const text = new FormData(form).get("text");
                          act(async () => {
                            await api("messages", "POST", {
                              productId: selected._id,
                              to: selected.sellerId,
                              text,
                            });
                            form.reset();
                            setNotice("Message sent");
                          });
                        }}
                      >
                        <textarea
                          name="text"
                          required
                          maxLength={2000}
                          placeholder={t("Contact seller")}
                        />
                        <Button className="small" disabled={busy}>
                          {t("Send message")}
                          <ArrowRight size={15} />
                        </Button>
                      </form>
                    ) : (
                      <button
                        className="text-button"
                        onClick={() => showLogin()}
                      >
                        {t("Sign in")}
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                )}
                <div className="detail-section">
                  <h3>
                    {t("Reviews")}{" "}
                    <span className="count">{reviews.length}</span>
                  </h3>
                  {reviews.map((r) => (
                    <article className="review" key={r._id}>
                      <strong>{r.userName}</strong>
                      <span>{"★".repeat(r.rating)}</span>
                      <p>{r.text}</p>
                    </article>
                  ))}
                  {user &&
                    !selected.sample &&
                    selected.sellerId !== user._id && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const f = new FormData(form);
                          act(async () => {
                            await api(
                              `products/${selected._id}/reviews`,
                              "POST",
                              {
                                text: f.get("text"),
                                rating: Number(f.get("rating")),
                              },
                            );
                            form.reset();
                            reload();
                            setNotice("Review added");
                          });
                        }}
                      >
                        <textarea
                          name="text"
                          placeholder={t("Write a review")}
                          required
                          minLength={3}
                          maxLength={1500}
                        />
                        <div className="review-actions">
                          <select name="rating" aria-label="Rating">
                            <option value="5">★★★★★</option>
                            <option value="4">★★★★</option>
                            <option value="3">★★★</option>
                            <option value="2">★★</option>
                            <option value="1">★</option>
                          </select>
                          <Button className="small" disabled={busy}>
                            {t("Write a review")}
                          </Button>
                        </div>
                      </form>
                    )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
