import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://finmatch-platform.vercel.app";

// Only public, indexable pages — dashboard/admin/marketplace/messages
// require login and are excluded (also blocked in robots.ts).
const PUBLIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "hourly" },
  { path: "/ai", priority: 0.9, changeFrequency: "daily" },
  { path: "/loans", priority: 0.9, changeFrequency: "daily" },
  { path: "/cards", priority: 0.8, changeFrequency: "daily" },
  { path: "/insurance", priority: 0.8, changeFrequency: "daily" },
  { path: "/invest", priority: 0.8, changeFrequency: "daily" },
  { path: "/savings", priority: 0.8, changeFrequency: "daily" },
  { path: "/compare", priority: 0.8, changeFrequency: "daily" },
  { path: "/calc", priority: 0.7, changeFrequency: "weekly" },
  { path: "/news", priority: 0.7, changeFrequency: "hourly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
