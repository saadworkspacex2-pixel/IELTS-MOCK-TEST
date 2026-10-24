import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentRequests, users } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { isPremiumTier, planLabels } from "@/lib/premium";
import { sendMembershipStatusEmail, sendPremiumActivationEmail, sendPremiumReceiptEmail, siteUrl } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { receiptIdentity, tierSettings } from "@/lib/membership";
import { premiumSchemaCapabilities, premiumSchemaWarning } from "@/lib/premiumSchema";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? "");
  const adminNote = String(body.adminNote ?? "");
  if (!["pending", "approved", "rejected"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const capabilities = await premiumSchemaCapabilities();
  if (!capabilities.paymentTable) return NextResponse.json({ error: "Payment request table এখনও তৈরি হয়নি। Manual Premium activation ব্যবহার করুন অথবা schema migration চালান।" }, { status: 503 });
  const [payment] = await db.select({ id: paymentRequests.id, userId: paymentRequests.userId, tier: paymentRequests.tier }).from(paymentRequests).where(eq(paymentRequests.id, Number(id)));
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [member] = await db.select({ email: users.email }).from(users).where(eq(users.id, payment.userId));
  const premiumTier = isPremiumTier(payment.tier) ? payment.tier : null;
  const now = new Date();
  let product = premiumTier ? planLabels[premiumTier] : payment.tier;
  let total = "";
  let expiryLabel = "";

  if (status === "approved" && premiumTier) {
    const settings = await getSettings();
    const tier = tierSettings(premiumTier, settings);
    product = tier.name;
    total = tier.price ? `${tier.price} BDT` : "মূল্য অ্যাডমিন সেটিংসে নির্ধারিত";
    expiryLabel = tier.duration || "মেয়াদ নির্ধারিত নয়";
    await db.update(users).set({ membershipTier: premiumTier, premiumUntil: tier.expiresAt }).where(eq(users.id, payment.userId));
  }

  await db.update(paymentRequests).set({ status, adminNote, updatedAt: now }).where(eq(paymentRequests.id, payment.id));
  let receiptReady = false;
  if (status === "approved" && premiumTier && capabilities.receiptReady) {
    const receipt = receiptIdentity(payment.id);
    await db.update(paymentRequests).set({ ...receipt, approvedAt: now, updatedAt: now }).where(eq(paymentRequests.id, payment.id));
    receiptReady = true;
  }

  if (member && premiumTier && status === "approved") {
    if (receiptReady) void sendPremiumReceiptEmail(member.email, { product, total, receiptUrl: `${siteUrl()}/api/payments/${payment.id}/receipt`, expiresLabel: expiryLabel }).catch((error) => console.error("Premium receipt email failed", error));
    else void sendPremiumActivationEmail(member.email, { product, total, expiresLabel: expiryLabel, profileUrl: `${siteUrl()}/profile` }).catch((error) => console.error("Premium activation email failed", error));
  } else if (member && premiumTier && status === "rejected") {
    void sendMembershipStatusEmail(member.email, planLabels[premiumTier], "rejected", siteUrl()).catch((error) => console.error("Membership status email failed", error));
  }
  return NextResponse.json({ ok: true, warning: premiumSchemaWarning(capabilities) });
}
