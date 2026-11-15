import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  type NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

export interface ClientOptions {
  /** GraphQL endpoint, e.g. http://localhost:9000/graphql */
  uri: string;
  /** Dynamic headers per request (store scope, auth token, etc.). */
  getHeaders?: () => Record<string, string | undefined>;
}

/**
 * Create an Apollo Client bound to the Mercato GraphQL API.
 *
 * Headers (X-Store-Id, Authorization, Idempotency-Key…) are injected per request
 * via `getHeaders`, so a store switch or login just changes what that callback
 * returns. Use a fresh client per request for SSR; a singleton is fine for SPAs.
 */
export function createMercatoClient(opts: ClientOptions): ApolloClient<NormalizedCacheObject> {
  const authLink = setContext((_op, { headers }) => {
    const dynamic = opts.getHeaders?.() ?? {};
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(dynamic)) if (v != null) clean[k] = v;
    return { headers: { ...(headers as Record<string, string>), ...clean } };
  });

  return new ApolloClient({
    link: authLink.concat(new HttpLink({ uri: opts.uri })),
    cache: new InMemoryCache(),
    defaultOptions: {
      // Storefront/admin want fresh reads; rely on explicit refetch rather than
      // aggressive caching for correctness across tenant/store switches.
      watchQuery: { fetchPolicy: 'cache-and-network' },
      query: { fetchPolicy: 'network-only' },
    },
  });
}
