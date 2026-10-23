import type { MetadataRoute } from "next";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { exams } from "@/db/schema";
import { getSettings } from "@/lib/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, liveExams] = await Promise.all([
    getSettings(),
    db.select({ id: exams.id, createdAt: exams.createdAt }).from(exams).where(and(eq(exams.isLive, true), eq(exams.accessLevel, "free"))).orderBy(desc(exams.createdAt)),
  ]);
  const base = (settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();
  const pages: MetadataRoute.Sitemap = ["", "/exams", "/resources", "/leaderboard", "/premium", "/terms", "/privacy", "/login"].map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : 0.7 }));
  return [...pages, ...liveExams.map((exam) => ({ url: `${base}/exams/${exam.id}`, lastModified: exam.createdAt, changeFrequency: "weekly" as const, priority: 0.8 }))];
}
