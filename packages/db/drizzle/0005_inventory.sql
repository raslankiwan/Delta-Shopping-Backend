-- Mercato — Inventory (single/multi-location stock with reservations + movement audit).

CREATE TABLE location (
  id         uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id   uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  name       text NOT NULL,
  address    jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX location_store_idx ON location (store_id);

CREATE TABLE inventory_item (
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id         uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  variant_id       uuid NOT NULL REFERENCES product_variant(id) ON DELETE CASCADE,
  location_id      uuid NOT NULL REFERENCES location(id) ON DELETE CASCADE,
  on_hand          integer NOT NULL DEFAULT 0,
  reserved         integer NOT NULL DEFAULT 0,
  reorder_point    integer NOT NULL DEFAULT 0,
  backorder_policy text NOT NULL DEFAULT 'deny',   -- deny | allow
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inventory_item_unique UNIQUE (store_id, variant_id, location_id)
);
CREATE INDEX inventory_item_variant_idx ON inventory_item (store_id, variant_id);

CREATE TABLE inventory_movement (
  id                uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id          uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  inventory_item_id uuid NOT NULL REFERENCES inventory_item(id) ON DELETE CASCADE,
  delta             integer NOT NULL,
  reason            text NOT NULL,             -- adjustment | reservation | commit | release
  reference_type    text,
  reference_id      uuid,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inventory_movement_item_idx ON inventory_movement (store_id, inventory_item_id);

ALTER TABLE location ENABLE ROW LEVEL SECURITY;
ALTER TABLE location FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON location
  USING (store_id = current_store_id()) WITH CHECK (store_id = current_store_id());

ALTER TABLE inventory_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_item FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON inventory_item
  USING (store_id = current_store_id()) WITH CHECK (store_id = current_store_id());

ALTER TABLE inventory_movement ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movement FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON inventory_movement
  USING (store_id = current_store_id()) WITH CHECK (store_id = current_store_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON location, inventory_item, inventory_movement TO app_user;
