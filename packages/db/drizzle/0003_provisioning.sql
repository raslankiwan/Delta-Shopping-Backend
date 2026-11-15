-- Mercato — Provisioning: let an organization-bound owner create and update their
-- own stores (org-level admin), complementing the store-self policies.
--
-- Reads already work via store_org_read (0002). These add INSERT/UPDATE under
-- organization context so POST/PATCH /admin/stores can run as app_user (RLS),
-- not the privileged role.

CREATE POLICY store_org_insert ON store FOR INSERT
  WITH CHECK (organization_id = current_organization_id());

CREATE POLICY store_org_update ON store FOR UPDATE
  USING (organization_id = current_organization_id())
  WITH CHECK (organization_id = current_organization_id());
