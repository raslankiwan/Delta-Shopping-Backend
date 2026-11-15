-- Mercato — Product taxonomy: type (physical/digital/service), categories,
-- and service metadata. Enables a mixed catalog of goods, digital items, and
-- bookable services, plus category-based merchandising.

-- Category tree (one level of nesting via parent_id).
CREATE TABLE category (
  id         uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id   uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  slug       text NOT NULL,
  name       text NOT NULL,
  parent_id  uuid,
  position   integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX category_slug_unique ON category (store_id, slug);
CREATE INDEX category_store_idx ON category (store_id);

ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE category FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON category
  USING (store_id = current_store_id()) WITH CHECK (store_id = current_store_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON category TO app_user;

-- Product taxonomy columns.
ALTER TABLE product ADD COLUMN type                     text    NOT NULL DEFAULT 'physical';
ALTER TABLE product ADD COLUMN requires_shipping        boolean NOT NULL DEFAULT true;
ALTER TABLE product ADD COLUMN category_id              uuid REFERENCES category(id) ON DELETE SET NULL;
ALTER TABLE product ADD COLUMN service_duration_minutes integer;
ALTER TABLE product ADD COLUMN service_location         text;

CREATE INDEX product_store_category_idx ON product (store_id, category_id);
