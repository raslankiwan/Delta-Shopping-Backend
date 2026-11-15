-- Mercato — Row-Level Security. THE isolation mechanism.
--
-- Every tenant table gets ENABLE + FORCE RLS and a default-deny `tenant_isolation`
-- policy keyed to current_store_id(). With no permissive policy nothing is visible,
-- so a missing binding (or a missing WHERE clause, or SQL injection) matches no rows.
-- The application role `app_user` has NO BYPASSRLS, so it can never escape these.
-- `app_owner` (migrations/seeds/tests) has BYPASSRLS and is intentionally exempt.

-- Reusable policy body: a business table isolated by store_id.
-- (Written out per-table for clarity and so the CI check can verify each one.)

-- store: a store may see only itself (isolation column is `id`).
ALTER TABLE store ENABLE ROW LEVEL SECURITY;
ALTER TABLE store FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON store
  USING (id = current_store_id())
  WITH CHECK (id = current_store_id());

-- organization: visible only if it owns the current store (derived scope).
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON organization
  USING (id = (SELECT s.organization_id FROM store s WHERE s.id = current_store_id()));

-- store_locale
ALTER TABLE store_locale ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_locale FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON store_locale
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

-- store_currency
ALTER TABLE store_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_currency FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON store_currency
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

-- product
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE product FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON product
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

-- product_option
ALTER TABLE product_option ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON product_option
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

-- product_option_value
ALTER TABLE product_option_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_value FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON product_option_value
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

-- product_variant
ALTER TABLE product_variant ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON product_variant
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

-- price_list
ALTER TABLE price_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_list FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON price_list
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

-- price
ALTER TABLE price ENABLE ROW LEVEL SECURITY;
ALTER TABLE price FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON price
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

-- translation
ALTER TABLE translation ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON translation
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

-- ---------------------------------------------------------------------------
-- Grants for the application role (RLS still constrains which ROWS it may touch).
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT EXECUTE ON FUNCTION current_store_id() TO app_user;
