"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ShieldCheck,
  Truck,
  Store as StoreIcon,
  CreditCard,
} from "lucide-react";
import { Button, Field } from "@delta/ui";
import { displayMoney } from "@delta/domain/commerce";
import type { Cart, Store } from "./types";
import { api, fields } from "./api";
export default function Checkout({
  cart,
  store,
  run,
  onComplete,
}: {
  cart: Cart;
  store: Store;
  run: (fn: () => Promise<void>) => Promise<void>;
  onComplete: () => void;
}) {
  const [quote, setQuote] = useState<any>(null),
    [delivery, setDelivery] = useState("shipping"),
    [method, setMethod] = useState("cod"),
    [coupon, setCoupon] = useState(""),
    [loading, setLoading] = useState(true),
    [address, setAddress] = useState<any>(null);
  const form = useRef<HTMLFormElement>(null);
  const key = useRef("");
  useEffect(() => {
    const stored = sessionStorage.getItem(`checkout-${cart.storeId}`);
    key.current = stored || crypto.randomUUID();
    sessionStorage.setItem(`checkout-${cart.storeId}`, key.current);
    run(async () => {
      const result = await api("profile");
      setAddress(result.profile.addresses?.[0] || null);
    });
  }, [cart.storeId]);
  const refreshQuote = async () => {
    const q = await api("quote", "POST", {
      ...cart,
      delivery,
      coupon,
      address: {
        country: String(new FormData(form.current!).get("country") || "PS"),
      },
    });
    setQuote(q);
    if (!q.codAllowed) setMethod("card");
    setLoading(false);
  };
  useEffect(() => {
    run(refreshQuote);
  }, [delivery]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = fields(e.currentTarget);
    await run(async () => {
      const result = await api("orders", "POST", {
        ...cart,
        address: {
          name: f.name,
          phone: f.phone,
          country: f.country,
          city: f.city,
          street: f.street,
          postalCode: f.postalCode || "",
        },
        notes: f.notes,
        delivery,
        paymentMethod: method,
        coupon,
        idempotencyKey: key.current,
        expectedTotal: quote.total,
        expectedCurrency: quote.currency,
      });
      sessionStorage.removeItem(`checkout-${cart.storeId}`);
      if (result.order.paymentMethod === "card" && result.order.paymentUrl)
        window.location.assign(result.order.paymentUrl);
      else onComplete();
    });
  }
  return (
    <div className="checkout-layout">
      <form ref={form} onSubmit={submit} key={address?.street || "empty"}>
        <div className="eyebrow muted">{store.name}</div>
        <h3>Contact & delivery</h3>
        <div className="form-row">
          <Field
            label="Full name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            defaultValue={address?.name}
          />
          <Field
            label="Phone number"
            name="phone"
            autoComplete="tel"
            required
            minLength={7}
            defaultValue={address?.phone}
          />
        </div>
        <div className="form-row">
          <Field
            label="Country code"
            name="country"
            autoComplete="country"
            pattern="[A-Z]{2}"
            defaultValue={address?.country || "PS"}
            required
            onChange={() => setQuote(null)}
          />
          <Field
            label="City / town"
            name="city"
            autoComplete="address-level2"
            required
            minLength={2}
            defaultValue={address?.city}
          />
        </div>
        <Field
          label="Street address & building"
          name="street"
          autoComplete="street-address"
          required
          minLength={3}
          defaultValue={address?.street}
        />
        <Field
          label="Postal code (optional)"
          name="postalCode"
          autoComplete="postal-code"
          defaultValue={address?.postalCode}
        />
        <h3>Delivery method</h3>
        <div className="delivery-choices">
          <label className={delivery === "shipping" ? "selected" : ""}>
            <input
              type="radio"
              checked={delivery === "shipping"}
              onChange={() => setDelivery("shipping")}
            />
            <Truck size={19} />
            <span>
              Delivery<small>To your address</small>
            </span>
          </label>
          {store.pickupEnabled && (
            <label className={delivery === "pickup" ? "selected" : ""}>
              <input
                type="radio"
                checked={delivery === "pickup"}
                onChange={() => setDelivery("pickup")}
              />
              <StoreIcon size={19} />
              <span>
                Store pickup
                <small>{store.address || "Arrange with the store"}</small>
              </span>
            </label>
          )}
        </div>
        <h3>Payment method</h3>
        {quote?.codAllowed && (
          <label className="check-field">
            <input
              type="radio"
              checked={method === "cod"}
              onChange={() => setMethod("cod")}
            />
            Cash on delivery / pickup
          </label>
        )}
        <label className="check-field">
          <input
            type="radio"
            checked={method === "card"}
            disabled={!quote?.onlinePaymentsReady}
            onChange={() => setMethod("card")}
          />
          <CreditCard size={17} />
          Pay securely by card
        </label>
        {!quote?.onlinePaymentsReady && (
          <p className="form-hint">
            Card payments are awaiting this store’s approved merchant gateway
            setup.
          </p>
        )}
        <label className="field">
          <span>Order notes (optional)</span>
          <textarea name="notes" maxLength={1000} />
        </label>
        <p className="form-hint">
          By placing an order, you agree to this store’s delivery and return
          policies, shown on its storefront.
        </p>
        <Button
          disabled={
            !quote ||
            loading ||
            (method === "card" && !quote.onlinePaymentsReady)
          }
          type="submit"
        >
          {method === "card" ? "Continue to secure payment" : "Place order"}
          <ShieldCheck size={17} />
        </Button>
      </form>
      <aside className="checkout-summary">
        <h3>Your order</h3>
        {quote?.lines.map((l: any) => (
          <div className="summary-line" key={`${l.productId}-${l.variantId}`}>
            <span>
              {l.name}
              <small>
                {l.variant} × {l.quantity}
              </small>
            </span>
            <strong>
              {displayMoney(l.unitPrice * l.quantity, store.currency)}
            </strong>
          </div>
        ))}
        <div className="coupon-input">
          <input
            value={coupon}
            onChange={(e) => {
              setCoupon(e.target.value.toUpperCase());
              setQuote(null);
            }}
            placeholder="Discount code"
            aria-label="Discount code"
          />
          <Button
            className="secondary small"
            type="button"
            onClick={() => run(refreshQuote)}
          >
            Apply / update
          </Button>
        </div>
        {quote ? (
          <div className="totals-list">
            {[
              ["Subtotal", quote.subtotal],
              ["Discount", -quote.discount],
              ["Delivery", quote.shipping],
              ["Tax", quote.tax],
              ["Total", quote.total],
            ].map(([label, n]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{displayMoney(Number(n), quote.currency)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <Button className="secondary small" onClick={() => run(refreshQuote)}>
            Review current total
          </Button>
        )}
        <p className="form-hint">
          <ShieldCheck size={14} /> Totals are verified by the server. Payment
          details are handled by the approved payment provider.
        </p>
        <details>
          <summary>Shipping policy</summary>
          <p>
            {store.shippingPolicy || "Contact the store for delivery details."}
          </p>
        </details>
        <details>
          <summary>Return policy</summary>
          <p>
            {store.returnPolicy ||
              `${store.returnsDays}-day return request window after delivery.`}
          </p>
        </details>
      </aside>
    </div>
  );
}
