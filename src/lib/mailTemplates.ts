export const MAIL_TEMPLATE_KEYS = [
  "password_reset",
  "password_changed",
  "welcome",
  "login_alert",
  "exam_result",
  "payment_request",
  "premium_approved",
  "premium_rejected",
  "premium_receipt",
] as const;

export type MailTemplateKey = (typeof MAIL_TEMPLATE_KEYS)[number];

export type MailTemplate = {
  label: string;
  description: string;
  subject: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
};

export type MailLayout = {
  logoUrl: string;
  accentColor: string;
  buttonColor: string;
  headerTitle: string;
  headerTagline: string;
  footerText: string;
};

export const DEFAULT_MAIL_LAYOUT: MailLayout = {
  logoUrl: "",
  accentColor: "#E51A24",
  buttonColor: "#E51A24",
  headerTitle: "{{site_name}}",
  headerTagline: "MOCK TEST PLATFORM",
  footerText: "এটি {{site_name}} থেকে পাঠানো একটি স্বয়ংক্রিয় সার্ভিস ইমেইল।",
};

export const DEFAULT_MAIL_TEMPLATES: Record<MailTemplateKey, MailTemplate> = {
  password_reset: {
    label: "Forgot Password OTP",
    description: "পাসওয়ার্ড রিসেটের ৬ সংখ্যার OTP ইমেইল।",
    subject: "পাসওয়ার্ড রিসেট কোড",
    eyebrow: "PASSWORD RECOVERY",
    title: "আপনার ৬ সংখ্যার OTP কোড",
    body: "<p>নিচের কোডটি দিয়ে নতুন পাসওয়ার্ড সেট করুন। নিরাপত্তার জন্য কোডটি ১৫ মিনিট পর মেয়াদ শেষ হবে এবং এটি কারও সাথে শেয়ার করবেন না।</p>",
    ctaLabel: "",
  },
  password_changed: {
    label: "Password Changed",
    description: "সফলভাবে পাসওয়ার্ড পরিবর্তনের নিশ্চিতকরণ।",
    subject: "আপনার পাসওয়ার্ড পরিবর্তন করা হয়েছে",
    eyebrow: "PASSWORD UPDATED",
    title: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে",
    body: "<p>আপনার নতুন পাসওয়ার্ড এখন সক্রিয়। আপনি নিজে এটি না করে থাকলে অবিলম্বে সাপোর্টে যোগাযোগ করুন।</p>",
    ctaLabel: "লগইন করুন",
  },
  welcome: {
    label: "Welcome / Registration",
    description: "নতুন account registration-এর স্বাগত ইমেইল।",
    subject: "স্বাগতম — আপনার {{site_name}} অ্যাকাউন্ট প্রস্তুত",
    eyebrow: "ACCOUNT READY",
    title: "স্বাগতম, {{student_name}}!",
    body: "<p>আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন আপনার প্রোফাইলে স্কোর, রিপোর্ট এবং Premium অ্যাক্সেসের অবস্থা দেখতে পারবেন।</p>",
    ctaLabel: "প্রোফাইল দেখুন",
  },
  login_alert: {
    label: "Login Notification",
    description: "নতুন login সম্পন্ন হলে নিরাপত্তা নোটিশ।",
    subject: "নতুন লগইন শনাক্ত হয়েছে",
    eyebrow: "SECURITY NOTICE",
    title: "আপনার অ্যাকাউন্টে লগইন করা হয়েছে",
    body: "<p>{{student_name}} অ্যাকাউন্টে একটি নতুন লগইন সম্পন্ন হয়েছে। আপনি লগইন না করে থাকলে দ্রুত পাসওয়ার্ড পরিবর্তন করুন।</p>",
    ctaLabel: "অ্যাকাউন্ট দেখুন",
  },
  exam_result: {
    label: "Exam Result",
    description: "পরীক্ষা submit বা result publish হওয়ার ইমেইল।",
    subject: "ফলাফল প্রস্তুত — {{exam_title}}",
    eyebrow: "EXAM RESULT",
    title: "{{student_name}}, আপনার ফলাফল প্রস্তুত",
    body: "<p>আপনি <b>{{exam_title}}</b> সম্পন্ন করেছেন।</p><div style=\"border-radius:10px;background:#f8fafc;padding:16px\"><span style=\"color:#64748b;font-size:12px\">ফলাফল</span><br><strong style=\"font-size:22px;color:#E51A24\">{{result}}</strong></div>",
    ctaLabel: "বিস্তারিত ফলাফল দেখুন",
  },
  payment_request: {
    label: "Payment Request Received",
    description: "Premium Send Money payment request পাওয়ার ইমেইল।",
    subject: "আপনার Premium পেমেন্ট রিকোয়েস্ট জমা হয়েছে",
    eyebrow: "PAYMENT RECEIVED",
    title: "পেমেন্ট রিকোয়েস্ট অপেক্ষমাণ",
    body: "<p>আপনার <b>{{product}}</b> Premium রিকোয়েস্ট আমরা পেয়েছি। Transaction ID যাচাইয়ের পর আপনার অ্যাক্সেস চালু হবে।</p>",
    ctaLabel: "প্রোফাইল দেখুন",
  },
  premium_approved: {
    label: "Premium Approved",
    description: "Manual বা approved Premium activation ইমেইল।",
    subject: "Premium অনুমোদিত — {{product}}",
    eyebrow: "PREMIUM ACTIVATED",
    title: "আপনার Premium অ্যাক্সেস প্রস্তুত",
    body: "<p>আপনার <b>{{product}}</b> সদস্যতা অ্যাডমিন অনুমোদন করেছেন।</p><div style=\"border:1px solid #f4d58d;border-radius:12px;background:#fffbeb;padding:16px\"><div style=\"color:#8a5b00;font-size:12px;font-weight:700\">PRODUCT</div><strong style=\"display:block;margin-top:3px;color:#1a1a1a\">{{product}}</strong><div style=\"margin-top:12px;color:#8a5b00;font-size:12px;font-weight:700\">TOTAL</div><strong style=\"display:block;margin-top:3px;color:#1a1a1a\">{{total}}</strong><div style=\"margin-top:12px;color:#64748b;font-size:13px\">মেয়াদ: {{expiry_label}}</div></div>",
    ctaLabel: "Premium প্রোফাইল দেখুন",
  },
  premium_rejected: {
    label: "Premium Rejected",
    description: "Premium payment request reject হলে পাঠানো ইমেইল।",
    subject: "Premium রিকোয়েস্টের আপডেট",
    eyebrow: "PREMIUM STATUS",
    title: "আপনার পেমেন্ট রিকোয়েস্ট অনুমোদিত হয়নি",
    body: "<p>Transaction ID বা পেমেন্ট তথ্য যাচাই করা যায়নি। প্রয়োজন হলে সাপোর্টে যোগাযোগ করুন।</p>",
    ctaLabel: "পেমেন্ট দেখুন",
  },
  premium_receipt: {
    label: "Premium Receipt",
    description: "Receipt PDF, buying code এবং verification token-সহ Premium approval।",
    subject: "Premium অনুমোদিত — {{product}}",
    eyebrow: "PREMIUM ACTIVATED",
    title: "আপনার Premium অ্যাক্সেস প্রস্তুত",
    body: "<p>আপনার <b>{{product}}</b> সদস্যতা অ্যাডমিন অনুমোদন করেছেন।</p><div style=\"border:1px solid #f4d58d;border-radius:12px;background:#fffbeb;padding:16px\"><div style=\"color:#8a5b00;font-size:12px;font-weight:700\">PRODUCT</div><strong style=\"display:block;margin-top:3px;color:#1a1a1a\">{{product}}</strong><div style=\"margin-top:12px;color:#8a5b00;font-size:12px;font-weight:700\">TOTAL</div><strong style=\"display:block;margin-top:3px;color:#1a1a1a\">{{total}}</strong><div style=\"margin-top:12px;color:#64748b;font-size:13px\">মেয়াদ: {{expiry_label}}</div></div><p>আপনার receipt PDF, buying code ও verification token নিচের লিংকে নিরাপদে পাওয়া যাবে।</p>",
    ctaLabel: "Receipt PDF দেখুন",
  },
};

