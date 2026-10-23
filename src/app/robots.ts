import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  const base = (settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: ["/"], disallow: ["/admin/", "/api/", "/profile/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
