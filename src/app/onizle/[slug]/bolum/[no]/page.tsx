import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { checkAdminCookie } from "@/lib/admin-auth";
import { getChapter } from "@/lib/db/queries";
import { Reader } from "@/components/Reader";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; no: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, no } = await params;
  const data = await getChapter(slug, parseInt(no, 10), false);
  if (!data) return { title: "Bölüm bulunamadı" };
  return { title: `${data.chapter.title} — ${data.book.title} (Önizleme)` };
}

export default async function PreviewChapterPage({ params }: Props) {
  const cookieStore = await cookies();
  if (!checkAdminCookie(cookieStore.get("wattpad_admin")?.value)) {
    redirect("/admin");
  }

  const { slug, no } = await params;
  const chapterNo = parseInt(no, 10);
  if (isNaN(chapterNo) || chapterNo < 1) notFound();

  const data = await getChapter(slug, chapterNo, false);
  if (!data) notFound();

  return (
    <Reader
      book={data.book}
      chapter={data.chapter}
      totalChapters={data.totalChapters}
      previewBasePath={`/onizle/${slug}/bolum`}
    />
  );
}
