import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { canAccess } from "@/lib/adminAuth";
import { getSettings } from "@/lib/settings";
import {
  DEFAULT_MAIL_LAYOUT,
  DEFAULT_MAIL_TEMPLATES,
  MAIL_TEMPLATE_KEYS,
  mailTemplateSettingKey,
  resolveMailLayout,
  resolveMailTemplate,
  type MailTemplateKey,
} from "@/lib/mailTemplates";

const isKey = (value: string): value is MailTemplateKey => (MAIL_TEMPLATE_KEYS as readonly string[]).includes(value);

export async function GET() {
  if (!(await canAccess("settings"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const values = await getSettings();
  return NextResponse.json({
    templates: MAIL_TEMPLATE_KEYS.map((key) => ({ key, ...resolveMailTemplate(key, values), isCustom: Boolean(values[mailTemplateSettingKey(key)]) })),
    layout: resolveMailLayout(values),
    defaults: { layout: DEFAULT_MAIL_LAYOUT, templates: DEFAULT_MAIL_TEMPLATES },
  });
}

export async function PUT(req: Request) {
  if (!(await canAccess("settings"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  let settingKey = "";
  let value: Record<string, string>;
  if (body.type === "layout") {
    const layout = body.layout as Record<string, unknown> | undefined;
    if (!layout) return NextResponse.json({ error: "Layout তথ্য দিন" }, { status: 400 });
    value = {
      logoUrl: String(layout.logoUrl || "").slice(0, 2_000),
      accentColor: String(layout.accentColor || "").slice(0, 20),
      buttonColor: String(layout.buttonColor || "").slice(0, 20),
      headerTitle: String(layout.headerTitle || "").slice(0, 160),
      headerTagline: String(layout.headerTagline || "").slice(0, 160),
      footerText: String(layout.footerText || "").slice(0, 500),
    };
    settingKey = "mail_layout";
  } else {
    const key = String(body.key || "");
    const template = body.template as Record<string, unknown> | undefined;
    if (!isKey(key) || !template) return NextResponse.json({ error: "Valid email template নির্বাচন করুন" }, { status: 400 });
    const subject = String(template.subject || "").trim();
    const title = String(template.title || "").trim();
    const richBody = String(template.body || "").trim();
    if (!subject || !title || !richBody) return NextResponse.json({ error: "Subject, title এবং email content প্রয়োজন" }, { status: 400 });
    if (subject.length > 300 || title.length > 300 || richBody.length > 120_000) return NextResponse.json({ error: "Email template-এর content limit অতিক্রম করেছে" }, { status: 400 });
    value = {
      subject,
      eyebrow: String(template.eyebrow || "").slice(0, 120),
      title,
      body: richBody,
      ctaLabel: String(template.ctaLabel || "").slice(0, 120),
    };
    settingKey = mailTemplateSettingKey(key);
  }

  await db.insert(settings).values({ key: settingKey, value: JSON.stringify(value) }).onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(value) } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await canAccess("settings"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null) as { key?: string; type?: string } | null;
  const settingKey = body?.type === "layout" ? "mail_layout" : body?.key && isKey(body.key) ? mailTemplateSettingKey(body.key) : "";
  if (!settingKey) return NextResponse.json({ error: "Valid item নির্বাচন করুন" }, { status: 400 });
  await db.delete(settings).where(eq(settings.key, settingKey));
  return NextResponse.json({ ok: true });
}
