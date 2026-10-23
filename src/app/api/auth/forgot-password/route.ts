import { createHash, randomInt } from "crypto";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { sendPasswordResetCodeEmail } from "@/lib/email";

const hashCode = (email: string, code: string) => createHash("sha256").update(`${email.toLowerCase()}:${code}`).digest("hex");

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json({ error: "সঠিক ইমেইল দিন" }, { status: 400 });
  const [user] = await db.select().from(users).where(eq(users.email, email));
  // Return the same response for known and unknown emails to protect accounts.
  if (!user) return NextResponse.json({ ok: true });
  const code = String(randomInt(100000, 1_000_000));
  await db.insert(passwordResetTokens).values({ userId: user.id, codeHash: hashCode(email, code), expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
  void sendPasswordResetCodeEmail(email, code).catch((error) => console.error("Password reset email failed", error));
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
