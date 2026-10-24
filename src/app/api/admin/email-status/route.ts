import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getSettings } from "@/lib/settings";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = process.env.EMAIL_USER || "";
  const hasPassword = Boolean(process.env.EMAIL_PASS);
  const settings = await getSettings();
  return NextResponse.json({
    configured: Boolean(user) && hasPassword,
    hasUser: Boolean(user),
    hasPassword,
    sender: process.env.EMAIL_FROM || settings.email_from || user,
    provider: "gmail",
  });
}
