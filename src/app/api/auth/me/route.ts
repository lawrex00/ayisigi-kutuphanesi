import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/api-config";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  return NextResponse.json({ user });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(AUTH_COOKIE);
  return res;
}