const colorPattern = /^#[0-9a-fA-F]{6}$/;
const urlPattern = /^https?:\/\//i;

function parseObject(value: string | undefined) {
  try {
    const parsed = JSON.parse(value || "");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function text(value: unknown, fallback: string, max = 120_000) {
  return typeof value === "string" && value.length <= max ? value : fallback;
}

export function mailTemplateSettingKey(key: MailTemplateKey) {
  return `mail_template_${key}`;
}

export function resolveMailTemplate(key: MailTemplateKey, settings: Record<string, string>): MailTemplate {
  const fallback = DEFAULT_MAIL_TEMPLATES[key];
  const stored = parseObject(settings[mailTemplateSettingKey(key)]);
  if (!stored) return fallback;
  return {
    label: fallback.label,
    description: fallback.description,
    subject: text(stored.subject, fallback.subject, 300),
    eyebrow: text(stored.eyebrow, fallback.eyebrow, 120),
    title: text(stored.title, fallback.title, 300),
    body: text(stored.body, fallback.body),
    ctaLabel: text(stored.ctaLabel, fallback.ctaLabel, 120),
  };
}

export function resolveMailLayout(settings: Record<string, string>): MailLayout {
  const stored = parseObject(settings.mail_layout);
  if (!stored) return DEFAULT_MAIL_LAYOUT;
  const logoUrl = text(stored.logoUrl, "", 2_000);
  return {
    logoUrl: urlPattern.test(logoUrl) ? logoUrl : "",
    accentColor: colorPattern.test(text(stored.accentColor, "")) ? text(stored.accentColor, DEFAULT_MAIL_LAYOUT.accentColor) : DEFAULT_MAIL_LAYOUT.accentColor,
    buttonColor: colorPattern.test(text(stored.buttonColor, "")) ? text(stored.buttonColor, DEFAULT_MAIL_LAYOUT.buttonColor) : DEFAULT_MAIL_LAYOUT.buttonColor,
    headerTitle: text(stored.headerTitle, DEFAULT_MAIL_LAYOUT.headerTitle, 160),
    headerTagline: text(stored.headerTagline, DEFAULT_MAIL_LAYOUT.headerTagline, 160),
    footerText: text(stored.footerText, DEFAULT_MAIL_LAYOUT.footerText, 500),
  };
}

export function interpolateMail(value: string, variables: Record<string, string | number | undefined>, escape: (input: string) => string) {
  return value.replace(/{{\s*([a-z_]+)\s*}}/gi, (_full, key: string) => escape(String(variables[key] ?? "")));
}
