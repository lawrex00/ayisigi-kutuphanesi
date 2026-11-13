"use client";

import { useEffect, useState } from "react";

interface BookStat {
  title: string;
  slug: string;
  chapters: number;
  readers: number;
  completers: number;
  read_events: number;
  completion_rate: number;
}

interface DashboardStats {
  registered_users: number;
  unique_readers: number;
  unique_completers: number;
  total_reads: number;
  unique_visitors: number;
  book_stats: BookStat[];
  error?: string;
}

export function AdminStatsPanel({ apiFetch }: { apiFetch: (init?: RequestInit) => RequestInit }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", apiFetch())
      .then((r) => r.json())
      .then((data) => {
        if (data.error && !data.registered_users) {
          setStats({
            registered_users: 0,
            unique_readers: 0,
            unique_completers: 0,
            total_reads: 0,
            unique_visitors: 0,
            book_stats: [],
            error: data.error,
          });
        } else {
          setStats(data);
        }
      })
      .catch(() =>
        setStats({
          registered_users: 0,
          unique_readers: 0,
          unique_completers: 0,
          total_reads: 0,
          unique_visitors: 0,
          book_stats: [],
          error: "İstatistikler yüklenemedi",
        })
      )
      .finally(() => setLoading(false));
  }, [apiFetch]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-sm text-[var(--color-text-muted)]">İstatistikler yükleniyor…</p>
      </section>
    );
  }

  if (!stats) return null;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="mb-4 font-serif text-lg text-[var(--color-text)]">Okuyucu İstatistikleri</h2>

      {stats.error && (
        <p className="mb-4 rounded-lg border border-amber-400/40 bg-amber-50/10 px-3 py-2 text-xs text-amber-200">
          {stats.error}
        </p>
      )}

      <div className="mb-5 grid grid-cols-2 gap-2">
        {[
          { label: "Kayıtlı", value: stats.registered_users },
          { label: "Okuyan", value: stats.unique_readers },
          { label: "Sonuna kadar", value: stats.unique_completers },
          { label: "Ziyaretçi", value: stats.unique_visitors },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-center"
          >
            <div className="text-xl font-semibold text-[var(--color-accent)]">{value}</div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
              {label}
            </div>
          </div>
        ))}
      </div>

      <p className="mb-3 text-xs text-[var(--color-text-muted)]">
        Toplam bölüm okuma: <strong>{stats.total_reads}</strong>
      </p>

      {stats.book_stats.length > 0 && (
        <div className="max-h-72 overflow-y-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[var(--color-bg)]">
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <th className="px-2 py-2 font-medium">Kitap</th>
                <th className="px-2 py-2 font-medium">Okuyan</th>
                <th className="px-2 py-2 font-medium">Bitiren</th>
              </tr>
            </thead>
            <tbody>
              {stats.book_stats.map((book) => (
                <tr key={book.slug} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-2 py-2 text-[var(--color-text)]">
                    <span className="line-clamp-2">{book.title}</span>
                  </td>
                  <td className="px-2 py-2 text-[var(--color-text-muted)]">{book.readers}</td>
                  <td className="px-2 py-2 font-medium text-[var(--color-accent)]">
                    {book.completers}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
        İstatistikler site veritabanından okunur.
      </p>
    </section>
  );
}
