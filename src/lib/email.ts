import nodemailer, { type Transporter } from "nodemailer";
import { getSettings } from "@/lib/settings";

const escapeHtml = (value: string) => value.replace(/[&<'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
const plainText = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export type EmailMessage = {
  to: string;
  subject: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  cta?: { label: string; href: string };
  code?: string;
  html?: string;
  text?: string;
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
      pool: true,
      maxConnections: 1,
      maxMessages: 20,
    });
  }
  return globalForMail.__lhbdGmailTransporter;
}

function brandedHtml(message: EmailMessage, siteName: string) {
  const safeSiteName = escapeHtml(siteName || "IELTS Mock Test");
  const cta = message.cta ? `<a href="${escapeHtml(message.cta.href)}" style="display:inline-block;background:#E51A24;border:1px solid #b5121a;border-radius:8px;color:#fff;font-size:14px;font-weight:700;line-height:20px;padding:13px 22px;text-decoration:none">${escapeHtml(message.cta.label)}</a>` : "";
  const code = message.code ? `<div style="margin:28px 0;border:1px dashed #E51A24;border-radius:12px;background:#fff7f7;padding:18px;text-align:center"><div style="color:#6c757d;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">আপনার নিরাপত্তা কোড</div><div style="color:#1a1a1a;font-family:ui-monospace,Menlo,monospace;font-size:30px;font-weight:800;letter-spacing:.28em;margin:8px 0 0">${escapeHtml(message.code)}</div></div>` : "";
  return `<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f2f4f7;color:#1a1a1a;font-family:Arial,'Hind Siliguri',sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f4f7;padding:32px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.08)"><tr><td style="background:linear-gradient(135deg,#1a1a1a,#292d32);padding:26px 32px"><table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="width:42px;height:42px;border-radius:11px;background:#E51A24;color:#fff;font-size:14px;font-weight:800;text-align:center;line-height:42px">IELTS</td><td style="padding-left:12px"><div style="color:#fff;font-size:17px;font-weight:800">${safeSiteName}</div><div style="color:#cbd5e1;font-size:11px;letter-spacing:.08em;margin-top:3px">MOCK TEST PLATFORM</div></td></tr></table></td></tr><tr><td style="padding:34px 32px 28px"><div style="color:#E51A24;font-size:11px;font-weight:800;letter-spacing:.11em;text-transform:uppercase">${escapeHtml(message.eyebrow || "SERVICE MESSAGE")}</div><h1 style="font-size:25px;line-height:1.32;margin:10px 0 14px;color:#1a1a1a">${escapeHtml(message.title || message.subject)}</h1><div style="color:#4b5563;font-size:15px;line-height:1.75">${message.body || ""}</div>${code}${cta ? `<div style="margin-top:25px">${cta}</div>` : ""}</td></tr><tr><td style="border-top:1px solid #eef0f2;padding:20px 32px"><p style="color:#94a3b8;font-size:11px;line-height:1.6;margin:0">এটি ${safeSiteName} থেকে পাঠানো একটি স্বয়ংক্রিয় সার্ভিস ইমেইল।</p></td></tr></table><p style="color:#94a3b8;font-size:11px;margin:16px 0 0">© ${new Date().getFullYear()} ${safeSiteName}</p></td></tr></table></body></html>`;
}

export async function sendEmail(message: EmailMessage) {
  const smtp = transporter();
  if (!smtp) {
    console.warn("Transactional email skipped: Gmail SMTP EMAIL_USER or EMAIL_PASS is not configured.");
    return { skipped: true };
  }
  const settings = await getSettings();
  const siteName = settings.site_name || "IELTS Mock Test";
  const from = process.env.EMAIL_FROM || settings.email_from || `${siteName} <${process.env.EMAIL_USER}>`;
  const html = message.html || brandedHtml(message, siteName);
  return smtp.sendMail({ from, to: message.to, subject: message.subject, html, text: message.text || plainText(message.body || message.subject) });
}

