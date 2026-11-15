-- Mercato — Commerce core: cart, checkout, orders, payments, fulfillment, refunds.
-- The `orders` table is plural to avoid the SQL reserved word `order`.

-- Configurable per-store tax & shipping (basis points + flat minor units).
ALTER TABLE store ADD COLUMN tax_rate_bps       integer NOT NULL DEFAULT 0;
ALTER TABLE store ADD COLUMN shipping_flat_minor bigint  NOT NULL DEFAULT 0;

CREATE TABLE cart (
  id          uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id    uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customer(id) ON DELETE SET NULL,
  currency    text NOT NULL,
  locale      text,
  status      text NOT NULL DEFAULT 'open',      -- open | completed | abandoned
  expires_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cart_store_idx ON cart (store_id);

CREATE TABLE cart_line (
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id         uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  cart_id          uuid NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  variant_id       uuid NOT NULL REFERENCES product_variant(id) ON DELETE CASCADE,
  quantity         integer NOT NULL,
  unit_price_minor bigint NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cart_line_unique UNIQUE (store_id, cart_id, variant_id)
);
CREATE INDEX cart_line_cart_idx ON cart_line (store_id, cart_id);

-- Per-store monotonic order numbering (atomic upsert-increment).
CREATE TABLE order_counter (
  store_id    uuid PRIMARY KEY REFERENCES store(id) ON DELETE CASCADE,
  next_number integer NOT NULL DEFAULT 1
);

CREATE TABLE orders (
  id                 uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id           uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  number             text NOT NULL,
  customer_id        uuid REFERENCES customer(id) ON DELETE SET NULL,
  email              text NOT NULL,
  currency           text NOT NULL,
  locale             text,
  status             text NOT NULL DEFAULT 'open',        -- open | cancelled
  financial_status   text NOT NULL DEFAULT 'unpaid',      -- unpaid | paid | partially_refunded | refunded
  fulfillment_status text NOT NULL DEFAULT 'unfulfilled', -- unfulfilled | partial | fulfilled
  subtotal_minor     bigint NOT NULL,
  discount_minor     bigint NOT NULL DEFAULT 0,
  tax_minor          bigint NOT NULL DEFAULT 0,
  shipping_minor     bigint NOT NULL DEFAULT 0,
  total_minor        bigint NOT NULL,
  billing_address    jsonb,
  shipping_address   jsonb,
  idempotency_key    text,
  placed_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_number_unique UNIQUE (store_id, number)
);
CREATE INDEX orders_store_placed_idx ON orders (store_id, placed_at);
CREATE INDEX orders_store_status_idx ON orders (store_id, status);
CREATE INDEX orders_store_customer_idx ON orders (store_id, customer_id);
-- Idempotent checkout: the same key never creates two orders in a store.
CREATE UNIQUE INDEX orders_idempotency_unique ON orders (store_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE order_line (
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id         uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  order_id         uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id       uuid REFERENCES product_variant(id) ON DELETE SET NULL,
  sku              text NOT NULL,
  title_snapshot   text NOT NULL,
  quantity         integer NOT NULL,
  unit_price_minor bigint NOT NULL,
  tax_minor        bigint NOT NULL DEFAULT 0,
  total_minor      bigint NOT NULL
);
CREATE INDEX order_line_order_idx ON order_line (store_id, order_id);

CREATE TABLE payment (
  id           uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id     uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider     text NOT NULL,
  provider_ref text,
  amount_minor bigint NOT NULL,
  currency     text NOT NULL,
  status       text NOT NULL,                    -- authorized | captured | failed | refunded
  captured_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payment_order_idx ON payment (store_id, order_id);

CREATE TABLE refund (
  id           uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id     uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id   uuid REFERENCES payment(id) ON DELETE SET NULL,
  amount_minor bigint NOT NULL,
  reason       text,
  status       text NOT NULL DEFAULT 'succeeded',
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refund_order_idx ON refund (store_id, order_id);

CREATE TABLE fulfillment (
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id        uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  order_id        uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  location_id     uuid REFERENCES location(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'pending',
  tracking_number text,
  carrier         text,
  shipped_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fulfillment_order_idx ON fulfillment (store_id, order_id);

CREATE TABLE fulfillment_line (
  id             uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id       uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  fulfillment_id uuid NOT NULL REFERENCES fulfillment(id) ON DELETE CASCADE,
  order_line_id  uuid NOT NULL REFERENCES order_line(id) ON DELETE CASCADE,
  quantity       integer NOT NULL
);
CREATE INDEX fulfillment_line_idx ON fulfillment_line (store_id, fulfillment_id);

-- RLS: store-scoped tenant_isolation on every table above.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['cart','cart_line','order_counter','orders','order_line','payment','refund','fulfillment','fulfillment_line']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (store_id = current_store_id()) WITH CHECK (store_id = current_store_id())',
      t
    );
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO app_user', t);
  END LOOP;
END $$;
