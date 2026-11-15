import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Storefront reads catalog/pricing data from the Mercato API at request time;
  // keep this app on Node runtime defaults (no static export).
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
