/**
 * Detect a Postgres unique_violation (SQLSTATE 23505). Drizzle wraps driver
 * errors, so the code can sit in the `.cause` chain rather than the top level.
 */
export function isUniqueViolation(e: unknown): boolean {
  let cur: unknown = e;
  for (let i = 0; i < 5 && cur != null; i++) {
    if (typeof cur === 'object' && 'code' in cur && (cur as { code?: unknown }).code === '23505') {
      return true;
    }
    cur = (cur as { cause?: unknown }).cause;
  }
  return false;
}
