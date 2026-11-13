"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { FontSizeControl } from "./FontSizeControl";
import { ChapterNav } from "./ChapterNav";
import { useReadingPreferences } from "@/components/ThemeProvider";
import { THEMES } from "@/lib/reading-preferences";
import type { Book, Chapter } from "@/lib/db/schema";

interface ReaderProps {
  book: Book;
  chapter: Chapter;
  totalChapters: number;
  previewBasePath?: string;
}

export function Reader({ book, chapter, totalChapters, previewBasePath }: ReaderProps) {
  const { prefs, mounted } = useReadingPreferences();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [barsVisible, setBarsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = THEMES[prefs.theme];

  const handleScroll = useCallback(() => {
    const el = document.documentElement;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    setScrollProgress(progress);

    if (scrollTop > lastScrollY.current && scrollTop > 80) {
      setBarsVisible(false);
    } else {
      setBarsVisible(true);
    }
    lastScrollY.current = scrollTop;

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => setBarsVisible(true), 1500);
  }, []);

  useEffect(() => {
    fetch("/api/analytics/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: book.slug, chapter: chapter.order }),
    }).catch(() => {});
  }, [book.slug, chapter.order]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [handleScroll]);

  const chapterPath = previewBasePath || `/kitap/${book.slug}/bolum`;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && chapter.order > 1) {
        window.location.href = `${chapterPath}/${chapter.order - 1}`;
      }
      if (e.key === "ArrowRight" && chapter.order < totalChapters) {
        window.location.href = `${chapterPath}/${chapter.order + 1}`;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [chapterPath, chapter.order, totalChapters]);


  const chapterProgress =
    totalChapters > 0 ? ((chapter.order - 1) / totalChapters) * 100 + scrollProgress / totalChapters : 0;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="h-8 w-48 animate-pulse rounded bg-[var(--color-border)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-200">
      {/* Progress bar */}
      <div className="fixed left-0 right-0 top-0 z-50 h-0.5" style={{ backgroundColor: `${theme.accent}20` }}>
        <div
          className="h-full transition-all duration-150"
          style={{ width: `${chapterProgress}%`, backgroundColor: theme.accent }}
        />
      </div>

      {/* Top bar */}
      <header
        className={`fixed left-0 right-0 top-0.5 z-40 border-b transition-all duration-200 ${
          barsVisible ? "bar-visible" : "bar-hidden"
        }`}
        style={{ backgroundColor: `${theme.bg}ee`, borderColor: `${theme.accent}20` }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            href={previewBasePath ? `/onizle/${book.slug}` : `/kitap/${book.slug}`}
            className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
            style={{ color: theme.accent }}
          >
            <span aria-hidden>≡</span>
            <span className="hidden truncate sm:inline">{book.title}</span>
            <span className="opacity-50">›</span>
            <span className="truncate">Bölüm {chapter.order}</span>
          </Link>
          <div className="flex items-center gap-1">
            <FontSizeControl />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="fade-in mx-auto max-w-2xl px-6 pb-32 pt-20">
        <h1
          className="mb-10 text-center font-serif text-2xl leading-snug md:text-3xl"
          style={{ fontFamily: "var(--font-literata), Literata, serif", fontSize: `${prefs.fontSize + 6}px` }}
        >
          {chapter.title}
        </h1>
        <div
          className="reader-content"
          style={{ fontSize: `${prefs.fontSize}px`, color: theme.text }}
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />
      </article>

      {/* Bottom nav */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-all duration-200 ${
          barsVisible ? "bar-bottom-visible" : "bar-bottom-hidden"
        }`}
        style={{ backgroundColor: `${theme.bg}ee`, borderColor: `${theme.accent}20` }}
      >
        <div className="mx-auto max-w-2xl">
          <ChapterNav
            bookSlug={book.slug}
            currentChapter={chapter.order}
            totalChapters={totalChapters}
            theme={prefs.theme}
            progress={chapterProgress}
            chapterBasePath={previewBasePath}
          />
        </div>
      </footer>
    </div>
  );
}
