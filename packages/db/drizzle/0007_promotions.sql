-- Mercato — Promotions (MVP: discount codes; automatic promotions engine is P2).

CREATE TABLE promotion (
  id         uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id   uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  name       text NOT NULL,
  type       text NOT NULL DEFAULT 'code',      -- code | automatic (P2)
  rules      jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions    jsonb NOT NULL,                     -- { type: percentage|fixed|free_shipping, value }
  priority   integer NOT NULL DEFAULT 0,
  stackable  boolean NOT NULL DEFAULT false,
  starts_at  timestamptz,
  ends_at    timestamptz,
  status     text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX promotion_store_idx ON promotion (store_id);

CREATE TABLE discount_code (
  id                 uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id           uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  promotion_id       uuid NOT NULL REFERENCES promotion(id) ON DELETE CASCADE,
  code               text NOT NULL,
  usage_limit        integer,
  per_customer_limit integer,
  used_count         integer NOT NULL DEFAULT 0,
  status             text NOT NULL DEFAULT 'active',
  created_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT discount_code_unique UNIQUE (store_id, code)
);
CREATE INDEX discount_code_store_idx ON discount_code (store_id);

-- A cart may carry one applied discount code.
ALTER TABLE cart ADD COLUMN discount_code_id uuid REFERENCES discount_code(id) ON DELETE SET NULL;

ALTER TABLE promotion ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON promotion
  USING (store_id = current_store_id()) WITH CHECK (store_id = current_store_id());

ALTER TABLE discount_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON discount_code
  USING (store_id = current_store_id()) WITH CHECK (store_id = current_store_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON promotion, discount_code TO app_user;
