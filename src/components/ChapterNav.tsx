"use client";

import Link from "next/link";
import { THEMES } from "@/lib/reading-preferences";
import type { ReadingTheme } from "@/lib/reading-preferences";

interface ChapterNavProps {
  bookSlug: string;
  currentChapter: number;
  totalChapters: number;
  theme: ReadingTheme;
  progress: number;
  chapterBasePath?: string;
}

export function ChapterNav({
  bookSlug,
  currentChapter,
  totalChapters,
  theme,
  progress,
  chapterBasePath,
}: ChapterNavProps) {
  const colors = THEMES[theme];
  const hasPrev = currentChapter > 1;
  const hasNext = currentChapter < totalChapters;
  const base = chapterBasePath || `/kitap/${bookSlug}/bolum`;
  const bookPath = chapterBasePath ? `/onizle/${bookSlug}` : `/kitap/${bookSlug}`;

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-4 text-sm"
      style={{ color: colors.accent }}
    >
      {hasPrev ? (
        <Link
          href={`${base}/${currentChapter - 1}`}
          className="flex items-center gap-1 transition-opacity hover:opacity-70"
        >
          <span aria-hidden>◀</span>
          <span className="hidden sm:inline">Önceki Bölüm</span>
          <span className="sm:hidden">Önceki</span>
        </Link>
      ) : (
        <span className="opacity-30">◀ Önceki</span>
      )}

      <span className="tabular-nums opacity-80">%{Math.round(progress)}</span>

      {hasNext ? (
        <Link
          href={`${base}/${currentChapter + 1}`}
          className="flex items-center gap-1 transition-opacity hover:opacity-70"
        >
          <span className="hidden sm:inline">Sonraki Bölüm</span>
          <span className="sm:hidden">Sonraki</span>
          <span aria-hidden>▶</span>
        </Link>
      ) : (
        <Link
          href={bookPath}
          className="flex items-center gap-1 transition-opacity hover:opacity-70"
        >
          Bitir
          <span aria-hidden>▶</span>
        </Link>
      )}
    </div>
  );
}
