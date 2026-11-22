"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client";
import {
  AccountAddAddressDocument,
  AccountAddressesDocument,
  AccountProfileDocument,
  AccountRemoveAddressDocument,
  CustomerLoginDocument,
  CustomerRegisterDocument,
  type AccountAddressesQuery,
  type AccountProfileQuery,
  type AddressGqlInput,
} from "@mercato/graphql";
import type { Locale } from "@mercato/i18n";
import { CUSTOMER_TOKEN_KEY, getBrowserClient } from "@/lib/client";
import { useStoredValue, writeStoredValue } from "@/lib/stored-value";
import { useT } from "@/lib/locale-context";
import { errorMessage } from "@/lib/graphql-error";

type Mode = "login" | "register";
type Profile = AccountProfileQuery["accountProfile"];
type AddressRow = AccountAddressesQuery["accountAddresses"][number];

// Strings with no catalog key yet — gap list is in the storefront i18n summary.
const NO_ADDRESSES: Record<Locale, string> = {
  ar: "لم تحفظ أي عناوين بعد.",
  en: "You haven't saved any addresses yet.",
};
const ADD_ADDRESS: Record<Locale, string> = { ar: "إضافة عنوان", en: "Add address" };
const SAVING: Record<Locale, string> = { ar: "جارٍ الحفظ…", en: "Saving…" };
const PLEASE_WAIT: Record<Locale, string> = { ar: "يُرجى الانتظار…", en: "Please wait…" };
const SIGN_IN_ERROR_FALLBACK: Record<Locale, string> = {
  ar: "تعذّر تسجيل دخولك.",
  en: "Could not sign you in.",
};
const PROFILE_ERROR_FALLBACK: Record<Locale, string> = {
  ar: "تعذّر تحميل حسابك.",
  en: "Could not load your account.",
};
const ADDRESS_SAVE_ERROR_FALLBACK: Record<Locale, string> = {
  ar: "تعذّر حفظ هذا العنوان.",
  en: "Could not save that address.",
};
const ADDRESS_REMOVE_ERROR_FALLBACK: Record<Locale, string> = {
  ar: "تعذّرت إزالة هذا العنوان.",
  en: "Could not remove that address.",
};

