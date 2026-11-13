import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth-guard";
import { trackBookRead } from "@/lib/analytics-service";

export async function POST(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ detail: "Giriş gerekli" }, { status: 401 });
  }

  const body = await request.json();
  await trackBookRead(user.id, body.slug, body.chapter ? Number(body.chapter) : undefined);
  return NextResponse.json({ ok: true });
}
