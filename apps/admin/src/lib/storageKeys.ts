/**
 * localStorage keys shared between the Apollo client (src/lib/client.ts, which
 * reads them per-request in getHeaders) and the auth store (src/auth/authStore.ts,
 * which writes them). Kept in their own module so neither has to import the other
 * just for these string constants.
 */
export const TOKEN_KEY = "mercato_admin_token";
export const STORE_KEY = "mercato_admin_store_id";
