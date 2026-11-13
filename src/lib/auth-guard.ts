import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, AuthUser } from "./api-config";
import { getUserById, verifyAccessToken } from "./auth-service";

export async function getAuthUserFromRequest(
  request: NextRequest
): Promise<AuthUser | null> {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  if (!payload) return null;
  return getUserById(payload.id);
}

export async function requireAuthUser(nextPath?: string): Promise<AuthUser> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  if (!token) {
    redirect(nextPath ? `/giris?next=${encodeURIComponent(nextPath)}` : "/giris");
  }

  const payload = await verifyAccessToken(token!);
  if (!payload) {
    redirect(nextPath ? `/giris?next=${encodeURIComponent(nextPath)}` : "/giris");
  }

  const user = await getUserById(payload!.id);
  if (!user) {
    redirect(nextPath ? `/giris?next=${encodeURIComponent(nextPath)}` : "/giris");
  }

  return user;
}
