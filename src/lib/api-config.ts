export const AUTH_COOKIE = "ayisigi_access";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/** Google ile giriş/kayıt gerçekten kullanılabilir mi (gerçek kimlik bilgileri tanımlı mı) */
export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID);
}