export default function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params) as { locale: Locale };
  const t = useT();

  const storedToken = useStoredValue(CUSTOMER_TOKEN_KEY);
  const hydrated = storedToken !== undefined;
  const token = storedToken ?? null;

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Account data is remembered with the token it was loaded for, so signing
  // out (or in as someone else) never shows the previous account's details.
  const [account, setAccount] = useState<{
    token: string;
    profile: Profile | null;
    addresses: AddressRow[];
    error: string | null;
  } | null>(null);
  const current = token && account?.token === token ? account : null;
  const profile = current?.profile ?? null;
  const addresses = current?.addresses ?? [];
  const profileError = current?.error ?? null;
  const setAddresses = (update: (prev: AddressRow[]) => AddressRow[]) =>
    setAccount((prev) => (prev ? { ...prev, addresses: update(prev.addresses) } : prev));

  const [addingAddress, setAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressGqlInput>({ line1: "", city: "", country: "" });
  const [addressBusy, setAddressBusy] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const [loginMutation] = useMutation(CustomerLoginDocument);
  const [registerMutation] = useMutation(CustomerRegisterDocument);
  const [addAddressMutation] = useMutation(AccountAddAddressDocument);
  const [removeAddressMutation] = useMutation(AccountRemoveAddressDocument);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const client = getBrowserClient();
        const [profileRes, addressRes] = await Promise.all([
          client.query({ query: AccountProfileDocument }),
          client.query({ query: AccountAddressesDocument }),
        ]);
        if (cancelled) return;
        setAccount({
          token,
          profile: profileRes.data.accountProfile,
          addresses: addressRes.data.accountAddresses,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setAccount({
          token,
          profile: null,
          addresses: [],
          error: errorMessage(err, PROFILE_ERROR_FALLBACK[locale]),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, locale]);

  async function handleAuthSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError(null);
    try {
      const session =
        mode === "login"
          ? (await loginMutation({ variables: { input: { email, password } } })).data?.customerLogin
          : (
              await registerMutation({
                variables: { input: { email, password, name: name || undefined } },
              })
            ).data?.customerRegister;
      if (!session) throw new Error("Missing session in auth response");
      writeStoredValue(CUSTOMER_TOKEN_KEY, session.access);
      setPassword("");
    } catch (err) {
      setAuthError(errorMessage(err, SIGN_IN_ERROR_FALLBACK[locale]));
    } finally {
      setAuthBusy(false);
    }
  }

  function handleLogout() {
    writeStoredValue(CUSTOMER_TOKEN_KEY, null);
    setEmail("");
    setPassword("");
  }

  async function handleAddAddress(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddressBusy(true);
    setAddressError(null);
    try {
      await addAddressMutation({ variables: { input: addressForm } });
      const { data } = await getBrowserClient().query({ query: AccountAddressesDocument });
      setAddresses(() => data.accountAddresses);
      setAddressForm({ line1: "", city: "", country: "" });
      setAddingAddress(false);
    } catch (err) {
      setAddressError(errorMessage(err, ADDRESS_SAVE_ERROR_FALLBACK[locale]));
    } finally {
      setAddressBusy(false);
    }
  }

  async function handleRemoveAddress(id: string) {
    setAddressError(null);
    try {
      await removeAddressMutation({ variables: { id } });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setAddressError(errorMessage(err, ADDRESS_REMOVE_ERROR_FALLBACK[locale]));
    }
  }

  if (!hydrated) {
    return (
      <div className="page">
        <p className="alert alert--muted">{t("common.loading")}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="page">
        <h1 className="page__title">{t("account.title")}</h1>
        <div className="auth-panel">
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={`auth-tab${mode === "login" ? " auth-tab--active" : ""}`}
              onClick={() => setMode("login")}
            >
              {t("account.login")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={`auth-tab${mode === "register" ? " auth-tab--active" : ""}`}
              onClick={() => setMode("register")}
            >
              {t("account.register")}
            </button>
          </div>
          <form className="checkout-form" onSubmit={handleAuthSubmit}>
            {mode === "register" && (
              <div className="field">
                <label htmlFor="name" className="field-label">
                  {t("account.name")}
                </label>
                <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="field">
              <label htmlFor="account-email" className="field-label">
                {t("checkout.email")}
              </label>
              <input
                id="account-email"
                type="email"
                required
                dir="ltr"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="account-password" className="field-label">
                {t("account.password")}
              </label>
              <input
                id="account-password"
                type="password"
                required
                minLength={8}
                dir="ltr"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {authError && (
              <p className="alert alert--error" role="alert">
                {authError}
              </p>
            )}
            <button type="submit" className="button button--primary" disabled={authBusy}>
              {authBusy ? PLEASE_WAIT[locale] : mode === "login" ? t("account.login") : t("account.register")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__eyebrow-row">
        <p className="eyebrow">{t("account.title")}</p>
        <button type="button" className="link-button" onClick={handleLogout}>
          {t("account.logout")}
        </button>
      </div>
      <h1 className="page__title">{profile?.name || profile?.email || t("account.title")}</h1>
      {profileError && (
        <p className="alert alert--error" role="alert">
          {profileError}
        </p>
      )}

      <section className="account-section">
        <h2 className="form-section__heading">{t("account.addresses")}</h2>
        {addresses.length === 0 && !addingAddress && (
          <p className="alert alert--muted">{NO_ADDRESSES[locale]}</p>
        )}
        <ul className="address-list">
          {addresses.map((addr) => (
            <li key={addr.id} className="address-card">
              <p>
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}
              </p>
              <p>
                {addr.city}
                {addr.region ? `, ${addr.region}` : ""} <span className="i18n-ltr">{addr.postal_code ?? ""}</span>
              </p>
              <p>{addr.country}</p>
              <button type="button" className="link-button" onClick={() => handleRemoveAddress(addr.id)}>
                {t("cart.remove")}
              </button>
            </li>
          ))}
        </ul>

        {addingAddress ? (
          <form className="checkout-form" onSubmit={handleAddAddress}>
            <div className="field">
              <label htmlFor="addr-line1" className="field-label">
                {t("checkout.line1")}
              </label>
              <input
                id="addr-line1"
                required
                className="input"
                value={addressForm.line1}
                onChange={(e) => setAddressForm((f) => ({ ...f, line1: e.target.value }))}
              />
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="addr-city" className="field-label">
                  {t("checkout.city")}
                </label>
                <input
                  id="addr-city"
                  required
                  className="input"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="addr-country" className="field-label">
                  {t("checkout.country")}
                </label>
                <input
                  id="addr-country"
                  required
                  dir="ltr"
                  className="input"
                  value={addressForm.country}
                  onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))}
                />
              </div>
            </div>
            {addressError && (
              <p className="alert alert--error" role="alert">
                {addressError}
              </p>
            )}
            <div className="form-actions">
              <button type="submit" className="button button--primary" disabled={addressBusy}>
                {addressBusy ? SAVING[locale] : t("common.save")}
              </button>
              <button type="button" className="button button--secondary" onClick={() => setAddingAddress(false)}>
                {t("common.cancel")}
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="button button--secondary" onClick={() => setAddingAddress(true)}>
            {ADD_ADDRESS[locale]}
          </button>
        )}
      </section>
    </div>
  );
}
