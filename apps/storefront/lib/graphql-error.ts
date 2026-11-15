import { ApolloError } from "@apollo/client";

/**
 * Extracts the server's `extensions.code` from the first GraphQL error, if
 * any — used to branch on specific failures (e.g. "cart_not_found") the way
 * the old REST layer branched on `ApiError.status`.
 */
export function errorCode(err: unknown): string | undefined {
  if (!(err instanceof ApolloError)) return undefined;
  const first = err.graphQLErrors[0];
  const code = (first?.extensions as { code?: unknown } | undefined)?.code;
  return typeof code === "string" ? code : undefined;
}

/**
 * Human-readable message for a failed query/mutation, falling back to a
 * locale string when the server didn't send one (network errors, etc).
 * Mirrors the old `ApiError.message` fallback pattern used throughout the UI.
 */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApolloError) {
    const first = err.graphQLErrors[0];
    const detail = (first?.extensions as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string" && detail) return detail;
    if (first?.message) return first.message;
  }
  return fallback;
}
