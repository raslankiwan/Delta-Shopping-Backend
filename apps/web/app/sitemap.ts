import type { MetadataRoute } from "next";
import { database } from "@delta/database";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL || "https://delta-shopping.vercel.app";
  const stores = await (
    await database()
  )
    .collection("stores")
    .find({ status: "active", demo: { $ne: true } })
    .project({ slug: 1, updatedAt: 1, createdAt: 1 })
    .limit(10000)
    .toArray();
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...stores.map((s) => ({
      url: `${base}/s/${s.slug}`,
      lastModified: s.updatedAt || s.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
