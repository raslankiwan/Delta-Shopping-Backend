-- Mercato — Customers & accounts (store-scoped shopper accounts + addresses).
-- Same email may exist as a customer in multiple stores independently.

CREATE TABLE customer (
  id                uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id          uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  email             text NOT NULL,
  password_hash     text,                       -- NULL for guest/passwordless
  name              text,
  locale            text,
  accepts_marketing boolean NOT NULL DEFAULT false,
  status            text NOT NULL DEFAULT 'active',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_store_email_unique UNIQUE (store_id, email)
);
CREATE INDEX customer_store_idx ON customer (store_id);

CREATE TABLE address (
  id          uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id    uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
  name        text,
  line1       text NOT NULL,
  line2       text,
  city        text NOT NULL,
  region      text,
  postal_code text,
  country     text NOT NULL,
  phone       text,
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX address_store_customer_idx ON address (store_id, customer_id);

ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON customer
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

ALTER TABLE address ENABLE ROW LEVEL SECURITY;
ALTER TABLE address FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON address
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON customer, address TO app_user;
