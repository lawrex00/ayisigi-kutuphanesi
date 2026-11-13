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
      className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200 hover:border-[var(--color-accent)] hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row lg:flex-col">
        <div className="relative aspect-[2/3] w-full shrink-0 overflow-hidden bg-[var(--color-border)] sm:w-40 lg:w-full">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <span
                className="font-serif text-xl leading-snug text-[var(--color-accent)]"
                style={{ fontFamily: "var(--font-literata), Literata, serif" }}
              >
                {book.title}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="mb-2 text-xs font-medium tracking-widest text-[var(--color-accent)] uppercase">
            Kitap
          </p>
          <h2
            className="mb-2 font-serif text-xl leading-snug text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-literata), Literata, serif" }}
          >
            {book.title}
          </h2>
          {showSummary && book.summary && (
            <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {book.summary}
            </p>
          )}
          <p className="mt-auto text-sm text-[var(--color-text-muted)]">
            {chapterCount > 0 && `${chapterCount} bölüm · `}
            {formatReadingTime(book.readingMinutes)}
          </p>
        </div>
      </div>
    </Link>
  );
}
