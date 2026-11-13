import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, createAdminSessionToken, getAdminPassword, adminCookieOptions } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const password = getAdminPassword();
  const body = await request.json().catch(() => ({}));
  const provided = String(body.password || "").trim();

  if (provided !== password) {
    return NextResponse.json({ error: "Şifre yanlış" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  const secure = request.nextUrl.protocol === "https:";
  response.cookies.set("wattpad_admin", createAdminSessionToken(), adminCookieOptions(secure));
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set("wattpad_admin", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({ authenticated: true });
}
