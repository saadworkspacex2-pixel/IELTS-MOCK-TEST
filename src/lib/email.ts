import nodemailer, { type Transporter } from "nodemailer";
import { getSettings } from "@/lib/settings";
import {
  interpolateMail,
  resolveMailLayout,
  resolveMailTemplate,
  type MailTemplateKey,
} from "@/lib/mailTemplates";

const escapeHtml = (value: string) => value.replace(/[&<'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
const plainText = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const fillText = (value: string, variables: Record<string, string | number | undefined>) => value.replace(/{{\s*([a-z_]+)\s*}}/gi, (_full, key: string) => String(variables[key] ?? "")).replace(/[\r\n]+/g, " ");

export type EmailMessage = {
  to: string;
  subject?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  cta?: { label?: string; href: string };
  code?: string;
  html?: string;
  text?: string;
  template?: MailTemplateKey;
  variables?: Record<string, string | number | undefined>;
};

type MailGlobal = typeof globalThis & { __lhbdGmailTransporter?: Transporter };

function transporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  if (!emailUser || !emailPass) return null;
  const globalForMail = globalThis as MailGlobal;
  if (!globalForMail.__lhbdGmailTransporter) {
    globalForMail.__lhbdGmailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
    });
  }
  return globalForMail.__lhbdGmailTransporter;
}

const emailAddress = /^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/;
const namedMailbox = /^[^<>\[\]()\r\n]+ <([^<>\s]+)>$/;

// Gmail can only send from its authenticated address or a Gmail-approved alias.
// Invalid values (for example markdown copied into EMAIL_FROM) are ignored rather
// than allowing one malformed display value to stop all transactional messages.
export function effectiveEmailFrom(siteName = "IELTS Mock Test") {
  const authenticated = (process.env.EMAIL_USER || "").trim();
  const configured = (process.env.EMAIL_FROM || "").trim();
  if (!authenticated) return configured || "";
  if (configured === authenticated) return configured;
  const named = configured.match(namedMailbox)?.[1] || "";
  if (named && emailAddress.test(named)) return configured;
  return `${siteName} <${authenticated}>`;
}

export async function verifyGmailSmtp() {
  const smtp = transporter();
  if (!smtp) return { configured: false, deliveryReady: false, message: "EMAIL_USER অথবা EMAIL_PASS সেট করা নেই।" };
  try {
    await smtp.verify();
    return { configured: true, deliveryReady: true, message: "Gmail SMTP authenticated and ready." };
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    console.error("Gmail SMTP verification failed", error);
    return {
      configured: true,
      deliveryReady: false,
      message: code === "EAUTH"
        ? "Gmail authentication rejected. EMAIL_PASS-এ নতুন Gmail App Password দিন; normal Gmail password ব্যবহার করবেন না।"
        : "Gmail SMTP connection যাচাই করা যায়নি। Vercel Runtime Logs দেখুন এবং Gmail App Password যাচাই করুন।",
    };
  }
}

function brandedHtml(message: EmailMessage, siteName: string, settings: Record<string, string>) {
  const layout = resolveMailLayout(settings);
  const variables = { site_name: siteName, ...(message.variables || {}) };
  const safeSiteName = escapeHtml(siteName || "IELTS Mock Test");
  const headerTitle = escapeHtml(fillText(layout.headerTitle, variables) || siteName || "IELTS Mock Test");
  const headerTagline = escapeHtml(fillText(layout.headerTagline, variables));
  const footerText = escapeHtml(fillText(layout.footerText, variables));
  const logo = layout.logoUrl
    ? `<img src="${escapeHtml(layout.logoUrl)}" alt="${safeSiteName}" width="42" height="42" style="display:block;width:42px;height:42px;border-radius:11px;object-fit:contain;background:#fff">`
    : `<div style="width:42px;height:42px;border-radius:11px;background:${layout.accentColor};color:#fff;font-size:14px;font-weight:800;text-align:center;line-height:42px">IELTS</div>`;
  const cta = message.cta?.href && message.cta.label ? `<a href="${escapeHtml(message.cta.href)}" style="display:inline-block;background:${layout.buttonColor};border:1px solid ${layout.buttonColor};border-radius:8px;color:#fff;font-size:14px;font-weight:700;line-height:20px;padding:13px 22px;text-decoration:none">${escapeHtml(message.cta.label)}</a>` : "";
  const code = message.code ? `<div style="margin:28px 0;border:1px dashed ${layout.accentColor};border-radius:12px;background:#fff7f7;padding:18px;text-align:center"><div style="color:#6c757d;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">আপনার নিরাপত্তা কোড</div><div style="color:#1a1a1a;font-family:ui-monospace,Menlo,monospace;font-size:30px;font-weight:800;letter-spacing:.28em;margin:8px 0 0">${escapeHtml(message.code)}</div></div>` : "";
  return `<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f2f4f7;color:#1a1a1a;font-family:Arial,'Hind Siliguri',sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f4f7;padding:32px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.08)"><tr><td style="background:linear-gradient(135deg,#1a1a1a,#292d32);padding:26px 32px"><table role="presentation" cellspacing="0" cellpadding="0"><tr><td>${logo}</td><td style="padding-left:12px"><div style="color:#fff;font-size:17px;font-weight:800">${headerTitle}</div><div style="color:#cbd5e1;font-size:11px;letter-spacing:.08em;margin-top:3px">${headerTagline}</div></td></tr></table></td></tr><tr><td style="padding:34px 32px 28px"><div style="color:${layout.accentColor};font-size:11px;font-weight:800;letter-spacing:.11em;text-transform:uppercase">${escapeHtml(message.eyebrow || "SERVICE MESSAGE")}</div><h1 style="font-size:25px;line-height:1.32;margin:10px 0 14px;color:#1a1a1a">${escapeHtml(message.title || message.subject || "")}</h1><div style="color:#4b5563;font-size:15px;line-height:1.75">${message.body || ""}</div>${code}${cta ? `<div style="margin-top:25px">${cta}</div>` : ""}</td></tr><tr><td style="border-top:1px solid #eef0f2;padding:20px 32px"><p style="color:#94a3b8;font-size:11px;line-height:1.6;margin:0">${footerText}</p></td></tr></table><p style="color:#94a3b8;font-size:11px;margin:16px 0 0">© ${new Date().getFullYear()} ${safeSiteName}</p></td></tr></table></body></html>`;
}

