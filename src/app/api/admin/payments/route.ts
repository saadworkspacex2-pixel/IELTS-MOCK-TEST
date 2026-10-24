import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentRequests, users } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { premiumSchemaCapabilities, premiumSchemaWarning } from "@/lib/premiumSchema";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const capabilities = await premiumSchemaCapabilities();
    const warning = premiumSchemaWarning(capabilities);
    if (!capabilities.paymentTable) return NextResponse.json({ rows: [], warning });
    const rows = await db.select({
      payment: {
        id: paymentRequests.id,
        tier: paymentRequests.tier,
        paymentMethod: paymentRequests.paymentMethod,
        transactionId: paymentRequests.transactionId,
        senderNumber: paymentRequests.senderNumber,
        status: paymentRequests.status,
        adminNote: paymentRequests.adminNote,
        createdAt: paymentRequests.createdAt,
      },
      user: { id: users.id, nameBn: users.nameBn, nameEn: users.nameEn, email: users.email, phone: users.phone },
    }).from(paymentRequests).innerJoin(users, eq(paymentRequests.userId, users.id)).orderBy(desc(paymentRequests.createdAt));
    return NextResponse.json({ rows: rows.map((row) => ({ ...row, payment: { ...row.payment, receiptCode: "" } })), warning });
  } catch (error) {
    console.error("Payment inbox database error", error);
    return NextResponse.json({ rows: [], warning: "Payment inbox এই database connection-এ পড়া যায়নি। Manual Premium activation এখনও চেষ্টা করা যাবে।" });
  }
}
