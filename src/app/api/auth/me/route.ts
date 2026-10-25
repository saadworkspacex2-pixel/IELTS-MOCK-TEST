import { NextResponse } from "next/server";
import { currentUser } from "@/lib/userAuth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      nameEn: user.nameEn,
      nameBn: user.nameBn,
      avatar: user.avatar,
      membershipTier: user.membershipTier,
      premiumUntil: user.premiumUntil,
    },
  });
}

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const nameEn = body.nameEn !== undefined ? String(body.nameEn ?? "").trim() : user.nameEn;
  const nameBn = body.nameBn !== undefined ? String(body.nameBn ?? "").trim() : user.nameBn;
  const phone = body.phone !== undefined ? String(body.phone ?? "").trim() : user.phone;
  const avatar = body.avatar !== undefined ? String(body.avatar ?? "") : user.avatar;

  if (!nameBn && !nameEn) {
    return NextResponse.json({ error: "বাংলা অথবা ইংরেজি নাম লিখুন" }, { status: 400 });
  }
  if (nameBn.length > 120 || nameEn.length > 120) {
    return NextResponse.json({ error: "নাম সর্বোচ্চ ১২০ অক্ষরের হতে পারবে" }, { status: 400 });
  }
  if (phone.length > 32 || (phone && !/^[0-9+()\-\s]+$/.test(phone))) {
    return NextResponse.json({ error: "সঠিক মোবাইল নম্বর দিন" }, { status: 400 });
  }
  if (avatar.length > 1_500_000) {
    return NextResponse.json(
      { error: "প্রোফাইল ছবি সর্বোচ্চ ১ মেগাবাইট হতে পারবে" },
      { status: 400 },
    );
  }
  if (avatar && !avatar.startsWith("data:image/")) {
    return NextResponse.json({ error: "ছবির ফরম্যাট সঠিক নয়" }, { status: 400 });
  }

  const [updatedUser] = await db
    .update(users)
    .set({ nameEn, nameBn, phone, avatar })
    .where(eq(users.id, user.id))
    .returning({
      id: users.id,
      email: users.email,
      nameEn: users.nameEn,
      nameBn: users.nameBn,
      phone: users.phone,
      avatar: users.avatar,
    });
  return NextResponse.json({ ok: true, user: updatedUser });
}
