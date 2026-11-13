import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "https://www.wattpad.com",
  "https://wattpad.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "chrome-extension://",
];

const AUTH_COOKIE = "ayisigi_access";
const PROTECTED_PREFIXES = ["/kitap/"];
const PROTECTED_API_PREFIXES = ["/api/pdf/"];

function corsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const allowed =
    ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) || origin.startsWith("chrome-extension://");

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": allowed ? origin : "https://www.wattpad.com",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-password, Authorization",
  };

  if (
    request.headers.get("Access-Control-Request-Private-Network") === "true" ||
    origin.includes("wattpad.com") ||
    origin.startsWith("chrome-extension://")
  ) {
    headers["Access-Control-Allow-Private-Network"] = "true";
  }

  return headers;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/import")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
    }
    const response = NextResponse.next();
    const headers = corsHeaders(request);
    for (const [k, v] of Object.entries(headers)) {
      response.headers.set(k, v);
    }
    return response;
  }

  const needsAuth =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));

  if (needsAuth && !request.cookies.get(AUTH_COOKIE)?.value) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }
    const login = new URL("/giris", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/import/:path*", "/kitap/:path*", "/api/pdf/:path*"],
};
