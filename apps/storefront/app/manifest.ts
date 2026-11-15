import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE } from "@mercato/i18n";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mercato Store",
    short_name: "Mercato",
    description: "Mercato — multi-tenant commerce platform storefront.",
    start_url: `/${DEFAULT_LOCALE}`,
    display: "standalone",
    background_color: "#f6f5f1",
    theme_color: "#2f5de3",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
