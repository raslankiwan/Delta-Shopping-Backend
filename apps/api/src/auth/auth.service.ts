import { randomBytes } from 'node:crypto';
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import {
  organization,
  refreshToken,
  role,
  staffMembership,
  staffUser,
  store,
  withOrg,
  type DbHandle,
  type Tx,
} from '@mercato/db';
import { uuidv7 } from '@mercato/core';
import { DB_ADMIN_HANDLE, DB_HANDLE } from '../db/database.module';
import { isUniqueViolation } from '../common/pg-errors';
import { hashPassword, verifyPassword } from './password';
import { generateRefreshToken, hashToken, signAccessToken } from './jwt';
import type { Principal } from './principal';
import type { LoginInput, SignupInput } from './dto';

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface Session {
  access: string;
  refresh: string;
  expiresIn: number;
  principal: Principal;
}
@Injectable()
export class AuthService {
  constructor(
    @Inject(DB_HANDLE) private readonly app: DbHandle,
    @Inject(DB_ADMIN_HANDLE) private readonly admin: DbHandle,
  ) {}

  /** Create an organization + owner staff user + Owner role, then start a session. */
  async signup(input: SignupInput): Promise<Session> {
    const passwordHash = await hashPassword(input.password);
    const slug = `${slugify(input.organizationName)}-${randomBytes(3).toString('hex')}`;

    let orgId: string;
    let staffUserId: string;
    try {
      const created = await this.admin.db.transaction(async (tx) => {
        const [org] = await tx
          .insert(organization)
          .values({ name: input.organizationName, slug })
          .returning({ id: organization.id });
        const [su] = await tx
          .insert(staffUser)
          .values({ organizationId: org!.id, email: input.email, passwordHash, name: input.name })
          .returning({ id: staffUser.id });
        const [ownerRole] = await tx
          .insert(role)
          .values({ organizationId: org!.id, name: 'Owner', permissions: ['*'] })
          .returning({ id: role.id });
        await tx.insert(staffMembership).values({
          organizationId: org!.id,
          staffUserId: su!.id,
          storeId: null,
          roleId: ownerRole!.id,
        });
        return { orgId: org!.id, staffUserId: su!.id };
      });
      orgId = created.orgId;
      staffUserId = created.staffUserId;
    } catch (e) {
      if (isUniqueViolation(e)) {
        throw new ConflictException({ code: 'email_taken', detail: 'That email is already registered.' });
      }
      throw e;
    }

    return withOrg(this.app.db, orgId, (tx) => this.issueSession(tx, orgId, staffUserId, uuidv7()));
  }

  async login(input: LoginInput): Promise<Session> {
    const rows = (await this.app.client`
      SELECT * FROM fn_find_staff_by_email(${input.email})
    `) as unknown as Array<{ id: string; organization_id: string; password_hash: string; status: string }>;
    const user = rows[0];
    const invalid = () =>
      new UnauthorizedException({ code: 'invalid_credentials', detail: 'Invalid email or password.' });

    if (!user || user.status !== 'active') {
      // Burn comparable argon2 time so login timing doesn't reveal whether the email exists.
      await hashPassword(input.password);
      throw invalid();
    }
    if (!(await verifyPassword(input.password, user.password_hash))) throw invalid();

    return withOrg(this.app.db, user.organization_id, (tx) =>
      this.issueSession(tx, user.organization_id, user.id, uuidv7()),
    );
  }

  async refresh(rawToken: string): Promise<Session> {
    const hash = hashToken(rawToken);
    const rows = (await this.app.client`
      SELECT * FROM fn_find_refresh_token(${hash})
    `) as unknown as Array<{
      id: string;
      organization_id: string;
      staff_user_id: string;
      family_id: string;
      expires_at: string;
      revoked_at: string | null;
    }>;
    const rec = rows[0];
    if (!rec) throw new UnauthorizedException({ code: 'invalid_token', detail: 'Invalid refresh token.' });

    if (rec.revoked_at) {
      // Reuse of an already-rotated token → revoke the entire family (theft response).
      await withOrg(this.app.db, rec.organization_id, async (tx) => {
        await tx
          .update(refreshToken)
          .set({ revokedAt: new Date() })
          .where(and(eq(refreshToken.familyId, rec.family_id), isNull(refreshToken.revokedAt)));
      });
      throw new UnauthorizedException({
        code: 'token_reuse',
        detail: 'Refresh token reuse detected; the session has been revoked.',
      });
    }
    if (new Date(rec.expires_at).getTime() < Date.now()) {
      throw new UnauthorizedException({ code: 'token_expired', detail: 'Refresh token expired.' });
    }

    return withOrg(this.app.db, rec.organization_id, async (tx) => {
      await tx.update(refreshToken).set({ revokedAt: new Date() }).where(eq(refreshToken.id, rec.id));
      return this.issueSession(tx, rec.organization_id, rec.staff_user_id, rec.family_id);
    });
  }

  async logout(rawToken: string): Promise<void> {
    const hash = hashToken(rawToken);
    const rows = (await this.app.client`
      SELECT * FROM fn_find_refresh_token(${hash})
    `) as unknown as Array<{ organization_id: string; family_id: string }>;
    const rec = rows[0];
    if (!rec) return; // idempotent
    await withOrg(this.app.db, rec.organization_id, async (tx) => {
      await tx
        .update(refreshToken)
        .set({ revokedAt: new Date() })
        .where(and(eq(refreshToken.familyId, rec.family_id), isNull(refreshToken.revokedAt)));
    });
  }

  /**
   * Compute the principal (permissions + accessible stores) from the staff member's
   * memberships/roles, sign an access token, and persist a rotating refresh token.
   * Operates on an already org-bound transaction.
   */
  private async issueSession(tx: Tx, orgId: string, staffUserId: string, familyId: string): Promise<Session> {
    const memberships = await tx
      .select({ storeId: staffMembership.storeId, perms: role.permissions })
      .from(staffMembership)
      .innerJoin(role, eq(staffMembership.roleId, role.id))
      .where(eq(staffMembership.staffUserId, staffUserId));

    const permissions = new Set<string>();
    const storeIds = new Set<string>();
    let orgWide = false;
    for (const m of memberships) {
      for (const p of (m.perms as string[]) ?? []) permissions.add(p);
      if (m.storeId === null) orgWide = true;
      else storeIds.add(m.storeId);
    }
    if (orgWide) {
      const orgStores = await tx.select({ id: store.id }).from(store);
      for (const s of orgStores) storeIds.add(s.id);
    }

    const principal: Principal = {
      userId: staffUserId,
      organizationId: orgId,
      storeIds: [...storeIds],
      permissions: [...permissions],
      type: 'staff',
    };

    const access = await signAccessToken(principal);
    const { token: refresh, hash } = generateRefreshToken();
    await tx.insert(refreshToken).values({
      organizationId: orgId,
      staffUserId,
      tokenHash: hash,
      familyId,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });

    return { access: access.token, refresh, expiresIn: access.expiresIn, principal };
  }
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'org'
  );
}
