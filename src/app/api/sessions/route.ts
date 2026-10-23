import { NextResponse } from "next/server";
import { db } from "@/db";
import { examSessions, exams } from "@/db/schema";
import { currentUser } from "@/lib/userAuth";
import { canAccessLevel } from "@/lib/premium";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = String(body?.token ?? "");
  const examId = Number(body?.examId);
  const studentName = String(body?.studentName ?? "");
  if (!token || !examId) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }
  const user = await currentUser();
  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam) return NextResponse.json({ error: "পরীক্ষা পাওয়া যায়নি" }, { status: 404 });
  if (!canAccessLevel(exam.accessLevel, user)) {
    return NextResponse.json({ error: "এই Premium টেস্টের জন্য প্রিমিয়াম অ্যাক্সেস প্রয়োজন" }, { status: 403 });
  }
  await db
    .insert(examSessions)
    .values({
      token,
      examId,
      userId: user?.id ?? null,
      studentName,
      lastSeen: new Date(),
    })
    .onConflictDoUpdate({
      target: examSessions.token,
      set: { lastSeen: new Date(), studentName },
    });
  return NextResponse.json({ ok: true });
}
