import { ApolloError } from "@apollo/client";

/**
 * NestJS's GraphQL driver maps a thrown HttpException into a GraphQLError
 * whose `extensions.code` is the Apollo-standard string (e.g. "UNAUTHENTICATED"
 * for a 401) and whose `extensions.originalError` carries the exception's
 * response body — here always `{ code, detail }`, mirroring the REST
 * problem+json shape. We read both the top-level `code`/`detail` and the
 * nested `originalError.code`/`originalError.detail` so this keeps working
 * regardless of exactly how a given error was raised.
 */
interface KnownExtensions {
  code?: string;
  detail?: string;
  originalError?: { code?: string; detail?: string; message?: string | string[] };
}

function extensionsOf(err: ApolloError): KnownExtensions | undefined {
  return err.graphQLErrors[0]?.extensions as KnownExtensions | undefined;
}

/** Extracts a human-readable message from anything a query/mutation might throw. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof ApolloError) {
    const ext = extensionsOf(err);
    if (ext?.detail) return ext.detail;
    if (ext?.originalError?.detail) return ext.originalError.detail;
    const originalMessage = ext?.originalError?.message;
    if (typeof originalMessage === "string") return originalMessage;
    if (Array.isArray(originalMessage) && originalMessage.length > 0) return originalMessage.join(", ");
    if (err.graphQLErrors[0]?.message) return err.graphQLErrors[0].message;
    if (err.networkError) return "Network error. Please check your connection and try again.";
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Something went wrong.";
}

const SESSION_ERROR_CODES = new Set(["UNAUTHENTICATED", "unauthenticated", "invalid_token"]);

/** True for auth failures — callers use this to bounce back to /login. */
export function isSessionError(err: unknown): boolean {
  if (!(err instanceof ApolloError)) return false;
  return err.graphQLErrors.some((gqlErr) => {
    const ext = gqlErr.extensions as KnownExtensions | undefined;
    if (ext?.code && SESSION_ERROR_CODES.has(ext.code)) return true;
    if (ext?.originalError?.code && SESSION_ERROR_CODES.has(ext.originalError.code)) return true;
    return false;
  });
}
