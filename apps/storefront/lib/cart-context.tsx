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
import { readStoredValue, useStoredValue, writeStoredValue } from "@/lib/stored-value";
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
  const cartId = useStoredValue(CART_STORAGE_KEY) ?? null;
  // The count is remembered with the cart it belongs to, so a different (or
  // cleared) cart id never shows a stale badge while its own count loads.
  const [count, setCount] = useState<{ cartId: string; total: number } | null>(null);
  const itemCount = cartId && count?.cartId === cartId ? count.total : 0;

  const refreshCount = useCallback(async (cartOverride?: CartData) => {
    if (cartOverride) {
      setCount({ cartId: cartOverride.id, total: sumQuantity(cartOverride) });
      return;
    }
    const id = readStoredValue(CART_STORAGE_KEY);
    if (!id) return;
    try {
      const client = getBrowserClient();
      const { data } = await client.query({ query: CartDocument, variables: { id } });
      setCount({ cartId: id, total: sumQuantity(data.cart) });
    } catch {
      // Cart may have expired or been completed elsewhere: treat as empty
      // rather than surfacing an error from a background refresh.
      setCount({ cartId: id, total: 0 });
    }
  }, []);

  // Load the badge count whenever the cart id changes, in this tab or another.
  useEffect(() => {
    if (!cartId) return;
    let cancelled = false;
    (async () => {
      try {
        const client = getBrowserClient();
        const { data } = await client.query({ query: CartDocument, variables: { id: cartId } });
        if (!cancelled) setCount({ cartId, total: sumQuantity(data.cart) });
      } catch {
        if (!cancelled) setCount({ cartId, total: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cartId]);

  const ensureCartId = useCallback(async (): Promise<string> => {
    if (cartId) return cartId;
    const client = getBrowserClient();
    const { data } = await client.mutate({
      mutation: CreateCartDocument,
      variables: { input: { locale } },
    });
    if (!data?.createCart) throw new Error("Failed to create cart");
    writeStoredValue(CART_STORAGE_KEY, data.createCart.id);
    return data.createCart.id;
  }, [cartId, locale]);

  const clearCart = useCallback(() => {
    writeStoredValue(CART_STORAGE_KEY, null);
    setCount(null);
  }, []);

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
