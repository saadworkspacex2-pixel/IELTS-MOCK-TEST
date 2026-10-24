import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { SEO_PAGES, seoSettingKey, type SeoPage } from "@/lib/seoPages";

export { SEO_PAGES, seoSettingKey, type SeoPage } from "@/lib/seoPages";

function splitTerms(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

export async function pageMetadata(pageKey: string, fallback?: Partial<Pick<SeoPage, "fallbackTitle" | "fallbackDescription" | "noIndex" | "path">>): Promise<Metadata> {
  const settings = await getSettings();
  const registered = SEO_PAGES.find((page) => page.key === pageKey);
  const title = settings[seoSettingKey(pageKey, "title")] || fallback?.fallbackTitle || registered?.fallbackTitle || settings.seo_title;
  const description = settings[seoSettingKey(pageKey, "description")] || fallback?.fallbackDescription || registered?.fallbackDescription || settings.seo_description;
  const keywords = [
    ...splitTerms(settings.seo_keywords || ""),
    ...splitTerms(settings[seoSettingKey(pageKey, "keywords")] || ""),
    ...splitTerms(settings[seoSettingKey(pageKey, "hashtags")] || "").map((tag) => tag.startsWith("#") ? tag.slice(1) : tag),
  ];
  const siteUrl = (settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const path = fallback?.path || registered?.path || "";
  const canonical = path ? `${siteUrl}${path}` : siteUrl;
  const noIndex = fallback?.noIndex ?? registered?.noIndex ?? false;

  return {
    title,
    description,
    keywords: [...new Set(keywords)],
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { title, description, url: canonical, siteName: settings.site_name, type: "website", images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
    other: settings[seoSettingKey(pageKey, "hashtags")] ? { "article:tag": settings[seoSettingKey(pageKey, "hashtags")] } : undefined,
  };
}
