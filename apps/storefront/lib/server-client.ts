import "server-only";

import { createMercatoClient } from "@mercato/graphql";
import type { ApolloClient, NormalizedCacheObject } from "@apollo/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/v1";
// The GraphQL endpoint lives at the API origin, not under the REST "/v1" prefix.
const GRAPHQL_URL = `${API_URL.replace(/\/v1$/, "")}/graphql`;
const STORE_ID = process.env.NEXT_PUBLIC_DEMO_STORE_ID;

/**
 * Server Component client factory — same store scope as the browser client.
 * `createMercatoClient` builds a stateless Apollo Client, so a fresh instance
 * per request avoids sharing the in-memory cache across unrelated requests
 * in the Next.js server runtime.
 */
export function getServerClient(): ApolloClient<NormalizedCacheObject> {
  return createMercatoClient({
    uri: GRAPHQL_URL,
    getHeaders: () => ({ "X-Store-Id": STORE_ID }),
  });
}
