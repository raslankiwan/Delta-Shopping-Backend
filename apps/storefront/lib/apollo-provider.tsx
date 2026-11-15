"use client";

import { ApolloProvider } from "@apollo/client";
import type { ReactNode } from "react";
import { getBrowserClient } from "@/lib/client";

/** Mounts the browser Apollo Client for the client-component tree below it. */
export function MercatoApolloProvider({ children }: { children: ReactNode }) {
  return <ApolloProvider client={getBrowserClient()}>{children}</ApolloProvider>;
}
