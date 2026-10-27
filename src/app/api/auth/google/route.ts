import { NextResponse } from "next/server";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  googleCallbackUrl,
  googleCookieOptions,
  googleOAuthConfigured,
  newGoogleOAuthState,
} from "@/lib/googleAuth";
import { siteUrl } from "@/lib/email";

export async function GET(req: Request) {
  if (!googleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?auth=google_not_configured", siteUrl()));
  }

  // OAuth state is stored in an HttpOnly cookie. If someone starts from a
  // www/custom/preview alias while the OAuth callback uses the canonical site
  // URL, the cookie would otherwise be on the wrong host and the callback must
  // fail its CSRF check. Start the flow from the canonical host instead.
  const canonicalUrl = new URL(siteUrl());
  const requestUrl = new URL(req.url);
  if (requestUrl.origin !== canonicalUrl.origin) {
    return NextResponse.redirect(new URL("/api/auth/google", canonicalUrl));
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
