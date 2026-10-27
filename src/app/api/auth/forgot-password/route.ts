import { createHash, randomInt } from "crypto";
import { NextResponse } from "next/server";
import { desc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { sendPasswordResetCodeEmail } from "@/lib/email";
import { bangladeshPhoneE164, sendPasswordResetCodeSms } from "@/lib/sms";

const hashCode = (identifier: string, code: string) =>
  createHash("sha256").update(`${identifier}:${code}`).digest("hex");

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const rawIdentifier = String(body.identifier ?? body.email ?? "").trim();
  const isEmail = rawIdentifier.includes("@");
  const email = isEmail ? rawIdentifier.toLowerCase() : "";
  const phone = isEmail ? "" : bangladeshPhoneE164(rawIdentifier);
  if ((isEmail && (!email || !email.includes("@"))) || (!isEmail && !phone)) {
    return NextResponse.json({ error: "সঠিক ইমেইল অথবা বাংলাদেশি মোবাইল নম্বর দিন" }, { status: 400 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(isEmail ? eq(users.email, email) : or(eq(users.phone, rawIdentifier), eq(users.phone, phone)));
  // Keep account existence private. The visible confirmation is identical for
  // recognized and unrecognized contacts.
  if (!user) return NextResponse.json({ ok: true, channel: isEmail ? "email" : "sms" });

  const [latest] = await db
    .select({ createdAt: passwordResetTokens.createdAt })
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, user.id))
    .orderBy(desc(passwordResetTokens.createdAt))
    .limit(1);
  if (latest && Date.now() - latest.createdAt.getTime() < 60_000) {
    return NextResponse.json({ error: "নতুন কোড চাইতে এক মিনিট অপেক্ষা করুন" }, { status: 429 });
  }

  const code = String(randomInt(100000, 1_000_000));
  const identifierKey = isEmail ? email : phone;
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    codeHash: hashCode(identifierKey, code),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  try {
    if (isEmail) {
      const delivery = await sendPasswordResetCodeEmail(user.email, code);
      if ("skipped" in delivery) return NextResponse.json({ error: "OTP email service এখনো configured নয়।" }, { status: 503 });
    } else {
      const delivery = await sendPasswordResetCodeSms(phone, code);
      if (!delivery.sent) {
        return NextResponse.json({ error: "SMS OTP service এখনো configured নয়।" }, { status: 503 });
      }
    }
  } catch (error) {
    console.error("Password reset code delivery failed", error);
    return NextResponse.json({
      error: isEmail
        ? "OTP email পাঠানো যায়নি। Gmail SMTP settings যাচাই করে আবার চেষ্টা করুন।"
        : "OTP SMS পাঠানো যায়নি। TextBee phone, SIM এবং API settings যাচাই করে আবার চেষ্টা করুন।",
    }, { status: 503 });
  }
  return NextResponse.json({ ok: true, channel: isEmail ? "email" : "sms" });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
