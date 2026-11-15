import { index, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { createdAt, primaryId, storeIdColumn, timestamps } from './_shared';
import { organization, store } from './platform';

const orgRef = () =>
  uuid('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' });

const storeRef = () => storeIdColumn().references(() => store.id, { onDelete: 'cascade' });

/** A person who logs into the admin. Belongs to one organization. Email is global. */
export const staffUser = pgTable(
  'staff_user',
  {
    id: primaryId(),
    organizationId: orgRef(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    status: text('status').notNull().default('active'),
    ...timestamps,
  },
  (t) => [unique('staff_user_email_unique').on(t.email), index('staff_user_org_idx').on(t.organizationId)],
);

/** A named permission set within an org, e.g. Owner (["*"]) or "Catalog editor". */
export const role = pgTable(
  'role',
  {
    id: primaryId(),
    organizationId: orgRef(),
    name: text('name').notNull(),
    permissions: jsonb('permissions').notNull().default([]),
    createdAt: createdAt(),
  },
  (t) => [unique('role_org_name_unique').on(t.organizationId, t.name)],
);

/** Grants a role to a staff user, optionally scoped to a store (NULL = org-wide). */
export const staffMembership = pgTable(
  'staff_membership',
  {
    id: primaryId(),
    organizationId: orgRef(),
    staffUserId: uuid('staff_user_id')
      .notNull()
      .references(() => staffUser.id, { onDelete: 'cascade' }),
    storeId: uuid('store_id').references(() => store.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [
    index('staff_membership_org_idx').on(t.organizationId),
    index('staff_membership_user_idx').on(t.organizationId, t.staffUserId),
  ],
);

/** Rotating refresh tokens (hashed). Reuse of a revoked token revokes the family. */
export const refreshToken = pgTable(
  'refresh_token',
  {
    id: primaryId(),
    organizationId: orgRef(),
    staffUserId: uuid('staff_user_id')
      .notNull()
      .references(() => staffUser.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    familyId: uuid('family_id').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index('refresh_token_user_idx').on(t.organizationId, t.staffUserId)],
);

/** Store-scoped API key for integrations. */
export const apiKey = pgTable(
  'api_key',
  {
    id: primaryId(),
    storeId: storeRef(),
    name: text('name').notNull(),
    hashedKey: text('hashed_key').notNull().unique(),
    scopes: jsonb('scopes').notNull().default([]),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index('api_key_store_idx').on(t.storeId)],
);

/** Store-scoped immutable record of admin mutations. */
export const auditLog = pgTable(
  'audit_log',
  {
    id: primaryId(),
    storeId: storeRef(),
    actorUserId: uuid('actor_user_id'),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: uuid('entity_id'),
    before: jsonb('before'),
    after: jsonb('after'),
    createdAt: createdAt(),
  },
  (t) => [index('audit_log_store_idx').on(t.storeId, t.createdAt)],
);

export type StaffUser = typeof staffUser.$inferSelect;
export type Role = typeof role.$inferSelect;
export type StaffMembership = typeof staffMembership.$inferSelect;
export type ApiKey = typeof apiKey.$inferSelect;
export type AuditLog = typeof auditLog.$inferSelect;
