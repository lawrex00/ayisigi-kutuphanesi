import { NextRequest, NextResponse } from "next/server";
import { createAccessToken, findOrCreateGoogleUser } from "@/lib/auth-service";
import { AUTH_COOKIE, getSiteUrl } from "@/lib/api-config";
import { getAuthCookieOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const siteUrl = getSiteUrl();

  if (!code) {
    return NextResponse.redirect(new URL("/giris?hata=google", siteUrl));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/giris?hata=google", siteUrl));
  }

  const redirectUri = `${siteUrl}/api/auth/google/callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    return NextResponse.redirect(new URL("/giris?hata=google", siteUrl));
  }

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await profileRes.json();
  if (!profileRes.ok || !profile.sub || !profile.email) {
    return NextResponse.redirect(new URL("/giris?hata=google", siteUrl));
  }

  const user = await findOrCreateGoogleUser({
    googleId: profile.sub,
    email: profile.email,
    name: profile.name || profile.email.split("@")[0],
  });

  const access = await createAccessToken(user);
  const res = NextResponse.redirect(new URL("/", siteUrl));
  res.cookies.set(AUTH_COOKIE, access, getAuthCookieOptions());
  return res;
}
