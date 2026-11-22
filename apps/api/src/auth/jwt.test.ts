import { describe, expect, test } from 'bun:test';
import {
  generateRefreshToken,
  hashToken,
  signAccessToken,
  signCustomerToken,
  verifyAccessToken,
  verifyCustomerToken,
} from './jwt';
import { hasPermission, type Principal } from './principal';

const staff: Principal = {
  userId: 'user-1',
  organizationId: 'org-1',
  storeIds: ['store-a', 'store-b'],
  permissions: ['catalog:write'],
  type: 'staff',
};

describe('staff access tokens', () => {
  test('round-trip the principal', async () => {
    const { token, expiresIn } = await signAccessToken(staff);
    expect(expiresIn).toBe(15 * 60);
    expect(await verifyAccessToken(token)).toEqual(staff);
  });

  test('reject a tampered token', async () => {
    const { token } = await signAccessToken(staff);
    const [header, , signature] = token.split('.');
    const forged = Buffer.from(
      JSON.stringify({ sub: 'user-1', org: 'org-1', stores: ['*'], perms: ['*'], iss: 'mercato' }),
    ).toString('base64url');
    await expect(verifyAccessToken(`${header}.${forged}.${signature}`)).rejects.toThrow();
  });
});

describe('customer tokens', () => {
  test('round-trip the customer and store', async () => {
    const { token } = await signCustomerToken({ customerId: 'cust-1', storeId: 'store-a' });
    expect(await verifyCustomerToken(token)).toEqual({ customerId: 'cust-1', storeId: 'store-a' });
  });

  test('a staff token is not accepted as a customer token', async () => {
    const { token } = await signAccessToken(staff);
    await expect(verifyCustomerToken(token)).rejects.toThrow('not a customer token');
  });
});

describe('refresh tokens', () => {
  test('only the hash of the token is meant to be stored', () => {
    const { token, hash } = generateRefreshToken();
    expect(hash).toBe(hashToken(token));
    expect(hash).not.toContain(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  test('every token is different', () => {
    expect(generateRefreshToken().token).not.toBe(generateRefreshToken().token);
  });
});

describe('hasPermission', () => {
  test('grants listed permissions only', () => {
    expect(hasPermission(staff, 'catalog:write')).toBe(true);
    expect(hasPermission(staff, 'orders:refund')).toBe(false);
  });

  test('the wildcard grants everything', () => {
    expect(hasPermission({ ...staff, permissions: ['*'] }, 'orders:refund')).toBe(true);
  });
});
