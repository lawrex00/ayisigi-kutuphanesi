import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapter } from "@/lib/db/queries";
import { Reader } from "@/components/Reader";
import { requireAuthUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; no: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, no } = await params;
  const data = await getChapter(slug, parseInt(no, 10));
  if (!data) return { title: "Bölüm bulunamadı" };
  return {
    title: `${data.chapter.title} — ${data.book.title}`,
  };
}

export default async function ChapterPage({ params }: Props) {
  const { slug, no } = await params;
  const chapterNo = parseInt(no, 10);
  if (isNaN(chapterNo) || chapterNo < 1) notFound();

  await requireAuthUser(`/kitap/${slug}/bolum/${no}`);

  const data = await getChapter(slug, chapterNo);
  if (!data) notFound();

  return (
    <Reader
      book={data.book}
      chapter={data.chapter}
      totalChapters={data.totalChapters}
    />
  );
}
