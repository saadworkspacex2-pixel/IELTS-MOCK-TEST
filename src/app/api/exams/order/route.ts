import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { exams } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";

type ExamOrderItem = { id: number; sortOrder: number };

function isOrderItem(value: unknown): value is ExamOrderItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return Number.isInteger(item.id) && Number(item.id) > 0 && Number.isInteger(item.sortOrder) && Number(item.sortOrder) > 0;
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const items = body?.items;
  if (!Array.isArray(items) || !items.every(isOrderItem)) {
    return NextResponse.json({ error: "A complete valid mock-exam order is required" }, { status: 400 });
  }

  const ids = items.map((item) => item.id);
  const positions = items.map((item) => item.sortOrder);
  if (new Set(ids).size !== ids.length || new Set(positions).size !== positions.length) {
    return NextResponse.json({ error: "Each mock exam needs one unique position" }, { status: 400 });
  }
  const sortedPositions = [...positions].sort((a, b) => a - b);
  if (!sortedPositions.every((position, index) => position === index + 1)) {
    return NextResponse.json({ error: "Mock-exam positions must be consecutive, starting at 1" }, { status: 400 });
  }

  try {
    const rows = await db.transaction(async (tx) => {
      const current = await tx.select({ id: exams.id }).from(exams);
      const currentIds = new Set(current.map((exam) => exam.id));
      if (currentIds.size !== ids.length || ids.some((id) => !currentIds.has(id))) {
        throw new Error("The mock-exam list changed. Reload and try again.");
      }

      for (const item of items) {
        await tx.update(exams).set({ sortOrder: item.sortOrder }).where(eq(exams.id, item.id));
      }

      return tx.select().from(exams).orderBy(asc(exams.sortOrder), asc(exams.id));
    });
    return NextResponse.json({ exams: rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Mock-exam order could not be saved" },
      { status: 409 },
    );
  }
}
