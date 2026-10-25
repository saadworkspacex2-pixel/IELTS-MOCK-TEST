import { NextResponse } from "next/server";
import { db } from "@/db";
import { exams, questions, sections } from "@/db/schema";
import { canAccess } from "@/lib/adminAuth";

type ImportQuestion = {
  sectionKey?: number | null;
  qtype?: string;
  text: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: number;
  acceptedAnswers?: string;
  explanation?: string;
  sortOrder?: number;
};
type ImportSection = {
  key?: number;
  title?: string;
  passageTitle?: string;
  passageText?: string;
  instruction?: string;
  audioUrl?: string;
  imageUrl?: string;
  sortOrder?: number;
};
type ImportPayload = {
  exam: {
    title: string;
    description?: string;
    category?: string;
    module?: string;
    durationMinutes?: number;
    marksPerQuestion?: number;
    negativeMark?: number;
    isLive?: boolean;
    rules?: Record<string, unknown>;
  };
  sections?: ImportSection[];
  questions?: ImportQuestion[];
};

export async function POST(req: Request) {
  if (!(await canAccess("exams"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as ImportPayload | null;
  if (!body?.exam?.title) {
    return NextResponse.json({ error: "exam.title প্রয়োজন" }, { status: 400 });
  }
  const current = await db.select({ sortOrder: exams.sortOrder }).from(exams);
  const nextSortOrder = Math.max(0, ...current.map((exam) => exam.sortOrder)) + 1;
  const [exam] = await db
    .insert(exams)
    .values({
      title: body.exam.title,
      description: body.exam.description ?? "",
      category: body.exam.category ?? "General",
      module: body.exam.module ?? "mcq",
      durationMinutes: body.exam.durationMinutes ?? 20,
      marksPerQuestion: body.exam.marksPerQuestion ?? 1,
      negativeMark: body.exam.negativeMark ?? 0,
      isLive: body.exam.isLive ?? true,
      sortOrder: nextSortOrder,
      rules: body.exam.rules ?? {},
    })
    .returning();

  const sectionMap = new Map<number, number>();
  for (const [i, s] of (body.sections ?? []).entries()) {
    const [row] = await db
      .insert(sections)
      .values({
        examId: exam.id,
        title: s.title ?? `Part ${i + 1}`,
        passageTitle: s.passageTitle ?? "",
        passageText: s.passageText ?? "",
        instruction: s.instruction ?? "",
        audioUrl: s.audioUrl ?? "",
        imageUrl: s.imageUrl ?? "",
        sortOrder: s.sortOrder ?? i,
      })
      .returning();
    if (s.key !== undefined) sectionMap.set(s.key, row.id);
  }

  let created = 0;
  for (const [i, q] of (body.questions ?? []).entries()) {
    if (!q.text) continue;
    await db.insert(questions).values({
      examId: exam.id,
      sectionId: q.sectionKey ? (sectionMap.get(q.sectionKey) ?? null) : null,
      qtype: q.qtype ?? "mcq",
      text: q.text,
      optionA: q.optionA ?? "",
      optionB: q.optionB ?? "",
      optionC: q.optionC ?? "",
      optionD: q.optionD ?? "",
      correctOption: q.correctOption ?? 0,
      acceptedAnswers: q.acceptedAnswers ?? "",
      explanation: q.explanation ?? "",
      sortOrder: q.sortOrder ?? i,
    });
    created++;
  }

  return NextResponse.json(
    { id: exam.id, sections: sectionMap.size, questions: created },
    { status: 201 },
  );
}
