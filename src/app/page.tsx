import { getPublishedBooks } from "@/lib/db/queries";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { BookCard } from "@/components/BookCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SocialLinks } from "@/components/SocialLinks";
import { CommentsSection } from "@/components/CommentsSection";
import { WelcomeHero } from "@/components/WelcomeHero";
import { ABOUT_TEXT } from "@/lib/site-config";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getBooksWithChapterCounts() {
  const books = await getPublishedBooks();
  const db = getDb();

  return Promise.all(
    books.map(async (book) => {
      const chs = (await db
        .select()
        .from(schema.chapters)
        .where(eq(schema.chapters.bookId, book.id))) as typeof schema.chapters.$inferSelect[];
      return { book, chapterCount: chs.filter((c) => c.isPublished === 1).length };
    })
  );
}

export default async function HomePage() {
  const books = await getBooksWithChapterCounts();
  const user = await getAuthUser();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Ay Işığı Kütüphanesi";

  return (
    <div className="site-transparent min-h-screen bg-[var(--color-bg)]">
      <SiteHeader />
      <WelcomeHero />

      <main className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <h2
          className="mb-10 font-serif text-2xl text-[var(--color-text)] md:text-3xl"
          style={{ fontFamily: "var(--font-literata), Literata, serif" }}
        >
          Kitaplar
        </h2>

        {books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
            <p className="font-serif text-xl text-[var(--color-text)]">Henüz yayında kitap yok</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {books.map(({ book, chapterCount }) => (
              <BookCard
                key={book.id}
                book={book}
                chapterCount={chapterCount}
                showSummary
                requireLogin={!user}
              />
            ))}
          </div>
        )}
      </main>

      <section className="site-transparent border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2
            className="mb-8 font-serif text-2xl text-[var(--color-text)] md:text-3xl"
            style={{ fontFamily: "var(--font-literata), Literata, serif" }}
          >
            Hakkımda
          </h2>
          <p className="text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
            {ABOUT_TEXT}
          </p>
        </div>
      </section>

      <CommentsSection />

      <section className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <h2
            className="mb-10 font-serif text-2xl text-[var(--color-text)] md:text-3xl"
            style={{ fontFamily: "var(--font-literata), Literata, serif" }}
          >
            İletişim
          </h2>
          <SocialLinks className="mx-auto max-w-xl" />
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] py-8 text-center text-sm text-[var(--color-text-muted)]">
        <p>{siteName}</p>
      </footer>
    </div>
  );
}
