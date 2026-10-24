import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { attempts } from "@/db/schema";
import { canAccess } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  if (!(await canAccess("analytics"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.published !== "boolean") return NextResponse.json({ error: "published is required" }, { status: 400 });
  const [row] = await db.update(attempts).set({ isPublished: body.published }).where(eq(attempts.id, Number(id))).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await canAccess("analytics"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [row] = await db.delete(attempts).where(eq(attempts.id, Number(id))).returning({ id: attempts.id });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
