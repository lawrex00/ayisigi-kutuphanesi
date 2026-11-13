"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SiteThemeToggle } from "@/components/SiteThemeToggle";
import { WattpadBookmarklet } from "@/components/WattpadBookmarklet";
import { AdminStatsPanel } from "@/components/AdminStatsPanel";

interface BookAdmin {
  id: number;
  title: string;
  slug: string;
  isPublished: number;
  chapterCount: number;
  publishedChapterCount: number;
  wattpadUrl: string | null;
}

interface ChapterAdmin {
  id: number;
  order: number;
  title: string;
  isPublished: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [wattpadUrl, setWattpadUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [books, setBooks] = useState<BookAdmin[]>([]);
  const [expandedBookId, setExpandedBookId] = useState<number | null>(null);
  const [chapters, setChapters] = useState<ChapterAdmin[]>([]);
  const [importLog, setImportLog] = useState<string[]>([]);

  const apiFetch = useCallback(
    (init: RequestInit = {}): RequestInit => {
      const isForm = init.body instanceof FormData;
      return {
        ...init,
        credentials: "include",
        headers: {
          ...(!isForm ? { "Content-Type": "application/json" } : {}),
          ...((init.headers as Record<string, string>) || {}),
          ...(password ? { "x-admin-password": password } : {}),
        },
      };
    },
    [password]
  );

  const loadBooks = useCallback(async () => {
    const res = await fetch("/api/admin/books", apiFetch());
    if (res.ok) {
      const data = await res.json();
      setBooks(data.books);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetch("/api/admin/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) setAuthenticated(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authenticated) loadBooks();
  }, [authenticated, loadBooks]);

  const loadChapters = async (bookId: number) => {
    const res = await fetch(`/api/admin/books/${bookId}/chapters`, apiFetch());
    if (res.ok) {
      const data = await res.json();
      setChapters(data.chapters);
      setExpandedBookId(bookId);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();
    if (!trimmed) return;

    const res = await fetch("/api/admin/books", {
      headers: { "x-admin-password": trimmed },
    });

    if (res.ok) {
      await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: trimmed }),
      });
      setAuthenticated(true);
      setMessage(null);
    } else {
      setMessage({ type: "error", text: "Şifre yanlış." });
      setAuthenticated(false);
    }
  };

