import { NextResponse } from "next/server";
import { db } from "@/db";
import { exams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";
import { LHBD_IELTS_COURSE_MOCK_CATEGORY } from "@/lib/courseMocks";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(exams)
    .where(eq(exams.id, Number(id)));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const category = body.category !== undefined ? String(body.category) : undefined;
  const examModule = body.module !== undefined && ["reading", "listening", "writing"].includes(body.module) ? body.module : body.module !== undefined ? "mcq" : undefined;
  const [row] = await db
    .update(exams)
    .set({
      ...(body.title !== undefined && { title: String(body.title) }),
      ...(body.description !== undefined && {
        description: String(body.description),
      }),
      ...(category !== undefined && { category }),
      ...(examModule !== undefined && { module: examModule }),
      ...(body.durationMinutes !== undefined && {
        durationMinutes: Number(body.durationMinutes),
      }),
      ...(body.marksPerQuestion !== undefined && {
        marksPerQuestion: Number(body.marksPerQuestion),
      }),
      ...(body.negativeMark !== undefined && {
        negativeMark: Number(body.negativeMark),
      }),
      ...(body.isLive !== undefined && { isLive: Boolean(body.isLive) }),
      ...(category === LHBD_IELTS_COURSE_MOCK_CATEGORY
        ? { accessLevel: "free" }
        : body.accessLevel !== undefined && {
            accessLevel: body.accessLevel === "premium" ? "premium" : "free",
          }),
      ...(body.rules !== undefined && { rules: body.rules }),
    })
    .where(eq(exams.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(exams).where(eq(exams.id, Number(id)));
  return NextResponse.json({ ok: true });
}
