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
    <div className="site-transparent min-h-screen">
      <SiteHeader />
      <WelcomeHero />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <span className="section-label text-[10px] sm:text-xs">Koleksiyon</span>
            <h2
              className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-literata), Literata, serif" }}
            >
              Kitaplar
            </h2>
          </div>
          <span className="text-xs text-[var(--color-text-muted)] font-medium">
            {books.length} Eser
          </span>
        </div>

        {books.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-8 sm:p-12 text-center">
            <p className="font-serif text-lg text-[var(--color-text)]">Henüz yayında kitap yok</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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

      <section className="border-t border-[var(--color-border)]/50 bg-[var(--glass-bg)] backdrop-blur-xl my-6">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
          <span className="section-label text-[10px] sm:text-xs">Yazar</span>
          <h2
            className="mb-4 sm:mb-6 font-serif text-2xl sm:text-3xl font-bold text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-literata), Literata, serif" }}
          >
            Hakkımda
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[var(--color-text-muted)]">
            {ABOUT_TEXT}
          </p>
        </div>
      </section>

      <CommentsSection />

      <section className="border-t border-[var(--color-border)]/50">
        <div className="mx-auto max-w-3xl px-5 py-12 text-center sm:py-16">
          <span className="section-label text-[10px] sm:text-xs">Topluluk</span>
          <h2
            className="mb-6 sm:mb-8 font-serif text-2xl sm:text-3xl font-bold text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-literata), Literata, serif" }}
          >
            İletişim & Sosyal Medya
          </h2>
          <SocialLinks className="mx-auto max-w-xl" />
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)]/50 py-6 text-center text-xs text-[var(--color-text-muted)]">
        <p>{siteName} &bull; Geceye Fısıldayan Sözler</p>
      </footer>
    </div>
  );
}
