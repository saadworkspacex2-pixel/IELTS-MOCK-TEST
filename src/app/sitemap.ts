import type { MetadataRoute } from "next";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { exams } from "@/db/schema";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

function safeBaseUrl(siteUrl: string) {
  const candidate = siteUrl.replace(/\/$/, "");
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? candidate : "";
  } catch {
    return "";
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings();
  const deploymentUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  const base = safeBaseUrl(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || deploymentUrl) || "https://localhost";
  const now = new Date();
  const pages: MetadataRoute.Sitemap = ["", "/exams", "/resources", "/leaderboard", "/premium", "/terms", "/privacy"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const liveExams = await db
      .select({ id: exams.id, createdAt: exams.createdAt })
      .from(exams)
      .where(and(eq(exams.isLive, true), eq(exams.accessLevel, "free")))
      .orderBy(desc(exams.createdAt));
    return [
      ...pages,
      ...liveExams.map((exam) => ({
        url: `${base}/exams/${exam.id}`,
        lastModified: exam.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch (error) {
    // A sitemap must remain fetchable even while a database schema is rolling out.
    // The static public routes keep Search Console healthy; exam URLs join after the
    // next successful revalidation.
    console.error("Sitemap exam query failed; serving the public-route fallback.", error);
    return pages;
  }
}
