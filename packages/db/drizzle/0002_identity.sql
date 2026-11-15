-- Mercato — Identity & Access (staff auth, RBAC, API keys, audit log).
--
-- Introduces ORGANIZATION-scoped tenancy alongside the store-scoped model:
-- staff/roles/memberships/refresh-tokens are isolated by organization_id via
-- current_organization_id(); api_key and audit_log are store-scoped as usual.
--
-- Pre-auth lookups (login, refresh) can't have a tenant bound yet, so they go
-- through narrow SECURITY DEFINER functions that match a single email / token
-- hash and return minimal fields — never enumeration.

-- Organization tenant-context helper (mirrors current_store_id()).
CREATE OR REPLACE FUNCTION current_organization_id() RETURNS uuid
  LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_organization_id', true), '')::uuid
$$;

-- ---------------------------------------------------------------------------
-- Org-scoped identity tables
-- ---------------------------------------------------------------------------

CREATE TABLE staff_user (
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  email           text NOT NULL,
  password_hash   text NOT NULL,
  name            text NOT NULL,
  status          text NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_user_email_unique UNIQUE (email)   -- globally unique: one login per person
);
CREATE INDEX staff_user_org_idx ON staff_user (organization_id);

CREATE TABLE role (
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  name            text NOT NULL,
  permissions     jsonb NOT NULL DEFAULT '[]'::jsonb,   -- e.g. ["catalog:write","orders:read"] or ["*"]
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT role_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE staff_membership (
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  staff_user_id   uuid NOT NULL REFERENCES staff_user(id) ON DELETE CASCADE,
  store_id        uuid REFERENCES store(id) ON DELETE CASCADE,   -- NULL = org-wide (all stores)
  role_id         uuid NOT NULL REFERENCES role(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX staff_membership_org_idx ON staff_membership (organization_id);
CREATE INDEX staff_membership_user_idx ON staff_membership (organization_id, staff_user_id);

CREATE TABLE refresh_token (
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  staff_user_id   uuid NOT NULL REFERENCES staff_user(id) ON DELETE CASCADE,
  token_hash      text NOT NULL UNIQUE,
  family_id       uuid NOT NULL,          -- rotating family; reuse of a revoked token kills the family
  expires_at      timestamptz NOT NULL,
  revoked_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refresh_token_user_idx ON refresh_token (organization_id, staff_user_id);

-- ---------------------------------------------------------------------------
-- Store-scoped access tables
-- ---------------------------------------------------------------------------

CREATE TABLE api_key (
  id           uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id     uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  name         text NOT NULL,
  hashed_key   text NOT NULL UNIQUE,
  scopes       jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_used_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX api_key_store_idx ON api_key (store_id);

CREATE TABLE audit_log (
  id            uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id      uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  actor_user_id uuid,
  action        text NOT NULL,
  entity        text NOT NULL,
  entity_id     uuid,
  before        jsonb,
  after         jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_store_idx ON audit_log (store_id, created_at);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

-- Org-scoped tables
ALTER TABLE staff_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_user FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON staff_user
  USING (organization_id = current_organization_id())
  WITH CHECK (organization_id = current_organization_id());

ALTER TABLE role ENABLE ROW LEVEL SECURITY;
ALTER TABLE role FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON role
  USING (organization_id = current_organization_id())
  WITH CHECK (organization_id = current_organization_id());

ALTER TABLE staff_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_membership FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON staff_membership
  USING (organization_id = current_organization_id())
  WITH CHECK (organization_id = current_organization_id());

ALTER TABLE refresh_token ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_token FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON refresh_token
  USING (organization_id = current_organization_id())
  WITH CHECK (organization_id = current_organization_id());

-- Org-scoped READ access to the org's own stores and organization row.
-- Permissive SELECT policies are OR'd with the existing self-scoped policies, so a
-- store still sees itself when store-bound, and an org sees all its stores when
-- org-bound (needed to compute a staff member's accessible stores at login, and
-- for cross-store org roll-ups later).
CREATE POLICY store_org_read ON store FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY org_self_read ON organization FOR SELECT
  USING (id = current_organization_id());

-- Store-scoped tables
ALTER TABLE api_key ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON api_key
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit_log
  USING (store_id = current_store_id())
  WITH CHECK (store_id = current_store_id());

-- ---------------------------------------------------------------------------
-- Pre-auth lookups (SECURITY DEFINER, owned by app_owner → bypass RLS narrowly)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_find_staff_by_email(p_email text)
  RETURNS TABLE (id uuid, organization_id uuid, password_hash text, name text, status text)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT id, organization_id, password_hash, name, status
  FROM staff_user
  WHERE email = p_email
$$;

CREATE OR REPLACE FUNCTION fn_find_refresh_token(p_hash text)
  RETURNS TABLE (id uuid, organization_id uuid, staff_user_id uuid, family_id uuid,
                 expires_at timestamptz, revoked_at timestamptz)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT id, organization_id, staff_user_id, family_id, expires_at, revoked_at
  FROM refresh_token
  WHERE token_hash = p_hash
$$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON staff_user, role, staff_membership, refresh_token, api_key, audit_log TO app_user;
GRANT EXECUTE ON FUNCTION current_organization_id() TO app_user;
GRANT EXECUTE ON FUNCTION fn_find_staff_by_email(text) TO app_user;
GRANT EXECUTE ON FUNCTION fn_find_refresh_token(text) TO app_user;
