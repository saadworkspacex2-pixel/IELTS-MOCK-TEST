import { NextResponse } from "next/server";
import { desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { paymentRequests, users } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { isPremiumTier } from "@/lib/premium";
import { getSettings } from "@/lib/settings";
import { receiptIdentity, tierSettings } from "@/lib/membership";
import { sendPremiumReceiptEmail, siteUrl } from "@/lib/email";

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const query = new URL(req.url).searchParams.get("q")?.trim() || "";
  const where = query
    ? or(ilike(users.email, `%${query}%`), ilike(users.nameBn, `%${query}%`), ilike(users.nameEn, `%${query}%`), ilike(users.phone, `%${query}%`))
    : undefined;
  const rows = await db.select({ id: users.id, email: users.email, nameBn: users.nameBn, nameEn: users.nameEn, phone: users.phone, membershipTier: users.membershipTier, premiumUntil: users.premiumUntil }).from(users).where(where).orderBy(desc(users.createdAt)).limit(25);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const userId = Number(body.userId);
  const tier = String(body.tier ?? "free");
  const adminNote = String(body.adminNote ?? "ম্যানুয়াল Premium আপডেট");
  if (!Number.isInteger(userId)) return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  const [member] = await db.select().from(users).where(eq(users.id, userId));
  if (!member) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  if (tier === "free") {
    const [user] = await db.update(users).set({ membershipTier: "free", premiumUntil: null }).where(eq(users.id, userId)).returning();
    return NextResponse.json({ user, payment: null });
  }
  if (!isPremiumTier(tier)) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  const settings = await getSettings();
  const details = tierSettings(tier, settings);
  const [pendingReceipt] = await db.insert(paymentRequests).values({
    userId,
    tier,
    paymentMethod: "admin-manual",
    transactionId: `ADMIN-${Date.now()}`,
    senderNumber: "",
    status: "approved",
    adminNote,
    approvedAt: new Date(),
  }).returning();
  const receipt = receiptIdentity(pendingReceipt.id);
  const [payment] = await db.update(paymentRequests).set({ ...receipt, updatedAt: new Date() }).where(eq(paymentRequests.id, pendingReceipt.id)).returning();
  const [user] = await db.update(users).set({ membershipTier: tier, premiumUntil: details.expiresAt }).where(eq(users.id, userId)).returning();
  const total = details.price ? `${details.price} BDT` : "মূল্য অ্যাডমিন সেটিংসে নির্ধারিত";
  void sendPremiumReceiptEmail(member.email, { product: details.name, total, receiptUrl: `${siteUrl()}/api/payments/${payment.id}/receipt`, expiresLabel: details.duration || "মেয়াদ নির্ধারিত নয়" }).catch((error) => console.error("Manual premium email failed", error));
  return NextResponse.json({ user, payment });
}
