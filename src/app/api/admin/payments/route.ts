import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentRequests, users } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { ensurePremiumOperationsSchema } from "@/lib/premiumSchema";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensurePremiumOperationsSchema();
    const rows = await db.select({ payment: paymentRequests, user: { id: users.id, nameBn: users.nameBn, nameEn: users.nameEn, email: users.email, phone: users.phone } }).from(paymentRequests).innerJoin(users, eq(paymentRequests.userId, users.id)).orderBy(desc(paymentRequests.createdAt));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Payment inbox schema/database error", error);
    return NextResponse.json({ error: "পেমেন্ট ডেটাবেস প্রস্তুত করা যায়নি। Vercel DATABASE_URL এবং schema migration যাচাই করুন।" }, { status: 500 });
  }
}
