import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { effectiveEmailFrom, verifyGmailSmtp } from "@/lib/email";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = process.env.EMAIL_USER || "";
  const hasPassword = Boolean(process.env.EMAIL_PASS);
  const verification = await verifyGmailSmtp();
  return NextResponse.json({
    configured: Boolean(user) && hasPassword,
    hasUser: Boolean(user),
    hasPassword,
    sender: effectiveEmailFrom("IELTS Mock Test"),
    provider: "gmail",
    deliveryReady: verification.deliveryReady,
    deliveryMessage: verification.message,
  });
}
