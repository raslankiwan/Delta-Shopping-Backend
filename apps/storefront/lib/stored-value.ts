"use client";

import { useSyncExternalStore } from "react";

/**
 * localStorage values as an external store.
 *
 * Components read a key with `useStoredValue` instead of copying it into
 * state from an effect: React reads the current value during render, the
 * server render and the first hydration pass see `undefined` (so there is no
 * mismatch), and every subscriber re-renders when the value changes, whether
 * this tab wrote it (`writeStoredValue`) or another tab did (`storage` event).
 */

const LOCAL_CHANGE_EVENT = "mercato:stored-value";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCAL_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCAL_CHANGE_EVENT, onChange);
  };
}

export function readStoredValue(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies).
    return null;
  }
}

export function writeStoredValue(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Unavailable storage: the value just doesn't persist.
  }
  window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
}

/** The stored value, `null` when absent, or `undefined` before hydration. */
export function useStoredValue(key: string): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => readStoredValue(key),
    () => undefined,
  );
}
