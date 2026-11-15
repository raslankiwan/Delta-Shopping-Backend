import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import type { Principal } from './principal';

const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET ?? 'dev-insecure-secret-change-me';
  return new TextEncoder().encode(s);
}

export interface AccessTokenResult {
  token: string;
  expiresIn: number;
}

export async function signAccessToken(principal: Principal): Promise<AccessTokenResult> {
  const token = await new SignJWT({
    org: principal.organizationId,
    stores: principal.storeIds,
    perms: principal.permissions,
    type: principal.type,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(principal.userId)
    .setIssuedAt()
    .setIssuer('mercato')
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(secret());
  return { token, expiresIn: ACCESS_TTL_SECONDS };
}

export async function verifyAccessToken(token: string): Promise<Principal> {
  const { payload } = await jwtVerify(token, secret(), { issuer: 'mercato' });
  return {
    userId: String(payload.sub),
    organizationId: String(payload.org),
    storeIds: Array.isArray(payload.stores) ? (payload.stores as string[]) : [],
    permissions: Array.isArray(payload.perms) ? (payload.perms as string[]) : [],
    type: 'staff',
  };
}

const CUSTOMER_TTL_SECONDS = 12 * 60 * 60; // 12 hours

export interface CustomerToken {
  customerId: string;
  storeId: string;
}

export async function signCustomerToken(c: CustomerToken): Promise<AccessTokenResult> {
  const token = await new SignJWT({ store: c.storeId, type: 'customer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(c.customerId)
    .setIssuedAt()
    .setIssuer('mercato')
    .setExpirationTime(`${CUSTOMER_TTL_SECONDS}s`)
    .sign(secret());
  return { token, expiresIn: CUSTOMER_TTL_SECONDS };
}

export async function verifyCustomerToken(token: string): Promise<CustomerToken> {
  const { payload } = await jwtVerify(token, secret(), { issuer: 'mercato' });
  if (payload.type !== 'customer') throw new Error('not a customer token');
  return { customerId: String(payload.sub), storeId: String(payload.store) };
}

/** An opaque refresh token (returned to the client) plus the hash we persist. */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
