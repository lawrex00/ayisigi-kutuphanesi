import { desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

export async function listComments() {
  const db = getDb();
  const rows = await db
    .select({
      id: schema.comments.id,
      text: schema.comments.text,
      createdAt: schema.comments.createdAt,
      author: schema.users.username,
    })
    .from(schema.comments)
    .innerJoin(schema.users, eq(schema.comments.userId, schema.users.id))
    .where(eq(schema.comments.isVisible, 1))
    .orderBy(desc(schema.comments.createdAt));

  const result = [];
  for (const row of rows) {
    const replies = await db
      .select({
        id: schema.commentReplies.id,
        text: schema.commentReplies.text,
        createdAt: schema.commentReplies.createdAt,
        adminName: schema.users.username,
      })
      .from(schema.commentReplies)
      .innerJoin(schema.users, eq(schema.commentReplies.adminUserId, schema.users.id))
      .where(eq(schema.commentReplies.commentId, row.id))
      .orderBy(schema.commentReplies.createdAt);

    result.push({
      id: row.id,
      author: row.author,
      text: row.text,
      created_at: row.createdAt,
      replies: replies.map((r) => ({
        id: r.id,
        text: r.text,
        admin_name: r.adminName,
        created_at: r.createdAt,
      })),
    });
  }
  return result;
}

export async function createComment(userId: number, text: string) {
  const db = getDb();
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Yorum metni gerekli");

  const inserted = await db
    .insert(schema.comments)
    .values({
      userId,
      text: trimmed.slice(0, 2000),
      createdAt: new Date().toISOString(),
    })
    .returning();

  return inserted[0];
}

export async function replyToComment(commentId: number, adminUserId: number, text: string) {
  const db = getDb();
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Yanıt metni gerekli");

  const comment = await db
    .select()
    .from(schema.comments)
    .where(eq(schema.comments.id, commentId));
  if (!comment[0]) throw new Error("Yorum bulunamadı");

  const inserted = await db
    .insert(schema.commentReplies)
    .values({
      commentId,
      adminUserId,
      text: trimmed.slice(0, 2000),
      createdAt: new Date().toISOString(),
    })
    .returning();

  const admin = await db
    .select({ username: schema.users.username })
    .from(schema.users)
    .where(eq(schema.users.id, adminUserId));

  return {
    id: inserted[0].id,
    text: inserted[0].text,
    admin_name: admin[0]?.username || "admin",
    created_at: inserted[0].createdAt,
  };
}
