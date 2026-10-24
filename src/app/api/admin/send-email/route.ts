import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { sendEmail } from "@/lib/email";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const to = String(body.to ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const html = typeof body.html === "string" ? body.html : "";
  const text = typeof body.text === "string" ? body.text : "";
  if (!emailPattern.test(to) || !subject || (!html && !text)) {
    return NextResponse.json({ error: "to, subject এবং html অথবা text প্রয়োজন" }, { status: 400 });
  }
  if (subject.length > 180 || html.length > 120_000 || text.length > 20_000) {
    return NextResponse.json({ error: "Email content limit অতিক্রম করেছে" }, { status: 400 });
  }
  try {
    const result = await sendEmail({ to, subject, html: html || undefined, text: text || undefined, body: text || "" });
    if ("skipped" in result) return NextResponse.json({ error: "Gmail SMTP এখনও configured নয়" }, { status: 503 });
    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (error) {
    console.error("Admin mail send failed", error);
    return NextResponse.json({ error: "Gmail SMTP দিয়ে ইমেইল পাঠানো যায়নি" }, { status: 502 });
  }
}
