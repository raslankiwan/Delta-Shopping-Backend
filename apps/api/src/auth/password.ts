/**
 * Password hashing via Bun's built-in argon2id (no external dependency).
 * Hashing/verification are memory-hard and constant-time by construction.
 */
export function hashPassword(plain: string): Promise<string> {
  return Bun.password.hash(plain, { algorithm: 'argon2id' });
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return Bun.password.verify(plain, hash);
}
