import {
  AdminStoresDocument,
  MeDocument,
  StaffLoginDocument,
  type AdminStoresQuery,
  type LoginInputType,
  type MeQuery,
  type PrincipalFFragment,
  type StaffLoginMutation,
} from "@mercato/graphql";
import { apolloClient } from "../lib/client";
import { STORE_KEY, TOKEN_KEY } from "../lib/storageKeys";

export type Principal = PrincipalFFragment;
export type StoreSummary = AdminStoresQuery["adminStores"][number];

export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  token: string | null;
  principal: Principal | null;
  stores: StoreSummary[];
  storesLoading: boolean;
  storeId: string | null;
}

let state: AuthState = {
  status: "initializing",
  token: null,
  principal: null,
  stores: [],
  storesLoading: false,
  storeId: null,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function setState(patch: Partial<AuthState>): void {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

export function getAuthState(): AuthState {
  return state;
}

export function subscribeAuth(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCurrentStore(): StoreSummary | null {
  return state.stores.find((s) => s.id === state.storeId) ?? null;
}

/** Loads stores visible to this staff session and picks the active one. */
async function loadStores(principal: Principal): Promise<void> {
  setState({ storesLoading: true });
  try {
    const res = await apolloClient.query<AdminStoresQuery>({ query: AdminStoresDocument });
    const all = res.data.adminStores;
    const scoped = all.filter((s) => principal.store_ids.includes(s.id));
    const stores = scoped.length > 0 ? scoped : all;
    const saved = localStorage.getItem(STORE_KEY);
    const initial = (saved && stores.some((s) => s.id === saved) ? saved : stores[0]?.id) ?? null;
    if (initial) {
      localStorage.setItem(STORE_KEY, initial);
    } else {
      localStorage.removeItem(STORE_KEY);
    }
    setState({ stores, storeId: initial, storesLoading: false });
  } catch {
    setState({ storesLoading: false });
  }
}

/** Runs once on app boot: restores a persisted token and re-validates it. */
export async function initAuth(): Promise<void> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    setState({ status: "unauthenticated" });
    return;
  }
  try {
    const res = await apolloClient.query<MeQuery>({ query: MeDocument });
    const principal = res.data.me;
    setState({ token, principal, status: "authenticated" });
    await loadStores(principal);
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    setState({ status: "unauthenticated", token: null, principal: null });
  }
}

export async function login(email: string, password: string): Promise<void> {
  const input: LoginInputType = { email, password };
  const res = await apolloClient.mutate<StaffLoginMutation>({
    mutation: StaffLoginDocument,
    variables: { input },
  });
  const session = res.data?.staffLogin;
  if (!session) {
    throw new Error("Sign in failed.");
  }
  localStorage.setItem(TOKEN_KEY, session.access_token);
  setState({ token: session.access_token, principal: session.principal, status: "authenticated" });
  await loadStores(session.principal);
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STORE_KEY);
  setState({
    status: "unauthenticated",
    token: null,
    principal: null,
    stores: [],
    storesLoading: false,
    storeId: null,
  });
}

export function selectStore(storeId: string): void {
  localStorage.setItem(STORE_KEY, storeId);
  setState({ storeId });
}
