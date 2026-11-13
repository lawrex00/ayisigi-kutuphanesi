import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBookWithChapters } from "@/lib/db/queries";
import { formatReadingTime } from "@/lib/utils";
import { SiteHeader } from "@/components/SiteHeader";
import { requireAuthUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookWithChapters(slug);
  if (!book) return { title: "Kitap bulunamadı" };
  return {
    title: book.title,
    description: book.summary || `${book.title} - ${book.author}`,
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  await requireAuthUser(`/kitap/${slug}`);
  const book = await getBookWithChapters(slug);
  if (!book) notFound();

  const { chapters, ...bookData } = book;

  return (
    <div className="site-transparent min-h-screen bg-[var(--color-bg)]">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-[var(--color-accent)] hover:opacity-70"
        >
          ← Kütüphaneye dön
        </Link>
        <div className="mb-12 flex flex-col gap-8 md:flex-row">
          <div className="relative mx-auto aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-2xl bg-[var(--color-border)] shadow-md md:mx-0 md:w-56">
            {bookData.coverUrl ? (
              <Image
                src={bookData.coverUrl}
                alt={bookData.title}
                fill
                className="object-cover"
                sizes="224px"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center">
                <span className="font-serif text-lg text-[var(--color-accent)]">{bookData.title}</span>
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1
              className="mb-3 font-serif text-3xl text-[var(--color-text)] md:text-4xl"
              style={{ fontFamily: "var(--font-literata), Literata, serif" }}
            >
              {bookData.title}
            </h1>
            {bookData.summary && (
              <p className="mb-6 leading-relaxed text-[var(--color-text-muted)]">{bookData.summary}</p>
            )}
            <p className="mb-8 text-sm text-[var(--color-text-muted)]">
              {chapters.length} bölüm · {formatReadingTime(bookData.readingMinutes)}
            </p>

            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              {chapters.length > 0 && (
                <Link
                  href={`/kitap/${bookData.slug}/bolum/1`}
                  className="rounded-full bg-[var(--color-accent)] px-8 py-3 text-sm font-medium text-[var(--color-btn-text)] transition-opacity hover:opacity-90"
                >
                  Okumaya Başla
                </Link>
              )}
              {chapters.length > 0 && (
                <a
                  href={`/api/pdf/${bookData.slug}`}
                  className="rounded-full border border-[var(--color-border)] px-8 py-3 text-sm text-[var(--color-accent)] transition-colors hover:bg-[var(--color-border)]"
                >
                  PDF İndir
                </a>
              )}
            </div>
          </div>
        </div>

        {chapters.length > 0 && (
          <section>
            <h2 className="mb-6 font-serif text-xl text-[var(--color-text)]">Bölümler</h2>
            <ul className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              {chapters.map((ch) => (
                <li key={ch.id}>
                  <Link
                    href={`/kitap/${bookData.slug}/bolum/${ch.order}`}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--color-border)]"
                  >
                    <span className="text-[var(--color-text)]">
                      <span className="mr-3 text-sm text-[var(--color-accent)]">{ch.order}.</span>
                      {ch.title}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {Math.max(1, Math.ceil(ch.wordCount / 200))} dk
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
