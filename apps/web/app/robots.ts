import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/orders", "/invite", "/api/"],
    },
    sitemap: `${process.env.APP_URL || "https://delta-shopping.vercel.app"}/sitemap.xml`,
  };
}
