import { NextResponse } from "next/server";
import { db } from "@/db";
import { exams } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";
import { LHBD_IELTS_COURSE_MOCK_CATEGORY } from "@/lib/courseMocks";

export async function GET() {
  const rows = await db.select().from(exams).orderBy(asc(exams.sortOrder), desc(exams.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  const category = String(body.category ?? "সাধারণ জ্ঞান");
  const examModule = ["reading", "listening", "writing"].includes(body.module) ? body.module : "mcq";
  const current = await db.select({ sortOrder: exams.sortOrder }).from(exams);
  const nextSortOrder = Math.max(0, ...current.map((exam) => exam.sortOrder)) + 1;
  const [row] = await db
    .insert(exams)
    .values({
      title: String(body.title),
      description: String(body.description ?? ""),
      category,
      module: examModule,
      durationMinutes: Number(body.durationMinutes ?? 20),
      marksPerQuestion: Number(body.marksPerQuestion ?? 1),
      negativeMark: Number(body.negativeMark ?? 0.25),
      isLive: Boolean(body.isLive ?? true),
      sortOrder: nextSortOrder,
      accessLevel: category === LHBD_IELTS_COURSE_MOCK_CATEGORY ? "free" : body.accessLevel === "premium" ? "premium" : "free",
      rules: body.rules ?? {},
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
