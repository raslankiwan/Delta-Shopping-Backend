"use client";

import { createMercatoClient } from "@mercato/graphql";
import type { ApolloClient, NormalizedCacheObject } from "@apollo/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/v1";
// The GraphQL endpoint lives at the API origin, not under the REST "/v1" prefix.
const GRAPHQL_URL = `${API_URL.replace(/\/v1$/, "")}/graphql`;
const STORE_ID = process.env.NEXT_PUBLIC_DEMO_STORE_ID;

/** localStorage key for the logged-in customer's session token. */
export const CUSTOMER_TOKEN_KEY = "mercato_customer_token";

let browserClient: ApolloClient<NormalizedCacheObject> | undefined;

/**
 * Browser-side Apollo Client singleton. `getHeaders` is re-evaluated on
 * every request, so logging in/out (which just writes/clears localStorage)
 * takes effect on the very next query or mutation — no need to rebuild the
 * client or call a `setToken`-style method.
 */
export function getBrowserClient(): ApolloClient<NormalizedCacheObject> {
  if (!browserClient) {
    browserClient = createMercatoClient({
      uri: GRAPHQL_URL,
      getHeaders: () => {
        const token =
          typeof window !== "undefined" ? window.localStorage.getItem(CUSTOMER_TOKEN_KEY) : null;
        return {
          "X-Store-Id": STORE_ID,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
      },
    });
  }
  return browserClient;
}
