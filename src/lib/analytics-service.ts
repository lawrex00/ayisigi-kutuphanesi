import { and, desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

export async function trackVisit(sessionKey: string, path: string, userId?: number) {
  const db = getDb();
  await db.insert(schema.siteVisits).values({
    sessionKey: sessionKey.slice(0, 64),
    path: path.slice(0, 500),
    userId: userId ?? null,
    createdAt: new Date().toISOString(),
  });
}

export async function trackBookRead(userId: number, slug: string, chapterOrder?: number) {
  const db = getDb();
  const bookRows = await db.select().from(schema.books).where(eq(schema.books.slug, slug));
  const book = bookRows[0];
  if (!book) return;

  let chapterId: number | null = null;
  if (chapterOrder) {
    const ch = await db
      .select()
      .from(schema.chapters)
      .where(and(eq(schema.chapters.bookId, book.id), eq(schema.chapters.order, chapterOrder)));
    chapterId = ch[0]?.id ?? null;
  }

  await db.insert(schema.bookReads).values({
    userId,
    bookId: book.id,
    chapterId,
    createdAt: new Date().toISOString(),
  });
}

export async function getDashboardStats() {
  const db = getDb();

  const registeredUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users);
  const totalReads = await db.select({ count: sql<number>`count(*)` }).from(schema.bookReads);
  const uniqueReaders = await db
    .select({ count: sql<number>`count(distinct ${schema.bookReads.userId})` })
    .from(schema.bookReads);
  const uniqueVisitors = await db
    .select({ count: sql<number>`count(distinct ${schema.siteVisits.sessionKey})` })
    .from(schema.siteVisits);

  const publishedBooks = await db
    .select()
    .from(schema.books)
    .where(eq(schema.books.isPublished, 1));

  const bookStats = [];
  const completedUserIds = new Set<number>();

  for (const book of publishedBooks) {
    const chapters = await db
      .select()
      .from(schema.chapters)
      .where(and(eq(schema.chapters.bookId, book.id), eq(schema.chapters.isPublished, 1)))
      .orderBy(desc(schema.chapters.order));

    const lastChapter = chapters[0];
    const readersRows = await db
      .select({ count: sql<number>`count(distinct ${schema.bookReads.userId})` })
      .from(schema.bookReads)
      .where(eq(schema.bookReads.bookId, book.id));
    const readers = readersRows[0]?.count ?? 0;

    let completers = 0;
    if (lastChapter) {
      const compRows = await db
        .select({ count: sql<number>`count(distinct ${schema.bookReads.userId})` })
        .from(schema.bookReads)
        .where(
          and(
            eq(schema.bookReads.bookId, book.id),
            eq(schema.bookReads.chapterId, lastChapter.id)
          )
        );
      completers = compRows[0]?.count ?? 0;

      const compUsers = await db
        .select({ userId: schema.bookReads.userId })
        .from(schema.bookReads)
        .where(eq(schema.bookReads.chapterId, lastChapter.id));
      compUsers.forEach((u) => completedUserIds.add(u.userId));
    }

    const readEventsRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.bookReads)
      .where(eq(schema.bookReads.bookId, book.id));

    bookStats.push({
      title: book.title,
      slug: book.slug,
      chapters: chapters.length,
      readers,
      completers,
      read_events: readEventsRows[0]?.count ?? 0,
      completion_rate: readers ? Math.round((completers / readers) * 100) : 0,
    });
  }

  bookStats.sort((a, b) => b.readers - a.readers);

  return {
    registered_users: registeredUsers[0]?.count ?? 0,
    total_reads: totalReads[0]?.count ?? 0,
    unique_readers: uniqueReaders[0]?.count ?? 0,
    unique_visitors: uniqueVisitors[0]?.count ?? 0,
    unique_completers: completedUserIds.size,
    book_stats: bookStats,
  };
}
