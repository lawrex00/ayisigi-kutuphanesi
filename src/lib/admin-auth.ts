import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export function getAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD || "okuma2026").replace(/^["']|["']$/g, "");
}

export function createAdminSessionToken(): string {
  return crypto.createHmac("sha256", getAdminPassword()).update("wattpad-admin").digest("hex");
}

export function checkAdminCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const expected = createAdminSessionToken();
  try {
    return crypto.timingSafeEqual(Buffer.from(cookieValue), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkAdminAuth(request: NextRequest): boolean {
  const password = getAdminPassword();
  const authHeader = request.headers.get("authorization");
  const provided = request.headers.get("x-admin-password")?.trim() || "";
  if (authHeader === `Bearer ${password}`) return true;
  if (provided === password) return true;
  return checkAdminCookie(request.cookies.get("wattpad_admin")?.value);
}

export function unauthorized() {
  return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
}

export function adminCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
