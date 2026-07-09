import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://finmatch-platform.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // These all require login and have no SEO value — keep crawlers out
      // instead of wasting crawl budget on pages that just show a login
      // prompt to an anonymous bot.
      disallow: ["/dashboard/", "/messages", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
