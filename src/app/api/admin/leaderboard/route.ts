import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { attempts, exams, users } from "@/db/schema";
import { canAccess } from "@/lib/adminAuth";

export async function GET() {
  if (!(await canAccess("analytics"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select({ attempt: attempts, examTitle: exams.title, user: { id: users.id, email: users.email, nameBn: users.nameBn, nameEn: users.nameEn, membershipTier: users.membershipTier, premiumUntil: users.premiumUntil } }).from(attempts).innerJoin(exams, eq(attempts.examId, exams.id)).leftJoin(users, eq(attempts.userId, users.id)).orderBy(desc(attempts.score), desc(attempts.createdAt)).limit(200);
  return NextResponse.json(rows);
}
