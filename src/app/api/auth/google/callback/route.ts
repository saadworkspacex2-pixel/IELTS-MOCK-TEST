import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, newSessionToken, USER_COOKIE } from "@/lib/userAuth";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  googleCallbackUrl,
  googleCookieOptions,
  googleOAuthConfigured,
} from "@/lib/googleAuth";
import { sendLoginAlertEmail, sendWelcomeEmail, siteUrl } from "@/lib/email";
import { sendLoginAlertSms, sendWelcomeSms } from "@/lib/sms";

type GoogleProfile = {
  email?: unknown;
  email_verified?: unknown;
  name?: unknown;
};

function loginUrl(reason: string) {
  return new URL(`/login?auth=${encodeURIComponent(reason)}`, siteUrl());
}

function fail(reason: string) {
  const response = NextResponse.redirect(loginUrl(reason));
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", googleCookieOptions(0));
  return response;
}

export async function GET(req: Request) {
  if (!googleOAuthConfigured()) return fail("google_not_configured");

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = (await cookies()).get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  if (url.searchParams.get("error") || !code || !state || !storedState || state !== storedState) {
    return fail(url.searchParams.get("error") ? "google_cancelled" : "google_security_check_failed");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleCallbackUrl(),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  const tokenData = (await tokenResponse.json().catch(() => null)) as { access_token?: unknown } | null;
  if (!tokenResponse.ok || typeof tokenData?.access_token !== "string") return fail("google_token_exchange_failed");

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    cache: "no-store",
  });
  const profile = (await profileResponse.json().catch(() => null)) as GoogleProfile | null;
  const email = typeof profile?.email === "string" ? profile.email.trim().toLowerCase() : "";
  if (!profileResponse.ok || !email || profile?.email_verified !== true) return fail("google_email_not_verified");

  let [user] = await db.select().from(users).where(eq(users.email, email));
  let isNewUser = false;
  if (!user) {
    const generatedPassword = randomGooglePassword();
    const { salt, hash } = hashPassword(generatedPassword);
    const displayName = typeof profile?.name === "string" ? profile.name.trim().slice(0, 120) : "";
    [user] = await db
      .insert(users)
      .values({
        email,
        nameEn: displayName,
        passwordHash: hash,
        salt,
      })
      .returning();
    isNewUser = true;
  }

  const sessionToken = newSessionToken();
  await db.update(users).set({ sessionToken }).where(eq(users.id, user.id));
  const displayName = user.nameBn || user.nameEn;
  if (isNewUser) {
    try { await sendWelcomeEmail(user.email, displayName, siteUrl()); } catch (error) { console.error("Google welcome email failed", error); }
    if (user.phone) {
      try { await sendWelcomeSms(user.phone, displayName); } catch (error) { console.error("Google welcome SMS failed", error); }
    }
  } else {
    try { await sendLoginAlertEmail(user.email, displayName, siteUrl()); } catch (error) { console.error("Google login email failed", error); }
    if (user.phone) {
      try { await sendLoginAlertSms(user.phone); } catch (error) { console.error("Google login SMS failed", error); }
    }
  }
  const response = NextResponse.redirect(new URL("/profile", siteUrl()));
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", googleCookieOptions(0));
  response.cookies.set(USER_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

function randomGooglePassword() {
  // The random value only fulfils the legacy password columns. Google accounts
  // authenticate through Google; a password can later be set via password reset.
  return randomUUID() + randomUUID();
}
