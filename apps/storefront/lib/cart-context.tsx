"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CartDocument, CreateCartDocument, type CartQuery } from "@mercato/graphql";
import { getBrowserClient } from "@/lib/client";
import { useLocale } from "@/lib/locale-context";

const CART_STORAGE_KEY = "mercato_cart";

type CartData = CartQuery["cart"];

interface CartContextValue {
  /** Persisted cart id, or null before one exists. */
  cartId: string | null;
  /** Sum of line quantities, for the header badge. */
  itemCount: number;
  /** Returns the current cart id, lazily creating one via the API if needed. */
  ensureCartId: () => Promise<string>;
  /**
   * Recomputes itemCount. Pass a freshly-fetched cart to avoid an extra
   * round trip when a mutation already returned the updated cart.
   */
  refreshCount: (cartOverride?: CartData) => Promise<void>;
  /** Forgets the local cart id (e.g. after checkout completes). */
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function sumQuantity(cart: CartData): number {
  return cart.lines.reduce((total, line) => total + line.quantity, 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [cartId, setCartIdState] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);

  const persist = useCallback((id: string | null) => {
    if (typeof window === "undefined") return;
    if (id) window.localStorage.setItem(CART_STORAGE_KEY, id);
    else window.localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const refreshCount = useCallback(
    async (cartOverride?: CartData) => {
      if (cartOverride) {
        setItemCount(sumQuantity(cartOverride));
        return;
      }
      const id =
        cartId ??
        (typeof window !== "undefined" ? window.localStorage.getItem(CART_STORAGE_KEY) : null);
      if (!id) {
        setItemCount(0);
        return;
      }
      try {
        const client = getBrowserClient();
        const { data } = await client.query({ query: CartDocument, variables: { id } });
        setItemCount(sumQuantity(data.cart));
      } catch {
        // Cart may have expired or been completed elsewhere — treat as empty
        // rather than surfacing an error from a background refresh.
        setItemCount(0);
      }
    },
    [cartId],
  );

  // Hydrate from localStorage once on mount (client-only, avoids SSR mismatch).
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? window.localStorage.getItem(CART_STORAGE_KEY) : null;
    setCartIdState(stored);
    if (stored) void refreshCount();
    // Intentionally run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep multiple tabs in sync.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY) {
        setCartIdState(event.newValue);
        void refreshCount();
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshCount]);

  const setCartId = useCallback(
    (id: string | null) => {
      setCartIdState(id);
      persist(id);
    },
    [persist],
  );

  const ensureCartId = useCallback(async (): Promise<string> => {
    if (cartId) return cartId;
    const client = getBrowserClient();
    const { data } = await client.mutate({
      mutation: CreateCartDocument,
      variables: { input: { locale } },
    });
    if (!data?.createCart) throw new Error("Failed to create cart");
    setCartId(data.createCart.id);
    return data.createCart.id;
  }, [cartId, locale, setCartId]);

  const clearCart = useCallback(() => {
    setCartId(null);
    setItemCount(0);
  }, [setCartId]);

  const value = useMemo<CartContextValue>(
    () => ({ cartId, itemCount, ensureCartId, refreshCount, clearCart }),
    [cartId, itemCount, ensureCartId, refreshCount, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
