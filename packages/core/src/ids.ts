/**
 * UUIDv7 — time-ordered identifiers.
 *
 * The database is the primary source of ids via Postgres 18's native `uuidv7()`
 * default. This helper exists for the occasional app-side id (idempotency keys,
 * pre-generated references) so ids stay time-ordered and index-friendly everywhere.
 */
export function uuidv7(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);

  // 48-bit big-endian millisecond timestamp
  bytes[0] = (now / 2 ** 40) & 0xff;
  bytes[1] = (now / 2 ** 32) & 0xff;
  bytes[2] = (now / 2 ** 24) & 0xff;
  bytes[3] = (now / 2 ** 16) & 0xff;
  bytes[4] = (now / 2 ** 8) & 0xff;
  bytes[5] = now & 0xff;

  // 74 bits of randomness fill the rest
  const rand = new Uint8Array(10);
  crypto.getRandomValues(rand);
  bytes.set(rand, 6);

  // version 7 in the high nibble of byte 6
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  // variant 10xx in the high bits of byte 8
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex: string[] = [];
  for (let i = 0; i < 16; i++) hex.push(bytes[i]!.toString(16).padStart(2, '0'));
  return (
    hex.slice(0, 4).join('') +
    '-' +
    hex.slice(4, 6).join('') +
    '-' +
    hex.slice(6, 8).join('') +
    '-' +
    hex.slice(8, 10).join('') +
    '-' +
    hex.slice(10, 16).join('')
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