export const sendWelcomeEmail = (to: string, name: string, siteUrl: string) => sendEmail({ to, subject: "স্বাগতম — আপনার IELTS Mock Test অ্যাকাউন্ট প্রস্তুত", eyebrow: "ACCOUNT READY", title: `স্বাগতম, ${name || "শিক্ষার্থী"}!`, body: "আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন আপনার প্রোফাইলে স্কোর, রিপোর্ট এবং Premium অ্যাক্সেসের অবস্থা দেখতে পারবেন।", cta: { label: "প্রোফাইল দেখুন", href: `${siteUrl}/profile` } });
export const sendLoginAlertEmail = (to: string, name: string, siteUrl: string) => sendEmail({ to, subject: "নতুন লগইন শনাক্ত হয়েছে", eyebrow: "SECURITY NOTICE", title: "আপনার অ্যাকাউন্টে লগইন করা হয়েছে", body: `${escapeHtml(name || "আপনার")} অ্যাকাউন্টে একটি নতুন লগইন সম্পন্ন হয়েছে। আপনি লগইন না করে থাকলে দ্রুত পাসওয়ার্ড পরিবর্তন করুন।`, cta: { label: "অ্যাকাউন্ট দেখুন", href: `${siteUrl}/profile` } });
export const sendPasswordResetCodeEmail = (to: string, code: string) => sendEmail({ to, subject: "পাসওয়ার্ড রিসেট কোড", eyebrow: "PASSWORD RECOVERY", title: "আপনার ৬ সংখ্যার OTP কোড", body: "নিচের কোডটি দিয়ে নতুন পাসওয়ার্ড সেট করুন। নিরাপত্তার জন্য কোডটি ১৫ মিনিট পর মেয়াদ শেষ হবে এবং এটি কারও সাথে শেয়ার করবেন না।", code });
export const sendPasswordChangedEmail = (to: string, siteUrl: string) => sendEmail({ to, subject: "আপনার পাসওয়ার্ড পরিবর্তন করা হয়েছে", eyebrow: "PASSWORD UPDATED", title: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে", body: "আপনার নতুন পাসওয়ার্ড এখন সক্রিয়। আপনি নিজে এটি না করে থাকলে অবিলম্বে সাপোর্টে যোগাযোগ করুন।", cta: { label: "লগইন করুন", href: `${siteUrl}/login` } });
export const sendExamResultEmail = (to: string, name: string, examTitle: string, result: string, resultUrl: string) => sendEmail({ to, subject: `ফলাফল প্রস্তুত — ${examTitle}`, eyebrow: "EXAM RESULT", title: `${name || "শিক্ষার্থী"}, আপনার ফলাফল প্রস্তুত`, body: `<p style="margin:0 0 12px">আপনি <b>${escapeHtml(examTitle)}</b> সম্পন্ন করেছেন।</p><div style="border-radius:10px;background:#f8fafc;padding:16px"><span style="color:#64748b;font-size:12px">ফলাফল</span><br><strong style="font-size:22px;color:#E51A24">${escapeHtml(result)}</strong></div>`, cta: { label: "বিস্তারিত ফলাফল দেখুন", href: resultUrl } });
export const sendPaymentRequestEmail = (to: string, tier: string, siteUrl: string) => sendEmail({ to, subject: "আপনার Premium পেমেন্ট রিকোয়েস্ট জমা হয়েছে", eyebrow: "PAYMENT RECEIVED", title: "পেমেন্ট রিকোয়েস্ট অপেক্ষমাণ", body: `আপনার <b>${escapeHtml(tier)}</b> Premium রিকোয়েস্ট আমরা পেয়েছি। Transaction ID যাচাইয়ের পর আপনার অ্যাক্সেস চালু হবে।`, cta: { label: "প্রোফাইল দেখুন", href: `${siteUrl}/profile` } });
export const sendMembershipStatusEmail = (to: string, tier: string, status: "approved" | "rejected", siteUrl: string) => sendEmail({ to, subject: status === "approved" ? "Premium অ্যাক্সেস চালু হয়েছে" : "Premium রিকোয়েস্টের আপডেট", eyebrow: "PREMIUM STATUS", title: status === "approved" ? "অভিনন্দন! আপনার Premium অ্যাক্সেস চালু" : "আপনার পেমেন্ট রিকোয়েস্ট অনুমোদিত হয়নি", body: status === "approved" ? `আপনার <b>${escapeHtml(tier)}</b> সদস্যতা সক্রিয় হয়েছে। এখন Premium টেস্ট ও রিসোর্স ব্যবহার করতে পারবেন।` : "Transaction ID বা পেমেন্ট তথ্য যাচাই করা যায়নি। প্রয়োজন হলে সাপোর্টে যোগাযোগ করুন।", cta: { label: status === "approved" ? "Premium টেস্ট দেখুন" : "পেমেন্ট দেখুন", href: status === "approved" ? `${siteUrl}/exams` : `${siteUrl}/premium` } });
export const sendPremiumReceiptEmail = (to: string, details: { product: string; total: string; receiptUrl: string; expiresLabel?: string }) => sendEmail({ to, subject: `Premium অনুমোদিত — ${details.product}`, eyebrow: "PREMIUM ACTIVATED", title: "আপনার Premium অ্যাক্সেস প্রস্তুত", body: `<p style="margin:0 0 12px">আপনার <b>${escapeHtml(details.product)}</b> সদস্যতা অ্যাডমিন অনুমোদন করেছেন।</p><div style="border:1px solid #f4d58d;border-radius:12px;background:#fffbeb;padding:16px"><div style="color:#8a5b00;font-size:12px;font-weight:700">PRODUCT</div><strong style="display:block;margin-top:3px;color:#1a1a1a">${escapeHtml(details.product)}</strong><div style="margin-top:12px;color:#8a5b00;font-size:12px;font-weight:700">TOTAL</div><strong style="display:block;margin-top:3px;color:#1a1a1a">${escapeHtml(details.total || "প্রযোজ্য মূল্য")}</strong>${details.expiresLabel ? `<div style="margin-top:12px;color:#64748b;font-size:13px">মেয়াদ: ${escapeHtml(details.expiresLabel)}</div>` : ""}</div><p style="margin:16px 0 0">আপনার receipt PDF, buying code ও verification token নিচের লিংকে নিরাপদে পাওয়া যাবে।</p>`, cta: { label: "Receipt PDF দেখুন", href: details.receiptUrl } });

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
