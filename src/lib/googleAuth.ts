import { randomBytes } from "crypto";
import { siteUrl } from "@/lib/email";

export const GOOGLE_OAUTH_STATE_COOKIE = "lhbd_google_oauth_state";

export function googleOAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleCallbackUrl() {
  return new URL("/api/auth/google/callback", siteUrl()).toString();
}

export function newGoogleOAuthState() {
  return randomBytes(32).toString("base64url");
}

export function googleCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/google",
    maxAge,
  };
}
