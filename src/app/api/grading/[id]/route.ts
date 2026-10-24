import { NextResponse } from "next/server";
import { db } from "@/db";
import { attempts, exams, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { canAccess } from "@/lib/adminAuth";
import { sendExamResultEmail, siteUrl } from "@/lib/email";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await canAccess("grading"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const feedback = body.feedback ?? {};
  const band = Number(body.bandScore ?? 0);
  const [row] = await db
    .update(attempts)
    .set({
      feedback,
      bandScore: band > 0 ? band : null,
      score: band > 0 ? band : 0,
      status: body.status === "pending" ? "pending" : "scored",
    })
    .where(eq(attempts.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.userId && row.status === "scored") {
    const [detail] = await db.select({ email: users.email, nameBn: users.nameBn, nameEn: users.nameEn, examTitle: exams.title }).from(attempts).innerJoin(users, eq(attempts.userId, users.id)).innerJoin(exams, eq(attempts.examId, exams.id)).where(eq(attempts.id, row.id));
    if (detail) { try { await sendExamResultEmail(detail.email, detail.nameBn || detail.nameEn, detail.examTitle, row.bandScore ? `Band ${row.bandScore}` : `${row.score} নম্বর`, `${siteUrl()}/results/${row.id}`); } catch (error) { console.error("Graded result email failed", error); } }
  }
  return NextResponse.json(row);
}
