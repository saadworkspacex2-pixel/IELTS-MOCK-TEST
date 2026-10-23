import { notFound, redirect } from "next/navigation";
import TakeExamClient from "./TakeExamClient";
import { db } from "@/db";
import { exams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@/lib/userAuth";
import { canAccessLevel } from "@/lib/premium";

export const dynamic = "force-dynamic";

export default async function TakeExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const examId = Number(id);
  if (!Number.isFinite(examId)) notFound();
  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam) notFound();
  if (!canAccessLevel(exam.accessLevel, await currentUser())) {
    redirect(`/premium?next=${encodeURIComponent(`/exams/${examId}`)}`);
  }
  return <TakeExamClient examId={examId} />;
}
