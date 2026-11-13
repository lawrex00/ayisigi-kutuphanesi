import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { getDb, schema } from "./db";
import { createSlug } from "./utils";
import { countWords, estimateReadingMinutes } from "./db/queries";
import type { ParsedBook } from "./epub-parser";
import {
  fetchStoryDetails,
  fetchPartContent,
  fetchUserStories,
  downloadCoverImage,
  sleep,
  type WattpadStorySummary,
} from "./wattpad-client";

export async function saveCoverImage(
  coverBase64: string | undefined,
  coverMime: string | undefined,
  slug: string
): Promise<string | null> {
  if (!coverBase64 || !coverMime) return null;

  const ext = coverMime === "image/png" ? "png" : "jpg";
  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `${slug}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, Buffer.from(coverBase64, "base64"));
  return `/api/covers/${filename}`;
}

export async function saveCoverFromUrl(coverUrl: string, slug: string): Promise<string | null> {
  const buffer = await downloadCoverImage(coverUrl);
  if (!buffer) return null;

  const ext = coverUrl.includes(".png") ? "png" : "jpg";
  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `${slug}.${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  return `/api/covers/${filename}`;
}

export async function saveCoverFromLocalFile(sourcePath: string, slug: string): Promise<string | null> {
  if (!fs.existsSync(sourcePath)) return null;
  const ext = path.extname(sourcePath).slice(1) || "png";
  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  const filename = `${slug}.${ext}`;
  fs.copyFileSync(sourcePath, path.join(uploadsDir, filename));
  return `/api/covers/${filename}`;
}

interface ImportOptions {
  wattpadUrl?: string;
  wattpadId?: string;
  coverUrl?: string | null;
  localCoverPath?: string;
  publishBook?: boolean;
  publishChapters?: boolean;
}

export async function importBookToDb(
  parsed: ParsedBook,
  options: ImportOptions = {}
): Promise<{
  bookId: number;
  slug: string;
  chapterCount: number;
  updated: boolean;
  chaptersChanged: number;
}> {
  const db = getDb();
  const wattpadId = options.wattpadId || undefined;
  const slug = createSlug(parsed.title, wattpadId);
  const now = new Date().toISOString();

  const totalWords = parsed.chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
  const readingMinutes = estimateReadingMinutes(totalWords);

  let coverUrl: string | null = null;
  if (options.localCoverPath) {
    coverUrl = await saveCoverFromLocalFile(options.localCoverPath, slug);
  } else if (parsed.coverBase64 && parsed.coverMime) {
    coverUrl = await saveCoverImage(parsed.coverBase64, parsed.coverMime, slug);
  } else if (options.coverUrl) {
    coverUrl = await saveCoverFromUrl(options.coverUrl, slug);
  }

  const existing = wattpadId
    ? await db.select().from(schema.books).where(eq(schema.books.wattpadId, wattpadId)).limit(1)
    : await db.select().from(schema.books).where(eq(schema.books.slug, slug)).limit(1);

  let bookId: number;
  let updated = false;
  const publishBook = options.publishBook ? 1 : 0;
  const publishChapters =
    options.publishChapters !== undefined
      ? options.publishChapters
        ? 1
        : 0
      : existing[0]?.isPublished === 1
        ? 1
        : 0;

  if (existing[0]) {
    bookId = existing[0].id;
    updated = true;
    // Kapak korunur; özet Wattpad'den gelirse güncellenir (boşsa eski kalır)
    const nextSummary = parsed.summary?.trim() || existing[0].summary;
    const keepCover = existing[0].coverUrl || coverUrl;
    await db
      .update(schema.books)
      .set({
        title: parsed.title,
        author: parsed.author,
        summary: nextSummary,
        coverUrl: keepCover,
        wattpadUrl: options.wattpadUrl || existing[0].wattpadUrl,
        wattpadId: wattpadId || existing[0].wattpadId,
        readingMinutes,
        updatedAt: now,
      })
      .where(eq(schema.books.id, bookId));
  } else {
    const inserted = await db
      .insert(schema.books)
      .values({
        title: parsed.title,
        slug,
        author: parsed.author,
        summary: parsed.summary,
        coverUrl,
        wattpadUrl: options.wattpadUrl || null,
        wattpadId: wattpadId || null,
        isPublished: publishBook,
        readingMinutes,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: schema.books.id });

    bookId = inserted[0].id as number;
  }

  // Aynı kitabı senkronize et: bölümleri order ile güncelle / ekle, fazlaları sil
  const oldChapters = await db
    .select()
    .from(schema.chapters)
    .where(eq(schema.chapters.bookId, bookId));
  const oldByOrder = new Map(oldChapters.map((c) => [c.order, c]));
  const incomingOrders = new Set(parsed.chapters.map((c) => c.order));
  let chaptersChanged = 0;

  for (const ch of parsed.chapters) {
    const prev = oldByOrder.get(ch.order);
    if (prev) {
      const changed =
        prev.title !== ch.title ||
        prev.content !== ch.content ||
        prev.wordCount !== ch.wordCount;
      if (changed) {
        await db
          .update(schema.chapters)
          .set({
            title: ch.title,
            content: ch.content,
            wordCount: ch.wordCount,
            isPublished: publishChapters || prev.isPublished,
          })
          .where(eq(schema.chapters.id, prev.id));
        chaptersChanged += 1;
      }
    } else {
      await db.insert(schema.chapters).values({
        bookId,
        order: ch.order,
        title: ch.title,
        content: ch.content,
        wordCount: ch.wordCount,
        isPublished: publishChapters,
      });
      chaptersChanged += 1;
    }
  }

  for (const old of oldChapters) {
    if (!incomingOrders.has(old.order)) {
      await db.delete(schema.chapters).where(eq(schema.chapters.id, old.id));
      chaptersChanged += 1;
    }
  }

  return {
    bookId,
    slug: existing[0]?.slug || slug,
    chapterCount: parsed.chapters.length,
    updated,
    chaptersChanged,
  };
}

export async function importFromWattpadApi(
  storyId: number,
  options: { localCoverPath?: string; onProgress?: (msg: string) => void } = {}
): Promise<{ bookId: number; slug: string; chapterCount: number }> {
  const log = options.onProgress || (() => {});
  log(`Hikaye ${storyId} bilgileri alınıyor...`);

  const { story, parts } = await fetchStoryDetails(storyId);
  const chapters: ParsedBook["chapters"] = [];

  for (const part of parts) {
    log(`Bölüm ${part.order}/${parts.length}: ${part.title}`);
    const content = await fetchPartContent(part.id);
    const wordCount = countWords(content);
    if (wordCount < 3) continue;
    chapters.push({
      order: part.order,
      title: part.title,
      content,
      wordCount,
    });
    await sleep(1200);
  }

  if (chapters.length === 0) {
    throw new Error("Hiç bölüm içeriği alınamadı");
  }

  const parsed: ParsedBook = {
    title: story.title,
    author: story.author,
    summary: story.description,
    chapters,
  };

  return importBookToDb(parsed, {
    wattpadUrl: story.url,
    wattpadId: String(story.id),
    coverUrl: story.coverUrl,
    localCoverPath: options.localCoverPath,
    publishBook: false,
    publishChapters: false,
  });
}

export async function importAllUserStories(
  username: string,
  options: { onProgress?: (msg: string) => void } = {}
): Promise<Array<{ storyId: number; title: string; slug: string; chapterCount: number; error?: string }>> {
  const log = options.onProgress || (() => {});
  log(`@${username} kitapları listeleniyor...`);

  const stories = await fetchUserStories(username);
  log(`${stories.length} kitap bulundu`);

  const results: Array<{
    storyId: number;
    title: string;
    slug: string;
    chapterCount: number;
    error?: string;
  }> = [];

  for (const story of stories) {
    try {
      log(`İçe aktarılıyor: ${story.title}`);
      const r = await importFromWattpadApi(story.id, { onProgress: log });
      results.push({
        storyId: story.id,
        title: story.title,
        slug: r.slug,
        chapterCount: r.chapterCount,
      });
      await sleep(2000);
    } catch (e) {
      results.push({
        storyId: story.id,
        title: story.title,
        slug: "",
        chapterCount: 0,
        error: e instanceof Error ? e.message : "Hata",
      });
    }
  }

  return results;
}

export async function importFromWattpadDownloader(
  storyUrl: string
): Promise<{ bookId: number; slug: string; chapterCount: number }> {
  const downloaderUrl = process.env.WATTPAD_DOWNLOADER_URL || "http://localhost:5042";
  const storyIdMatch = storyUrl.match(/(\d+)/);
  if (!storyIdMatch) throw new Error("Geçersiz Wattpad URL");

  const storyId = storyIdMatch[1];

  const endpoints = [
    `${downloaderUrl}/download?url=${encodeURIComponent(storyUrl)}`,
    `${downloaderUrl}/api/download?url=${encodeURIComponent(storyUrl)}`,
    `${downloaderUrl}/download/${storyId}`,
    `${downloaderUrl}/api/v1/download?story_id=${storyId}`,
  ];

  let epubBuffer: Buffer | null = null;
  let lastError = "";

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { Accept: "application/epub+zip, application/octet-stream, */*" },
        signal: AbortSignal.timeout(300000),
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 100) {
          epubBuffer = buf;
          break;
        }
      }
      lastError = `${endpoint}: ${res.status}`;
    } catch (e) {
      lastError = `${endpoint}: ${e instanceof Error ? e.message : "hata"}`;
    }
  }

  if (!epubBuffer) {
    // Wattpad API fallback
    return importFromWattpadApi(parseInt(storyId, 10));
  }

  const { parseEpub } = await import("./epub-parser");
  const parsed = await parseEpub(epubBuffer);
  return importBookToDb(parsed, {
    wattpadUrl: storyUrl,
    wattpadId: storyId,
    publishBook: false,
    publishChapters: false,
  });
}

