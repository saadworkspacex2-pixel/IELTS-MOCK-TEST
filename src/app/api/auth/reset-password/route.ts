import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { hashPassword } from "@/lib/userAuth";
import { sendPasswordChangedEmail, siteUrl } from "@/lib/email";

const hashCode = (email: string, code: string) => createHash("sha256").update(`${email.toLowerCase()}:${code}`).digest("hex");
const equal = (a: string, b: string) => { const x = Buffer.from(a); const y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const code = String(body.code ?? "").trim();
  const password = String(body.password ?? "");
  if (!email || !email.includes("@") || !/^\d{6}$/.test(code) || password.length < 6) return NextResponse.json({ error: "ইমেইল, ৬ সংখ্যার কোড এবং কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন" }, { status: 400 });
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return NextResponse.json({ error: "কোড বা ইমেইল সঠিক নয়" }, { status: 400 });
  const [token] = await db.select().from(passwordResetTokens).where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date()))).orderBy(desc(passwordResetTokens.createdAt)).limit(1);
  if (!token || token.attemptCount >= 5 || !equal(token.codeHash, hashCode(email, code))) {
    if (token) await db.update(passwordResetTokens).set({ attemptCount: token.attemptCount + 1 }).where(eq(passwordResetTokens.id, token.id));
    return NextResponse.json({ error: "OTP কোড সঠিক নয় বা মেয়াদ শেষ হয়েছে" }, { status: 400 });
  }
  const { salt, hash } = hashPassword(password);
  await db.update(users).set({ passwordHash: hash, salt, sessionToken: "" }).where(eq(users.id, user.id));
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, token.id));
  void sendPasswordChangedEmail(email, siteUrl()).catch((error) => console.error("Password changed email failed", error));
  return NextResponse.json({ ok: true });
}
