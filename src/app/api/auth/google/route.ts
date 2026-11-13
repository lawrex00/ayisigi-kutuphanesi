import { NextRequest, NextResponse } from "next/server";
import { createAccessToken, findOrCreateGoogleUser } from "@/lib/auth-service";
import { AUTH_COOKIE, getSiteUrl } from "@/lib/api-config";
import { getAuthCookieOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    // Ham bir JSON/503 sayfası göstermek yerine, formun zaten anladığı
    // ?hata= parametresiyle kullanıcıyı geri yönlendiriyoruz.
    const referer = request.headers.get("referer") || "";
    const backTo = referer.includes("/kayit") ? "/kayit" : "/giris";
    // request.url'i DEĞİL, gerçek Host başlığını kullanıyoruz: sunucu
    // HOSTNAME=0.0.0.0 ile dinlediğinde (tünel/reverse-proxy arkasında)
    // request.url bazen "0.0.0.0:3000" gibi dinleme adresini yansıtıyor,
    // tarayıcı da bunu açamıyor. X-Forwarded-Host / Host, isteği gerçekte
    // hangi adresten yaptığını (örn. the-tunnel.trycloudflare.com) söyler.
    const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : getSiteUrl();
    return NextResponse.redirect(`${origin}${backTo}?hata=google-yapilandirilmadi`);
  }

  const siteUrl = getSiteUrl();
  const redirectUri = `${siteUrl}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

export async function POST(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const siteUrl = getSiteUrl();
  if (!clientId) {
    return NextResponse.json({ url: null, configured: false });
  }
  return NextResponse.json({
    configured: true,
    url: `${siteUrl}/api/auth/google`,
  });
}
