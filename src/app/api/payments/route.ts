import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentRequests } from "@/db/schema";
import { currentUser } from "@/lib/userAuth";
import { isPremiumTier, planLabels } from "@/lib/premium";
import { sendPaymentRequestEmail, siteUrl } from "@/lib/email";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(paymentRequests).where(eq(paymentRequests.userId, user.id)).orderBy(desc(paymentRequests.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "লগইন করে পেমেন্ট রিকোয়েস্ট পাঠান" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const tier = body?.tier;
  const paymentMethod = String(body?.paymentMethod ?? "");
  const transactionId = String(body?.transactionId ?? "").trim();
  const senderNumber = String(body?.senderNumber ?? "").trim();
  if (!isPremiumTier(tier) || !["bkash", "nagad", "rocket", "upay"].includes(paymentMethod) || transactionId.length < 4) {
    return NextResponse.json({ error: "টিয়ার, পেমেন্ট পদ্ধতি ও সঠিক Transaction ID দিন" }, { status: 400 });
  }
  const [existing] = await db.select().from(paymentRequests).where(and(eq(paymentRequests.transactionId, transactionId), eq(paymentRequests.paymentMethod, paymentMethod)));
  if (existing) return NextResponse.json({ error: "এই Transaction ID ইতিমধ্যে ব্যবহার হয়েছে" }, { status: 409 });
  const [row] = await db.insert(paymentRequests).values({ userId: user.id, tier, paymentMethod, transactionId, senderNumber }).returning();
  try { await sendPaymentRequestEmail(user.email, planLabels[tier], siteUrl()); } catch (error) { console.error("Payment email failed", error); }
  return NextResponse.json({ id: row.id, status: row.status }, { status: 201 });
}
