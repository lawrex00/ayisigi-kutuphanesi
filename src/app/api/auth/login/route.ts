import { NextRequest, NextResponse } from "next/server";
import {
  createAccessToken,
  loginUser,
  registerUser,
} from "@/lib/auth-service";
import { AUTH_COOKIE } from "@/lib/api-config";
import { getAuthCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await loginUser(body.email || "", body.password || "");

  if ("error" in result) {
    return NextResponse.json({ detail: result.error }, { status: 400 });
  }

  const access = await createAccessToken(result.user);
  const res = NextResponse.json({ user: result.user });
  res.cookies.set(AUTH_COOKIE, access, getAuthCookieOptions());
  return res;
}
