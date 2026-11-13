import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth-guard";
import { trackVisit } from "@/lib/analytics-service";

const VISIT_COOKIE = "ayisigi_sid";

export async function POST(request: NextRequest) {
  let sessionKey = request.cookies.get(VISIT_COOKIE)?.value;
  if (!sessionKey) {
    sessionKey = crypto.randomUUID();
  }

  const user = await getAuthUserFromRequest(request);
  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path : "/";

  await trackVisit(sessionKey, path, user?.id);

  const res = NextResponse.json({ ok: true });
  if (!request.cookies.get(VISIT_COOKIE)?.value) {
    res.cookies.set(VISIT_COOKIE, sessionKey, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}
