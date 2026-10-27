import { NextResponse } from "next/server";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  googleCallbackUrl,
  googleCookieOptions,
  googleOAuthConfigured,
  newGoogleOAuthState,
} from "@/lib/googleAuth";
import { siteUrl } from "@/lib/email";

export async function GET() {
  if (!googleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?auth=google_not_configured", siteUrl()));
  }

  const state = newGoogleOAuthState();
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleCallbackUrl(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, googleCookieOptions(10 * 60));
  return response;
}
