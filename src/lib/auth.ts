import { cookies } from "next/headers";
import { AUTH_COOKIE, AuthUser } from "./api-config";
import { getUserById, verifyAccessToken } from "./auth-service";

export async function getAuthUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  const user = await getUserById(payload.id);
  return user;
}

export function getAuthCookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
