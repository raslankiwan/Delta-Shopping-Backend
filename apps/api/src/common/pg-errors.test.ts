import { describe, expect, test } from 'bun:test';
import { isUniqueViolation } from './pg-errors';

describe('isUniqueViolation', () => {
  test('finds SQLSTATE 23505 at the top level', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true);
  });

  test('finds it in the cause chain Drizzle wraps around driver errors', () => {
    const driverError = { code: '23505' };
    const wrapped = new Error('Failed query', { cause: new Error('wrapper', { cause: driverError }) });
    expect(isUniqueViolation(wrapped)).toBe(true);
  });

  test('ignores other errors and non-errors', () => {
    expect(isUniqueViolation({ code: '23503' })).toBe(false);
    expect(isUniqueViolation(new Error('boom'))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation('23505')).toBe(false);
  });
});
