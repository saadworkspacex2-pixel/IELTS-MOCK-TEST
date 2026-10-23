import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentRequests, users } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { isPremiumTier, planLabels } from "@/lib/premium";
import { sendMembershipStatusEmail, siteUrl } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? "");
  const adminNote = String(body.adminNote ?? "");
  if (!["pending", "approved", "rejected"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const [payment] = await db.select().from(paymentRequests).where(eq(paymentRequests.id, Number(id)));
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [row] = await db.update(paymentRequests).set({ status, adminNote, updatedAt: new Date() }).where(eq(paymentRequests.id, payment.id)).returning();
  const [member] = await db.select({ email: users.email }).from(users).where(eq(users.id, payment.userId));
  if (status === "approved" && isPremiumTier(payment.tier)) {
    await db.update(users).set({ membershipTier: payment.tier, premiumUntil: null }).where(eq(users.id, payment.userId));
  }
  if (member && isPremiumTier(payment.tier) && (status === "approved" || status === "rejected")) {
    void sendMembershipStatusEmail(member.email, planLabels[payment.tier], status, siteUrl()).catch((error) => console.error("Membership status email failed", error));
  }
  return NextResponse.json(row);
}
