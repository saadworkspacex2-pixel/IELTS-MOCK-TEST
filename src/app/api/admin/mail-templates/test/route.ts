import { NextResponse } from "next/server";
import { canAccess } from "@/lib/adminAuth";
import { sendEmail, siteUrl } from "@/lib/email";
import { MAIL_TEMPLATE_KEYS, type MailTemplateKey } from "@/lib/mailTemplates";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isKey = (value: string): value is MailTemplateKey => (MAIL_TEMPLATE_KEYS as readonly string[]).includes(value);

export async function POST(req: Request) {
  if (!(await canAccess("settings"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const to = String(body.to || "").trim();
  const key = String(body.key || "");
  if (!emailPattern.test(to) || !isKey(key)) return NextResponse.json({ error: "Valid recipient এবং email template নির্বাচন করুন" }, { status: 400 });

  const root = siteUrl();
  const demo = {
    student_name: "Demo Student",
    exam_title: "IELTS Reading Practice Test",
    result: "Band 7.0",
    product: "Premium Plus",
    total: "1,000 BDT",
    expiry_label: "30 দিন",
    otp_code: "123456",
  };
  const ctaPath: Record<MailTemplateKey, string> = {
    password_reset: "",
    password_changed: "/login",
    welcome: "/profile",
    login_alert: "/profile",
    exam_result: "/results/demo",
    payment_request: "/profile",
    premium_approved: "/profile",
    premium_rejected: "/premium",
    premium_receipt: "/profile",
  };
  try {
    const result = await sendEmail({ to, template: key, variables: demo, code: key === "password_reset" ? demo.otp_code : undefined, cta: ctaPath[key] ? { href: `${root}${ctaPath[key]}` } : undefined });
    if ("skipped" in result) return NextResponse.json({ error: "Gmail SMTP এখনও configured নয়" }, { status: 503 });
    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (error) {
    console.error("Template test email failed", error);
    return NextResponse.json({ error: "Test email পাঠানো যায়নি। Gmail SMTP status যাচাই করুন।" }, { status: 502 });
  }
}
