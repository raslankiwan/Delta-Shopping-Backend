import { createMercatoClient } from "@mercato/graphql";
import { STORE_KEY, TOKEN_KEY } from "./storageKeys";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:9000/v1";

/** GraphQL lives at the API origin's `/graphql`, not under the REST `/v1` prefix. */
function toGraphqlUri(apiUrl: string): string {
  return apiUrl.replace(/\/v1\/?$/, "") + "/graphql";
}

export const GRAPHQL_URI = toGraphqlUri(API_URL);

/**
 * Single shared Apollo client instance for the whole app. `getHeaders` is
 * invoked fresh on every request, so it just reads the current token/store id
 * straight out of localStorage — a login or store switch (which write those
 * keys, see src/auth/authStore.ts) is picked up automatically without any
 * imperative "setToken" step.
 */
export const apolloClient = createMercatoClient({
  uri: GRAPHQL_URI,
  getHeaders: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storeId = localStorage.getItem(STORE_KEY);
    return {
      Authorization: token ? `Bearer ${token}` : undefined,
      "X-Store-Id": storeId ?? undefined,
    };
  },
});

export { API_URL };
