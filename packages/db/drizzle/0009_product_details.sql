-- Mercato — Product details: images, richer product fields, compare-at pricing.
-- Options/variants already exist (product_option, product_option_value,
-- product_variant.option_values); this adds media + merchandising fields.

ALTER TABLE product ADD COLUMN vendor          text;
ALTER TABLE product ADD COLUMN tags            text[] NOT NULL DEFAULT '{}';
ALTER TABLE product ADD COLUMN subtitle        text;
ALTER TABLE product ADD COLUMN seo_title       text;
ALTER TABLE product ADD COLUMN seo_description text;

-- Optional "was" price per variant for showing discounts / strikethrough.
ALTER TABLE price ADD COLUMN compare_at_amount_minor bigint;

CREATE TABLE product_image (
  id         uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id   uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variant(id) ON DELETE SET NULL,  -- variant-specific image (optional)
  url        text NOT NULL,
  alt        text,
  position   integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_image_product_idx ON product_image (store_id, product_id);

ALTER TABLE product_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_image FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON product_image
  USING (store_id = current_store_id()) WITH CHECK (store_id = current_store_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON product_image TO app_user;
