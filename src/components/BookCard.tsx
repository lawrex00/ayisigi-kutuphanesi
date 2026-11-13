import Link from "next/link";
import Image from "next/image";
import type { Book } from "@/lib/db/schema";
import { formatReadingTime } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  chapterCount?: number;
  showSummary?: boolean;
  /** Giriş yapılmamışsa kitap yerine giriş sayfasına yönlendir */
  requireLogin?: boolean;
}

export function BookCard({
  book,
  chapterCount = 0,
  showSummary = false,
  requireLogin = false,
}: BookCardProps) {
  const href = requireLogin
    ? `/giris?next=${encodeURIComponent(`/kitap/${book.slug}`)}`
    : `/kitap/${book.slug}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--glass-bg)] p-3 sm:p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] hover:shadow-[var(--color-accent)]/15 active:scale-[0.98]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[var(--color-border)] shadow-md">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg)]">
            <span
              className="font-serif text-xl font-bold leading-snug text-[var(--color-accent)]"
              style={{ fontFamily: "var(--font-literata), Literata, serif" }}
            >
              {book.title}
            </span>
          </div>
        )}

        {/* Apple tarzı cam badge: Bölüm Sayısı */}
        {chapterCount > 0 && (
          <div className="absolute bottom-2.5 right-2.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md shadow-sm">
            {chapterCount} Bölüm
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4 px-1 pb-1">
        <span className="mb-1 text-[10px] font-bold tracking-widest text-[var(--color-accent)] uppercase">
          Eser
        </span>
        <h3
          className="mb-1.5 font-serif text-lg sm:text-xl font-bold leading-tight text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1"
          style={{ fontFamily: "var(--font-literata), Literata, serif" }}
        >
          {book.title}
        </h3>
        {showSummary && book.summary && (
          <p className="mb-3 line-clamp-2 text-xs sm:text-sm leading-relaxed text-[var(--color-text-muted)]">
            {book.summary}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-[var(--color-border)]/60 text-xs text-[var(--color-text-muted)]">
          <span>{formatReadingTime(book.readingMinutes)}</span>
          <span className="text-[var(--color-accent)] font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Oku &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
