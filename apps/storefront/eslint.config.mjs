import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next 16 removed `next lint`; ESLint runs directly on Next's flat configs.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    // Known debt: the account page, cart page and cart context hydrate from
    // localStorage with setState inside useEffect. Moving them to
    // useSyncExternalStore is tracked work; until then this stays visible as
    // a warning instead of failing CI.
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
]);
