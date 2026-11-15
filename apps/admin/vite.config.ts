import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// VITE_API_URL and VITE_DEMO_STORE_ID are read at runtime via import.meta.env
// (see src/lib/api.ts). Vite auto-loads .env files prefixed with VITE_, but we
// call loadEnv explicitly so the intent is documented here too.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    server: {
      port: 9002,
    },
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL ?? "http://localhost:9000/v1"),
    },
  };
});