function resolveTemplateMessage(message: EmailMessage, siteName: string, settings: Record<string, string>): EmailMessage {
  if (!message.template) return message;
  const template = resolveMailTemplate(message.template, settings);
  const variables = { site_name: siteName, ...(message.variables || {}) };
  const ctaLabel = fillText(template.ctaLabel, variables);
  return {
    ...message,
    subject: fillText(template.subject, variables),
    eyebrow: fillText(template.eyebrow, variables),
    title: fillText(template.title, variables),
    body: interpolateMail(template.body, variables, escapeHtml),
    cta: message.cta?.href && ctaLabel ? { href: message.cta.href, label: ctaLabel } : undefined,
  };
}

export async function sendEmail(message: EmailMessage) {
  const smtp = transporter();
  if (!smtp) {
    console.warn("Transactional email skipped: Gmail SMTP EMAIL_USER or EMAIL_PASS is not configured.");
    return { skipped: true };
  }
  const settings = await getSettings();
  const siteName = settings.site_name || "IELTS Mock Test";
  const resolved = resolveTemplateMessage(message, siteName, settings);
  const from = effectiveEmailFrom(siteName) || settings.email_from || `${siteName} <${process.env.EMAIL_USER}>`;
  const html = resolved.html || brandedHtml(resolved, siteName, settings);
  return smtp.sendMail({ from, to: resolved.to, subject: resolved.subject || "Service message", html, text: resolved.text || plainText(resolved.body || resolved.subject || "") });
}

export const sendWelcomeEmail = (to: string, name: string, pageUrl: string) => sendEmail({ to, template: "welcome", variables: { student_name: name || "শিক্ষার্থী" }, cta: { href: `${pageUrl}/profile` } });
export const sendLoginAlertEmail = (to: string, name: string, pageUrl: string) => sendEmail({ to, template: "login_alert", variables: { student_name: name || "আপনার" }, cta: { href: `${pageUrl}/profile` } });
export const sendPasswordResetCodeEmail = (to: string, code: string) => sendEmail({ to, template: "password_reset", variables: { otp_code: code }, code });
export const sendPasswordChangedEmail = (to: string, pageUrl: string) => sendEmail({ to, template: "password_changed", cta: { href: `${pageUrl}/login` } });
export const sendExamResultEmail = (to: string, name: string, examTitle: string, result: string, resultUrl: string) => sendEmail({ to, template: "exam_result", variables: { student_name: name || "শিক্ষার্থী", exam_title: examTitle, result }, cta: { href: resultUrl } });
export const sendPaymentRequestEmail = (to: string, tier: string, pageUrl: string) => sendEmail({ to, template: "payment_request", variables: { product: tier }, cta: { href: `${pageUrl}/profile` } });
export const sendMembershipStatusEmail = (to: string, tier: string, status: "approved" | "rejected", pageUrl: string) => sendEmail({ to, template: status === "approved" ? "premium_approved" : "premium_rejected", variables: { product: tier }, cta: { href: status === "approved" ? `${pageUrl}/exams` : `${pageUrl}/premium` } });
export const sendPremiumActivationEmail = (to: string, details: { product: string; total: string; expiresLabel?: string; profileUrl: string }) => sendEmail({ to, template: "premium_approved", variables: { product: details.product, total: details.total || "প্রযোজ্য মূল্য", expiry_label: details.expiresLabel || "মেয়াদ নির্ধারিত নয়" }, cta: { href: details.profileUrl } });
export const sendPremiumReceiptEmail = (to: string, details: { product: string; total: string; receiptUrl: string; expiresLabel?: string }) => sendEmail({ to, template: "premium_receipt", variables: { product: details.product, total: details.total || "প্রযোজ্য মূল্য", expiry_label: details.expiresLabel || "মেয়াদ নির্ধারিত নয়" }, cta: { href: details.receiptUrl } });

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
