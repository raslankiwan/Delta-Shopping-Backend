-- Mercato — catalog-slice schema (Phase 0 + catalog vertical slice).
-- Applied by the migrate runner as role `app_owner`. Table DDL mirrors the Drizzle
-- schema in src/schema/*. RLS is layered in 0001_rls.sql.
--
-- Every tenant table foreign-keys its store_id to store(id) ON DELETE CASCADE, so
-- deleting a store (or its organization) removes all of its data — the basis for
-- per-tenant hard-delete / GDPR erasure. Child rows cascade from their parents too.

-- Tenant context helper: reads the per-transaction store binding set by withStore().
-- STABLE + fail-closed (NULL when unset) so a missing binding matches no rows.
CREATE OR REPLACE FUNCTION current_store_id() RETURNS uuid
  LANGUAGE sql
  STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_store_id', true), '')::uuid
$$;

-- ---------------------------------------------------------------------------
-- Platform & tenancy
-- ---------------------------------------------------------------------------

CREATE TABLE organization (
  id             uuid PRIMARY KEY DEFAULT uuidv7(),
  name           text NOT NULL,
  slug           text NOT NULL UNIQUE,
  plan           text NOT NULL DEFAULT 'trial',
  billing_status text NOT NULL DEFAULT 'active',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE store (
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  organization_id  uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  slug             text NOT NULL,
  primary_domain   text,
  name             text NOT NULL,
  default_locale   text NOT NULL DEFAULT 'en',
  default_currency text NOT NULL DEFAULT 'USD',
  timezone         text NOT NULL DEFAULT 'UTC',
  status           text NOT NULL DEFAULT 'active',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_slug_unique UNIQUE (slug),
  CONSTRAINT store_primary_domain_unique UNIQUE (primary_domain)
);
CREATE INDEX store_organization_idx ON store (organization_id);

CREATE TABLE store_locale (
  id         uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id   uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  locale     text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  enabled    boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_locale_unique UNIQUE (store_id, locale)
);
CREATE INDEX store_locale_store_idx ON store_locale (store_id);

CREATE TABLE store_currency (
  id            uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id      uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  currency      text NOT NULL,
  is_default    boolean NOT NULL DEFAULT false,
  enabled       boolean NOT NULL DEFAULT true,
  rounding_rule text NOT NULL DEFAULT 'none',
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_currency_unique UNIQUE (store_id, currency)
);
CREATE INDEX store_currency_store_idx ON store_currency (store_id);

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

CREATE TABLE product (
  id          uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id    uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  slug        text NOT NULL,
  title       text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'draft',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_slug_unique UNIQUE (store_id, slug)
);
CREATE INDEX product_store_status_idx ON product (store_id, status);
-- Postgres FTS (MVP search). 'simple' config keeps it language-agnostic across stores.
CREATE INDEX product_fts_idx ON product
  USING gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));

CREATE TABLE product_option (
  id         uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id   uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  name       text NOT NULL,
  position   integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_option_store_product_idx ON product_option (store_id, product_id);

CREATE TABLE product_option_value (
  id         uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id   uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  option_id  uuid NOT NULL REFERENCES product_option(id) ON DELETE CASCADE,
  value      text NOT NULL,
  position   integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_option_value_store_option_idx ON product_option_value (store_id, option_id);

CREATE TABLE product_variant (
  id            uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id      uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  sku           text NOT NULL,
  barcode       text,
  option_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  weight_grams  integer,
  position      integer NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT variant_sku_unique UNIQUE (store_id, sku)
);
CREATE INDEX variant_store_product_idx ON product_variant (store_id, product_id);

-- ---------------------------------------------------------------------------
-- Pricing
-- ---------------------------------------------------------------------------

CREATE TABLE price_list (
  id         uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id   uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  name       text NOT NULL,
  currency   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX price_list_store_currency_idx ON price_list (store_id, currency);

CREATE TABLE price (
  id            uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id      uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  price_list_id uuid NOT NULL REFERENCES price_list(id) ON DELETE CASCADE,
  variant_id    uuid NOT NULL REFERENCES product_variant(id) ON DELETE CASCADE,
  amount_minor  bigint NOT NULL,
  min_quantity  integer NOT NULL DEFAULT 1,
  starts_at     timestamptz,
  ends_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX price_store_variant_idx ON price (store_id, variant_id);
CREATE INDEX price_store_list_idx ON price (store_id, price_list_id);

-- ---------------------------------------------------------------------------
-- i18n / content
-- ---------------------------------------------------------------------------

CREATE TABLE translation (
  id          uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id    uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id   uuid NOT NULL,
  field       text NOT NULL,
  locale      text NOT NULL,
  value       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT translation_unique UNIQUE (store_id, entity_type, entity_id, field, locale)
);
CREATE INDEX translation_lookup_idx ON translation (store_id, entity_type, entity_id, locale);