export async function importFromEpubBuffer(
  buffer: Buffer,
  wattpadUrl?: string
): Promise<{ bookId: number; slug: string; chapterCount: number }> {
  const { parseEpub } = await import("./epub-parser");
  const parsed = await parseEpub(buffer);
  const wattpadId = wattpadUrl?.match(/(\d+)/)?.[1];
  return importBookToDb(parsed, {
    wattpadUrl,
    wattpadId,
    publishBook: false,
    publishChapters: false,
  });
}

export async function deleteBook(bookId: number): Promise<void> {
  const db = getDb();
  const book = (
    await db.select().from(schema.books).where(eq(schema.books.id, bookId)).limit(1)
  )[0];

  if (!book) throw new Error("Kitap bulunamadı");

  if (book.coverUrl?.startsWith("/api/covers/")) {
    const filename = path.basename(book.coverUrl);
    const filepath = path.join(process.cwd(), "data", "uploads", filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  }

  await db.delete(schema.books).where(eq(schema.books.id, bookId));
}

export async function upsertBookMetadata(
  story: WattpadStorySummary,
  options: { localCoverPath?: string; summary?: string }
): Promise<{ bookId: number; slug: string }> {
  const slug = createSlug(story.title, story.id);
  const now = new Date().toISOString();
  const db = getDb();

  let coverUrl: string | null = null;
  if (options.localCoverPath) {
    coverUrl = await saveCoverFromLocalFile(options.localCoverPath, slug);
  } else if (story.coverUrl) {
    coverUrl = await saveCoverFromUrl(story.coverUrl, slug);
  }

  const existing = await db
    .select()
    .from(schema.books)
    .where(eq(schema.books.wattpadId, String(story.id)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(schema.books)
      .set({
        title: story.title,
        summary: existing[0].summary?.trim() || options.summary || story.description,
        coverUrl: existing[0].coverUrl || coverUrl,
        wattpadUrl: story.url,
        updatedAt: now,
      })
      .where(eq(schema.books.id, existing[0].id));
    return { bookId: existing[0].id, slug: existing[0].slug };
  }

  const inserted = await db
    .insert(schema.books)
    .values({
      title: story.title,
      slug,
      author: story.author,
      summary: options.summary || story.description,
      coverUrl,
      wattpadUrl: story.url,
      wattpadId: String(story.id),
      isPublished: 0,
      readingMinutes: 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: schema.books.id });

  return { bookId: inserted[0].id as number, slug };
}
