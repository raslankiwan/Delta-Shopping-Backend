import type { Metadata } from "next";
import { database } from "@delta/database";
import CommerceApp from "../../commerce/app";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const store = await (await database())
      .collection("stores")
      .findOne({ slug, status: "active" });
    if (store)
      return {
        title: `${store.name} — Delta`,
        description:
          store.description?.slice(0, 160) || `Shop ${store.name} on Delta.`,
        alternates: {
          canonical: `${process.env.APP_URL || "https://delta-shopping.vercel.app"}/s/${slug}`,
        },
        robots: store.demo ? { index: false, follow: true } : undefined,
      };
  } catch {}
  return { title: "Store unavailable — Delta", robots: { index: false } };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CommerceApp storeSlug={slug} />;
}
