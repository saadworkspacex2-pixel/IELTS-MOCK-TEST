import { NextResponse } from "next/server";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/locale";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const locale = normalizeLocale(body?.locale);
  const response = NextResponse.json({ locale });
  response.cookies.set(LOCALE_COOKIE, locale, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
