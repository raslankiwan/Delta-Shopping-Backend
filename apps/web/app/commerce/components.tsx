"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X, ArrowUpRight, Heart, Package, ShoppingBag } from "lucide-react";
import { displayMoney } from "@delta/domain/commerce";
import type { Item, Store } from "./types";
export function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const root = ref.current;
    const nodes = () =>
      Array.from(
        root?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,textarea,select,a[href]",
        ) || [],
      );
    nodes()[0]?.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const all = nodes(),
          first = all[0],
          last = all.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", listener);
      before?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        ref={ref}
        className={`modal commerce-modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="modal-close icon-button"
          aria-label="Close"
          onClick={onClose}
        >
          <X />
        </button>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}
export function ProductCard({
  item,
  store,
  onOpen,
  onSave,
}: {
  item: Item;
  store: Store;
  onOpen: () => void;
  onSave: () => void;
}) {
  const min = Math.min(...item.variants.map((v) => v.price));
  const available = !item.trackStock || item.variants.some((v) => v.stock > 0);
  return (
    <article className="product-card">
      <div className="product-image">
        <button
          className="image-open"
          onClick={onOpen}
          aria-label={`View ${item.name}`}
        >
          {item.images[0] ? (
            <img src={item.images[0]} alt={item.name} loading="lazy" />
          ) : (
            <div className={`product-placeholder type-${item.type}`}>
              <Package size={60} strokeWidth={1} />
              <span>{store.name}</span>
            </div>
          )}
        </button>
        <span className="condition">
          {!available
            ? "Out of stock"
            : item.type === "digital"
              ? "Digital download"
              : item.type === "service"
                ? "Service"
                : item.featured
                  ? "Featured"
                  : "New arrival"}
        </span>
        <button
          className="save-button"
          aria-label={`Save ${item.name}`}
          onClick={onSave}
        >
          <Heart size={18} />
        </button>
      </div>
      <div className="product-meta">
        <a href={`/s/${store.slug}`}>{store.name}</a>
        <span>
          {item.variants.length > 1
            ? `${item.variants.length} options`
            : item.type}
        </span>
      </div>
      <button className="product-title" onClick={onOpen}>
        {item.name}
      </button>
      <div className="product-bottom">
        <strong>
          {item.variants.length > 1 ? "From " : ""}
          {displayMoney(min, store.currency)}
        </strong>
        <button
          className="icon-button"
          aria-label={`Shop ${item.name}`}
          onClick={onOpen}
        >
          <ArrowUpRight size={18} />
        </button>
      </div>
    </article>
  );
}
export function Status({ children }: { children: ReactNode }) {
  return <span className={`status state-${String(children)}`}>{children}</span>;
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <ShoppingBag size={34} strokeWidth={1} />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
