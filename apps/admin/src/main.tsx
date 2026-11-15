import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { App } from "./App";
import { apolloClient } from "./lib/client";
import { initAuth } from "./auth/authStore";
import { LocaleProvider } from "./i18n/LocaleContext";
import "./styles/global.css";

// Restore/validate any persisted session before the router mounts.
void initAuth();

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element #root not found");
}

createRoot(container).render(
  <StrictMode>
    <LocaleProvider>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </LocaleProvider>
  </StrictMode>,
);
