import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { AuthUser } from "@/lib/api-config";

function getJwtSecret() {
  const secret =
    process.env.JWT_SECRET ||
    process.env.ADMIN_PASSWORD?.replace(/^["']|["']$/g, "") ||
    "ayisigi-dev-secret";
  return new TextEncoder().encode(secret);
}

export function toAuthUser(user: typeof schema.users.$inferSelect): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    is_admin: user.isAdmin === 1,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAccessToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    username: user.username,
    email: user.email,
    is_admin: user.is_admin,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getJwtSecret());
}

export async function verifyAccessToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const id = parseInt(String(payload.sub), 10);
    if (!id) return null;
    return {
      id,
      username: String(payload.username || ""),
      email: String(payload.email || ""),
      is_admin: Boolean(payload.is_admin),
    };
  } catch {
    return null;
  }
}

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
}): Promise<{ user: AuthUser } | { error: string }> {
  const db = getDb();
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();

  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (existing.length) return { error: "Bu e-posta zaten kayıtlı." };

  const existingName = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username));
  if (existingName.length) return { error: "Bu kullanıcı adı zaten alınmış." };

  const passwordHash = await hashPassword(input.password);
  const now = new Date().toISOString();

  const inserted = await db
    .insert(schema.users)
    .values({ username, email, passwordHash, createdAt: now })
    .returning();

  return { user: toAuthUser(inserted[0]) };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: AuthUser } | { error: string }> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.trim().toLowerCase()));

  const user = rows[0];
  if (!user?.passwordHash) return { error: "E-posta veya şifre hatalı." };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "E-posta veya şifre hatalı." };

  return { user: toAuthUser(user) };
}

export async function findOrCreateGoogleUser(profile: {
  googleId: string;
  email: string;
  name: string;
}): Promise<AuthUser> {
  const db = getDb();
  const byGoogle = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.googleId, profile.googleId));
  if (byGoogle[0]) return toAuthUser(byGoogle[0]);

  const byEmail = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, profile.email.toLowerCase()));
  if (byEmail[0]) {
    await db
      .update(schema.users)
      .set({ googleId: profile.googleId })
      .where(eq(schema.users.id, byEmail[0].id));
    return toAuthUser({ ...byEmail[0], googleId: profile.googleId });
  }

  const baseUsername = profile.name.replace(/\s+/g, "").toLowerCase().slice(0, 20) || "okur";
  let username = baseUsername;
  let n = 1;
  while (true) {
    const clash = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    if (!clash.length) break;
    username = `${baseUsername}${n++}`;
  }

  const now = new Date().toISOString();
  const inserted = await db
    .insert(schema.users)
    .values({
      username,
      email: profile.email.toLowerCase(),
      googleId: profile.googleId,
      createdAt: now,
    })
    .returning();

  return toAuthUser(inserted[0]);
}

export async function getUserById(id: number): Promise<AuthUser | null> {
  const db = getDb();
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, id));
  return rows[0] ? toAuthUser(rows[0]) : null;
}
