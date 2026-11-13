import { eq, asc } from "drizzle-orm";
import { getDb, schema } from "./index";
import type { Book, Chapter } from "./schema";

export type BookWithChapters = Book & { chapters: Chapter[] };

export type BookAdmin = Book & {
  chapterCount: number;
  publishedChapterCount: number;
};

/** Herkese açık kütüphane — yalnızca yayınlanmış kitaplar */
export async function getPublishedBooks(): Promise<Book[]> {
  const db = getDb();
  return db
    .select()
    .from(schema.books)
    .where(eq(schema.books.isPublished, 1))
    .orderBy(asc(schema.books.title)) as Promise<Book[]>;
}

export async function getAllBooks(): Promise<Book[]> {
  const db = getDb();
  return db.select().from(schema.books).orderBy(asc(schema.books.title)) as Promise<Book[]>;
}

export async function getAdminBooks(): Promise<BookAdmin[]> {
  const books = await getAllBooks();
  const db = getDb();

  return Promise.all(
    books.map(async (book) => {
      const chs = (await db
        .select()
        .from(schema.chapters)
        .where(eq(schema.chapters.bookId, book.id))) as Chapter[];
      return {
        ...book,
        chapterCount: chs.length,
        publishedChapterCount: chs.filter((c) => c.isPublished === 1).length,
      };
    })
  );
}

export async function getBookBySlug(slug: string, publishedOnly = true): Promise<Book | undefined> {
  const db = getDb();
  const results = await db
    .select()
    .from(schema.books)
    .where(eq(schema.books.slug, slug))
    .limit(1);
  const book = results[0] as Book | undefined;
  if (!book) return undefined;
  if (publishedOnly && book.isPublished !== 1) return undefined;
  return book;
}

export async function getBookWithChapters(
  slug: string,
  publishedOnly = true
): Promise<BookWithChapters | null> {
  const book = await getBookBySlug(slug, publishedOnly);
  if (!book) return null;

  const db = getDb();
  const allChapters = (await db
    .select()
    .from(schema.chapters)
    .where(eq(schema.chapters.bookId, book.id))
    .orderBy(asc(schema.chapters.order))) as Chapter[];

  const chapters = publishedOnly
    ? allChapters.filter((c) => c.isPublished === 1)
    : allChapters;

  return { ...book, chapters };
}

export async function getChapter(
  bookSlug: string,
  chapterOrder: number,
  publishedOnly = true
): Promise<{ book: Book; chapter: Chapter; totalChapters: number } | null> {
  const data = await getBookWithChapters(bookSlug, publishedOnly);
  if (!data) return null;

  const chapter = data.chapters.find((c) => c.order === chapterOrder);
  if (!chapter) return null;

  const { chapters: _, ...book } = data;
  return { book, chapter, totalChapters: data.chapters.length };
}

export function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").length;
}

export function estimateReadingMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

export async function deleteBookById(bookId: number): Promise<boolean> {
  const db = getDb();
  const book = (await db.select().from(schema.books).where(eq(schema.books.id, bookId)).limit(1))[0] as
    | Book
    | undefined;
  if (!book) return false;

  await db.delete(schema.books).where(eq(schema.books.id, bookId));
  return true;
}

export async function setBookPublished(bookId: number, published: boolean) {
  const db = getDb();
  await db
    .update(schema.books)
    .set({ isPublished: published ? 1 : 0, updatedAt: new Date().toISOString() })
    .where(eq(schema.books.id, bookId));
}

export async function publishAllChaptersForBook(bookId: number) {
  const db = getDb();
  await db
    .update(schema.chapters)
    .set({ isPublished: 1 })
    .where(eq(schema.chapters.bookId, bookId));
}

export async function setChapterPublished(chapterId: number, published: boolean) {
  const db = getDb();
  await db
    .update(schema.chapters)
    .set({ isPublished: published ? 1 : 0 })
    .where(eq(schema.chapters.id, chapterId));
}

export async function getBookById(bookId: number): Promise<Book | undefined> {
  const db = getDb();
  const results = await db.select().from(schema.books).where(eq(schema.books.id, bookId)).limit(1);
  return results[0] as Book | undefined;
}

export async function getChaptersForAdmin(bookId: number): Promise<Chapter[]> {
  const db = getDb();
  return db
    .select()
    .from(schema.chapters)
    .where(eq(schema.chapters.bookId, bookId))
    .orderBy(asc(schema.chapters.order)) as Promise<Chapter[]>;
}
