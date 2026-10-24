import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getSettings } from "@/lib/settings";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings();
  const hasKey = Boolean(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || settings.email_from || "";
  return NextResponse.json({
    configured: hasKey && Boolean(from),
    hasApiKey: hasKey,
    hasSender: Boolean(from),
    sender: from || "",
  });
}
