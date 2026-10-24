import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/db";
import { paymentRequests, users } from "@/db/schema";
import { currentUser } from "@/lib/userAuth";
import { isAdmin } from "@/lib/adminAuth";
import { getSettings } from "@/lib/settings";
import { isPremiumTier, planLabels } from "@/lib/premium";
import { ensurePremiumOperationsSchema } from "@/lib/premiumSchema";

type Params = { params: Promise<{ id: string }> };

const money = (value: string) => value ? `${value} BDT` : "Amount configured by administrator";

export async function GET(req: Request, { params }: Params) {
  try {
    await ensurePremiumOperationsSchema();
  } catch (error) {
    console.error("Receipt schema sync failed", error);
    return NextResponse.json({ error: "Receipt database is not ready" }, { status: 500 });
  }
  const { id } = await params;
  const paymentId = Number(id);
  const [payment] = await db.select().from(paymentRequests).where(eq(paymentRequests.id, paymentId));
  if (!payment || payment.status !== "approved" || !payment.receiptCode || !payment.receiptToken) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }
  const user = await currentUser();
  const admin = await isAdmin();
  if (!admin && (!user || user.id !== payment.userId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [buyer] = await db.select({ nameBn: users.nameBn, nameEn: users.nameEn, email: users.email }).from(users).where(eq(users.id, payment.userId));
  const settings = await getSettings();
  const tier = isPremiumTier(payment.tier) ? payment.tier : null;
  const product = tier ? settings[`premium_${tier}_name`] || planLabels[tier] : payment.tier;
  const price = tier ? settings[`premium_${tier}_price`] || "" : "";
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Premium receipt ${payment.receiptCode}`);
  pdf.setAuthor(settings.site_name || "IELTS Mock Test");
  const page = pdf.addPage([595.28, 841.89]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const ink = rgb(0.10, 0.10, 0.10);
  const muted = rgb(0.38, 0.42, 0.47);
  const red = rgb(0.90, 0.10, 0.14);
  const gold = rgb(0.84, 0.57, 0.10);
  const width = page.getWidth();

  page.drawRectangle({ x: 0, y: 748, width, height: 94, color: ink });
  page.drawRectangle({ x: 42, y: 776, width: 38, height: 38, color: red });
  page.drawText((settings.site_name || "LHBD").slice(0, 22), { x: 94, y: 797, size: 18, font: bold, color: rgb(1, 1, 1) });
  page.drawText("PREMIUM MEMBERSHIP RECEIPT", { x: 94, y: 781, size: 8, font: bold, color: rgb(0.78, 0.82, 0.87) });
  page.drawText("PAID / APPROVED", { x: 424, y: 791, size: 10, font: bold, color: rgb(1, 0.84, 0.35) });

  page.drawText("Receipt", { x: 42, y: 700, size: 28, font: bold, color: ink });
  page.drawText("Your Premium access has been approved.", { x: 42, y: 677, size: 11, font: regular, color: muted });
  page.drawRectangle({ x: 42, y: 620, width: 511, height: 38, color: rgb(1, 0.98, 0.91), borderColor: rgb(0.96, 0.82, 0.43), borderWidth: 1 });
  page.drawText("BUYING CODE", { x: 56, y: 642, size: 8, font: bold, color: rgb(0.55, 0.35, 0.02) });
  page.drawText(payment.receiptCode, { x: 56, y: 628, size: 13, font: bold, color: ink });

  const buyerName = buyer?.nameBn || buyer?.nameEn || buyer?.email || "Premium member";
  const rows: Array<[string, string]> = [
    ["CUSTOMER", buyerName],
    ["EMAIL", buyer?.email || "—"],
    ["PRODUCT", product],
    ["TOTAL", money(price)],
    ["PAYMENT METHOD", payment.paymentMethod === "admin-manual" ? "Admin manual approval" : payment.paymentMethod],
    ["TRANSACTION ID", payment.transactionId],
    ["APPROVED AT", (payment.approvedAt || payment.updatedAt).toLocaleString("en-GB")],
  ];
  let y = 578;
  for (const [label, value] of rows) {
    page.drawText(label, { x: 42, y, size: 8, font: bold, color: muted });
    page.drawText(String(value).slice(0, 76), { x: 220, y, size: 10, font: regular, color: ink });
    page.drawLine({ start: { x: 42, y: y - 10 }, end: { x: 553, y: y - 10 }, thickness: 0.5, color: rgb(0.90, 0.91, 0.93) });
    y -= 39;
  }

  page.drawRectangle({ x: 42, y: 225, width: 511, height: 88, color: rgb(1, 0.99, 0.96), borderColor: rgb(0.94, 0.78, 0.35), borderWidth: 1 });
  page.drawText("VERIFICATION TOKEN", { x: 58, y: 288, size: 8, font: bold, color: rgb(0.55, 0.35, 0.02) });
  page.drawText(payment.receiptToken, { x: 58, y: 267, size: 10, font: bold, color: ink });
  page.drawText("Keep this receipt and token for membership support or verification.", { x: 58, y: 244, size: 9, font: regular, color: muted });

  page.drawLine({ start: { x: 42, y: 178 }, end: { x: 553, y: 178 }, thickness: 1, color: gold });
  page.drawText("Thank you for choosing Premium practice.", { x: 42, y: 150, size: 11, font: bold, color: ink });
  page.drawText("This receipt was generated by the platform and can be verified from your account.", { x: 42, y: 132, size: 9, font: regular, color: muted });
  page.drawText(`Receipt ID: ${payment.id}`, { x: 42, y: 72, size: 8, font: regular, color: muted });

  const bytes = await pdf.save();
  const body = new Uint8Array(bytes).buffer as ArrayBuffer;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="premium-receipt-${payment.receiptCode}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
