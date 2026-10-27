export type SmsDelivery =
  | { sent: true; smsBatchId?: string }
  | { sent: false; skipped: true; reason: "not_configured" | "invalid_phone" };

const textbeeBaseUrl = () =>
  (process.env.TEXTBEE_BASE_URL || "https://api.textbee.dev/api/v1").replace(/\/$/, "");

/** Converts Bangladesh mobile inputs such as 017XXXXXXXX or 88017XXXXXXXX
 * to TextBee's E.164 format. SMS is intentionally restricted to a valid
 * Bangladesh mobile number so an accidental profile typo is not sent abroad. */
export function bangladeshPhoneE164(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (/^01\d{9}$/.test(digits)) return `+88${digits}`;
  if (/^8801\d{9}$/.test(digits)) return `+${digits}`;
  return "";
}

export function isTextBeeConfigured() {
  return Boolean(process.env.TEXTBEE_API_KEY);
}

export async function sendSms(phone: string, message: string): Promise<SmsDelivery> {
  const recipient = bangladeshPhoneE164(phone);
  if (!recipient) return { sent: false, skipped: true, reason: "invalid_phone" };
  const apiKey = process.env.TEXTBEE_API_KEY;
  if (!apiKey) return { sent: false, skipped: true, reason: "not_configured" };

  const response = await fetch(`${textbeeBaseUrl()}/gateway/send-sms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ recipients: [recipient], message: message.slice(0, 600) }),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  const result = (await response.json().catch(() => null)) as { data?: { smsBatchId?: unknown } } | null;
  if (!response.ok) {
    // Do not log message contents, phone numbers, or API credentials.
    throw new Error(`TextBee SMS request failed (${response.status})`);
  }
  return {
    sent: true,
    ...(typeof result?.data?.smsBatchId === "string" ? { smsBatchId: result.data.smsBatchId } : {}),
  };
}

export const sendWelcomeSms = (phone: string, name: string) =>
  sendSms(phone, `IELTS Mock Test: স্বাগতম ${name || "শিক্ষার্থী"}! আপনার অ্যাকাউন্ট তৈরি হয়েছে।`);

export const sendLoginAlertSms = (phone: string) =>
  sendSms(phone, "IELTS Mock Test: আপনার অ্যাকাউন্টে নতুন লগইন হয়েছে। এটি আপনার না হলে পাসওয়ার্ড পরিবর্তন করুন।");

export const sendPasswordResetCodeSms = (phone: string, code: string) =>
  sendSms(phone, `IELTS Mock Test verification code: ${code}. এটি 15 মিনিটের মধ্যে ব্যবহার করুন। কোডটি কাউকে দেবেন না।`);

export const sendPasswordChangedSms = (phone: string) =>
  sendSms(phone, "IELTS Mock Test: আপনার পাসওয়ার্ড পরিবর্তন করা হয়েছে। এটি আপনার না হলে দ্রুত সহায়তার জন্য যোগাযোগ করুন।");

export const sendExamResultSms = (phone: string, examTitle: string, result: string, resultUrl: string) =>
  sendSms(phone, `IELTS Mock Test: ${examTitle} ফলাফল ${result}. বিস্তারিত: ${resultUrl}`);
