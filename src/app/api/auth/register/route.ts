import { NextRequest, NextResponse } from "next/server";
import { createAccessToken, registerUser } from "@/lib/auth-service";
import { AUTH_COOKIE } from "@/lib/api-config";
import { getAuthCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await registerUser({
    username: body.username || "",
    email: body.email || "",
    password: body.password || "",
  });

  if ("error" in result) {
    return NextResponse.json(
      { email: [result.error], username: [result.error] },
      { status: 400 }
    );
  }

  const access = await createAccessToken(result.user);
  const res = NextResponse.json({ user: result.user }, { status: 201 });
  res.cookies.set(AUTH_COOKIE, access, getAuthCookieOptions());
  return res;
}
