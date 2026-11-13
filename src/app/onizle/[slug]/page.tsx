import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { checkAdminCookie } from "@/lib/admin-auth";
import { getBookWithChapters } from "@/lib/db/queries";
import { formatReadingTime } from "@/lib/utils";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookWithChapters(slug, false);
  if (!book) return { title: "Kitap bulunamadı" };
  return { title: `${book.title} (Önizleme)` };
}

export default async function PreviewBookPage({ params }: Props) {
  const cookieStore = await cookies();
  if (!checkAdminCookie(cookieStore.get("wattpad_admin")?.value)) {
    redirect("/admin");
  }

  const { slug } = await params;
  const book = await getBookWithChapters(slug, false);
  if (!book) notFound();

  const { chapters, ...bookData } = book;

  return (
    <div className="site-transparent min-h-screen bg-[var(--color-bg)]">
      <SiteHeader />

      <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-sm text-amber-900">
        Önizleme modu — yalnızca sen görüyorsun. Yayınlamak için admin paneline dön.
      </div>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="mb-8 inline-block text-sm text-[var(--color-accent)] hover:opacity-70">
          ← Admin paneli
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
                  href={`/onizle/${bookData.slug}/bolum/1`}
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
                    href={`/onizle/${bookData.slug}/bolum/${ch.order}`}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--color-border)]"
                  >
                    <span className="text-[var(--color-text)]">
                      <span className="mr-3 text-sm text-[var(--color-accent)]">{ch.order}.</span>
                      {ch.title}
                      {ch.isPublished !== 1 && (
                        <span className="ml-2 text-xs text-amber-700">taslak</span>
                      )}
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
