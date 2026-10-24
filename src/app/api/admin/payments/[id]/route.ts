import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentRequests, users } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { isPremiumTier, planLabels } from "@/lib/premium";
import { sendMembershipStatusEmail, sendPremiumReceiptEmail, siteUrl } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { receiptIdentity, tierSettings } from "@/lib/membership";

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
  const [member] = await db.select({ email: users.email }).from(users).where(eq(users.id, payment.userId));

  const premiumTier = isPremiumTier(payment.tier) ? payment.tier : null;
  const now = new Date();
  let update: Partial<typeof paymentRequests.$inferInsert> = { status, adminNote, updatedAt: now };
  let receiptUrl = "";
  let product = premiumTier ? planLabels[premiumTier] : payment.tier;
  let total = "";
  let expiryLabel = "";

  if (status === "approved" && premiumTier) {
    const settings = await getSettings();
    const tier = tierSettings(premiumTier, settings);
    product = tier.name;
    total = tier.price ? `${tier.price} BDT` : "মূল্য অ্যাডমিন সেটিংসে নির্ধারিত";
    expiryLabel = tier.duration || "মেয়াদ নির্ধারিত নয়";
    const receipt = payment.receiptCode && payment.receiptToken
      ? { receiptCode: payment.receiptCode, receiptToken: payment.receiptToken }
      : receiptIdentity(payment.id);
    update = { ...update, ...receipt, approvedAt: payment.approvedAt ?? now };
    await db.update(users).set({ membershipTier: premiumTier, premiumUntil: tier.expiresAt }).where(eq(users.id, payment.userId));
  }

  const [row] = await db.update(paymentRequests).set(update).where(eq(paymentRequests.id, payment.id)).returning();
  if (row.receiptCode) receiptUrl = `${siteUrl()}/api/payments/${row.id}/receipt`;

  if (member && premiumTier && status === "approved") {
    void sendPremiumReceiptEmail(member.email, { product, total, receiptUrl, expiresLabel: expiryLabel }).catch((error) => console.error("Premium receipt email failed", error));
  } else if (member && premiumTier && status === "rejected") {
    void sendMembershipStatusEmail(member.email, planLabels[premiumTier], "rejected", siteUrl()).catch((error) => console.error("Membership status email failed", error));
  }
  return NextResponse.json(row);
}
