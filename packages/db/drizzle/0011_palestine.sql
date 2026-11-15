-- Mercato — Palestine (West Bank) logistics: governorate on addresses and
-- per-governorate shipping zones (flat rate + COD availability).

ALTER TABLE address ADD COLUMN governorate text;
-- Palestine is the primary market; default new addresses to PS.
ALTER TABLE address ALTER COLUMN country SET DEFAULT 'PS';

CREATE TABLE shipping_zone (
  id            uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id      uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  governorate   text NOT NULL,          -- governorate code (WEST_BANK_GOVERNORATES)
  name          text NOT NULL,
  rate_minor    bigint NOT NULL DEFAULT 0,
  cod_available boolean NOT NULL DEFAULT true,
  eta_days      integer,
  enabled       boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX shipping_zone_governorate_unique ON shipping_zone (store_id, governorate);
CREATE INDEX shipping_zone_store_idx ON shipping_zone (store_id);

ALTER TABLE shipping_zone ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zone FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON shipping_zone
  USING (store_id = current_store_id()) WITH CHECK (store_id = current_store_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON shipping_zone TO app_user;
