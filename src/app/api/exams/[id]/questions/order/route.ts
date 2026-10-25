import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { questions, sections } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };
type Placement = { id: number; sectionId: number | null; sortOrder: number };

function isPlacement(value: unknown): value is Placement {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    Number.isInteger(item.id) && Number(item.id) > 0 &&
    (item.sectionId === null || (Number.isInteger(item.sectionId) && Number(item.sectionId) > 0)) &&
    Number.isInteger(item.sortOrder) && Number(item.sortOrder) > 0
  );
}

// Saves the complete question order in one transaction. Sending the whole list
// avoids duplicate positions while an admin moves a question between sections.
export async function PUT(req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const examId = Number(id);
  if (!Number.isInteger(examId) || examId <= 0) {
    return NextResponse.json({ error: "Invalid exam" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const items = body?.items;
  if (!Array.isArray(items) || !items.every(isPlacement)) {
    return NextResponse.json({ error: "A complete valid question order is required" }, { status: 400 });
  }

  const ids = items.map((item) => item.id);
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "A question cannot appear twice in the order" }, { status: 400 });
  }
  const sortOrders = items.map((item) => item.sortOrder);
  if (new Set(sortOrders).size !== sortOrders.length) {
    return NextResponse.json({ error: "Question positions must be unique" }, { status: 400 });
  }

  try {
    const rows = await db.transaction(async (tx) => {
      const [examQuestions, examSections] = await Promise.all([
        tx.select({ id: questions.id }).from(questions).where(eq(questions.examId, examId)),
        tx.select({ id: sections.id }).from(sections).where(eq(sections.examId, examId)),
      ]);
      const questionIds = new Set(examQuestions.map((question) => question.id));
      const sectionIds = new Set(examSections.map((section) => section.id));

      if (questionIds.size !== ids.length || ids.some((questionId) => !questionIds.has(questionId))) {
        throw new Error("The question list is out of date. Reload and try again.");
      }
      if (items.some((item) => item.sectionId !== null && !sectionIds.has(item.sectionId))) {
        throw new Error("A target section does not belong to this exam.");
      }

      for (const item of items) {
        await tx
          .update(questions)
          .set({ sectionId: item.sectionId, sortOrder: item.sortOrder })
          .where(and(eq(questions.id, item.id), eq(questions.examId, examId)));
      }

      return tx
        .select()
        .from(questions)
        .where(eq(questions.examId, examId))
        .orderBy(asc(questions.sortOrder), asc(questions.id));
    });
    return NextResponse.json({ questions: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Question order could not be saved";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