  const importWattpad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wattpadUrl.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/import", apiFetch({
        method: "POST",
        body: JSON.stringify({ wattpadUrl: wattpadUrl.trim() }),
      }));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İçe aktarma başarısız");
      setMessage({ type: "success", text: data.message });
      setWattpadUrl("");
      await loadBooks();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Bilinmeyen hata" });
    } finally {
      setLoading(false);
    }
  };

  const importAllAccount = async () => {
    setLoading(true);
    setMessage(null);
    setImportLog(["Hesaptaki tüm kitaplar içe aktarılıyor..."]);
    try {
      const res = await fetch("/api/import", apiFetch({
        method: "POST",
        body: JSON.stringify({ importAccount: true, username: "gozyasikullugu" }),
      }));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İçe aktarma başarısız");
      const lines = (data.results || []).map(
        (r: { title: string; chapterCount: number; error?: string }) =>
          r.error ? `✗ ${r.title}: ${r.error}` : `✓ ${r.title} (${r.chapterCount} bölüm, taslak)`
      );
      setImportLog(lines);
      setMessage({ type: "success", text: data.message });
      await loadBooks();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Bilinmeyen hata" });
    } finally {
      setLoading(false);
    }
  };

  const importEpub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epubFile) return;
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("epub", epubFile);
      if (wattpadUrl.trim()) formData.append("wattpadUrl", wattpadUrl.trim());
      const res = await fetch("/api/import", apiFetch({
        method: "POST",
        body: formData,
      }));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İçe aktarma başarısız");
      setMessage({ type: "success", text: data.message });
      setEpubFile(null);
      await loadBooks();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Bilinmeyen hata" });
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (book: BookAdmin) => {
    if (!confirm(`"${book.title}" kitabını silmek istediğinize emin misiniz?`)) return;
    const res = await fetch(`/api/books/${book.id}`, apiFetch({ method: "DELETE" }));
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: "error", text: data.error || "Silinemedi" });
      return;
    }
    setMessage({ type: "success", text: `"${book.title}" silindi` });
    if (expandedBookId === book.id) setExpandedBookId(null);
    await loadBooks();
  };

  const toggleBookPublish = async (book: BookAdmin) => {
    const publishing = book.isPublished !== 1;
    const res = await fetch(`/api/books/${book.id}`, apiFetch({
      method: "PATCH",
      body: JSON.stringify({ isPublished: publishing }),
    }));
    if (res.ok) {
      if (publishing && book.chapterCount > 0) {
        setMessage({
          type: "success",
          text: `"${book.title}" ve ${book.chapterCount} bölüm yayınlandı. Site sayfasında Oku / PDF görünür.`,
        });
      }
      await loadBooks();
    }
  };

  const publishAllChapters = async (book: BookAdmin) => {
    const res = await fetch(`/api/books/${book.id}`, apiFetch({
      method: "PATCH",
      body: JSON.stringify({ publishAllChapters: true }),
    }));
    if (res.ok) {
      setMessage({
        type: "success",
        text: `"${book.title}" — tüm bölümler yayınlandı.`,
      });
      await loadBooks();
    }
  };

  const toggleChapterPublish = async (chapter: ChapterAdmin) => {
    const res = await fetch(`/api/chapters/${chapter.id}`, apiFetch({
      method: "PATCH",
      body: JSON.stringify({ isPublished: chapter.isPublished !== 1 }),
    }));
    if (res.ok && expandedBookId) await loadChapters(expandedBookId);
  };

  if (!authenticated) {
    return (
      <div className="site-transparent flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
        <div className="absolute right-6 top-6">
          <SiteThemeToggle />
        </div>
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm"
        >
          <h1 className="mb-6 text-center font-serif text-2xl text-[var(--color-text)]">Admin Girişi</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            className="mb-4 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            autoFocus
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--color-accent)] py-3 text-sm text-[var(--color-btn-text)] transition-opacity hover:opacity-90"
          >
            Giriş Yap
          </button>
          <Link href="/" className="mt-4 block text-center text-sm text-[var(--color-accent)] hover:opacity-70">
            ← Ana sayfa
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="site-transparent min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="font-serif text-xl text-[var(--color-text)]">Admin Paneli</h1>
          <div className="flex items-center gap-3">
            <SiteThemeToggle />
            <Link href="/" className="text-sm text-[var(--color-accent)] hover:opacity-70">
              ← Kütüphane
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
        {message && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm ${
              message.type === "success"
                ? "bg-[var(--color-border)] text-[var(--color-text)]"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <WattpadBookmarklet />

        {/* Kitap yönetimi */}
        <section className="mb-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-lg text-[var(--color-text)]">Kitaplarım ({books.length})</h2>
          </div>
          <div className="mb-4 rounded-xl border border-amber-400/50 bg-amber-50/50 px-4 py-3 text-xs text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
            <strong>Wattpad senkron:</strong> Wattpad&apos;te kitabı düzenle →{" "}
            <strong>Değişiklikleri Yayınla</strong> → kitap sayfasında sağ alttaki mor{" "}
            <strong>Ay Işığı&apos;na Senkronize Et</strong>. Aynı kitap güncellenir, kopya oluşmaz.
          </div>
          <p className="mb-4 text-xs text-[var(--color-text-muted)]">
            İçe aktarılan kitaplar <strong>taslak</strong> olarak gelir. Ana sayfada görünmez; sen
            hazır olunca <strong>Yayınla</strong> dersin. Bölümler geldikten sonra <strong>Oku</strong> ile
            site içinde okuyabilir veya <strong>PDF</strong> indirebilirsin.
          </p>

          {books.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">Henüz kitap yok.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {books.map((book) => (
                <li key={book.id} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{book.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {book.publishedChapterCount}/{book.chapterCount} bölüm yayında ·{" "}
                        {book.isPublished ? "Kitap yayında" : "Kitap taslağı"}
                        {book.chapterCount > 0 && book.publishedChapterCount < book.chapterCount && (
                          <span className="ml-1 text-amber-600">· bölümler taslak</span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {book.wattpadUrl && (
                        <a
                          href={book.wattpadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-medium text-[var(--color-accent)]"
                        >
                          Wattpad&apos;te aç
                        </a>
                      )}
                      {book.chapterCount > 0 && (
                        <>
                          <Link
                            href={`/onizle/${book.slug}`}
                            target="_blank"
                            className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-accent)]"
                          >
                            Oku
                          </Link>
                          <a
                            href={`/api/pdf/${book.slug}`}
                            className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-accent)]"
                          >
                            PDF
                          </a>
                        </>
                      )}
                      {book.chapterCount > 0 && book.publishedChapterCount < book.chapterCount && (
                        <button
                          onClick={() => publishAllChapters(book)}
                          className="rounded-lg border border-amber-400 px-3 py-1 text-xs text-amber-700"
                        >
                          Bölümleri yayınla
                        </button>
                      )}
                      <button
                        onClick={() => loadChapters(book.id)}
                        className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-accent)]"
                      >
                        Bölümler
                      </button>
                      <button
                        onClick={() => toggleBookPublish(book)}
                        className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-accent)]"
                      >
                        {book.isPublished ? "Gizle" : "Yayınla"}
                      </button>
                      <button
                        onClick={() => deleteBook(book)}
                        className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-600"
                      >
                        Sil
                      </button>
                    </div>
                  </div>

                  {expandedBookId === book.id && (
                    <ul className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
                      {chapters.map((ch) => (
                        <li
                          key={ch.id}
                          className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] py-2 text-sm last:border-0"
                        >
                          <span className="text-[var(--color-text)]">
                            {ch.order}. {ch.title}
                          </span>
                          <button
                            onClick={() => toggleChapterPublish(ch)}
                            className={`rounded px-2 py-0.5 text-xs ${
                              ch.isPublished
                                ? "bg-[var(--color-accent)] text-[var(--color-btn-text)]"
                                : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
                            }`}
                          >
                            {ch.isPublished ? "Yayında" : "Taslak"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}

          {importLog.length > 0 && (
            <pre className="mt-4 max-h-40 overflow-y-auto rounded-xl bg-[var(--color-bg)] p-3 text-xs text-[var(--color-text-muted)]">
              {importLog.join("\n")}
            </pre>
          )}
        </section>

        <section className="mb-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="mb-2 font-serif text-lg text-[var(--color-text)]">Tek kitap — Wattpad linki</h2>
          <p className="mb-4 text-xs text-[var(--color-text-muted)]">
            Yayında olsun olmasın, kitabın Wattpad sayfasındaki linki yapıştır. Siteye taslak olarak eklenir.
          </p>
          <form onSubmit={importWattpad} className="space-y-4">
            <input
              type="url"
              value={wattpadUrl}
              onChange={(e) => setWattpadUrl(e.target.value)}
              placeholder="https://www.wattpad.com/story/399542029-..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              disabled={loading || !wattpadUrl.trim()}
              className="rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm text-[var(--color-btn-text)] disabled:opacity-50"
            >
              {loading ? "İçe aktarılıyor..." : "İçe Aktar (taslak)"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="mb-2 font-serif text-lg text-[var(--color-text)]">EPUB yükle</h2>
          <p className="mb-4 text-xs text-[var(--color-text-muted)]">
            Wattpad engelliyse: WattpadDownloader veya başka araçla EPUB indirip buradan yükleyin.
          </p>
          <form onSubmit={importEpub} className="space-y-4">
            <input
              type="file"
              accept=".epub"
              onChange={(e) => setEpubFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
            <button
              type="submit"
              disabled={loading || !epubFile}
              className="rounded-xl border border-[var(--color-border)] px-6 py-3 text-sm text-[var(--color-accent)] disabled:opacity-50"
            >
              EPUB Yükle
            </button>
          </form>
        </section>
          </div>

          <aside className="lg:sticky lg:top-6">
            <AdminStatsPanel apiFetch={apiFetch} />
          </aside>
        </div>
      </main>
    </div>
  );
}
