"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

interface Reply {
  id: number;
  text: string;
  admin_name: string;
  created_at: string;
}

interface Comment {
  id: number;
  author: string;
  text: string;
  created_at: string;
  replies: Reply[];
}

export function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/comments")
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.user))
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!loggedIn) {
      setError("Yorum yapmak için giriş yapmalısınız.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.detail || "Yorum gönderilemedi.");
      return;
    }
    setText("");
    const list = await fetch("/api/comments").then((r) => r.json());
    setComments(list);
  }

  return (
    <section className="site-transparent border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <h2
          className="mb-4 font-serif text-2xl text-[var(--color-text)] md:text-3xl"
          style={{ fontFamily: "var(--font-literata), Literata, serif" }}
        >
          Sizden Gelenler
        </h2>
        <p className="mb-8 text-[var(--color-text-muted)]">
          Site hakkındaki düşüncelerinizi paylaşın — her yorum benim için çok değerli.
        </p>

        {loggedIn ? (
          <form onSubmit={onSubmit} className="mb-10">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              maxLength={2000}
              rows={4}
              placeholder="Düşüncelerinizi yazın…"
              className="mb-3 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)]"
            />
            {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-[var(--color-btn-text)] disabled:opacity-50"
            >
              {loading ? "Gönderiliyor…" : "Yorum Gönder"}
            </button>
          </form>
        ) : (
          <p className="mb-10 text-sm text-[var(--color-text-muted)]">
            Yorum yapmak için{" "}
            <Link href="/giris" className="text-[var(--color-accent)] hover:underline">
              giriş yapın
            </Link>
            .
          </p>
        )}

        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-[var(--color-text-muted)]">Henüz yorum yok. İlk siz yazın!</p>
          ) : (
            comments.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5"
              >
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <span className="font-medium text-[var(--color-accent)]">{c.author}</span>
                  <time className="text-xs text-[var(--color-text-muted)]">
                    {new Date(c.created_at).toLocaleDateString("tr-TR")}
                  </time>
                </div>
                <p className="whitespace-pre-wrap text-[var(--color-text)]">{c.text}</p>
                {c.replies?.map((r) => (
                  <div
                    key={r.id}
                    className="mt-4 ml-4 border-l-2 border-[var(--color-accent)]/40 pl-4"
                  >
                    <p className="mb-1 text-xs font-medium text-[var(--color-accent)]">
                      {r.admin_name} (yazar)
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">{r.text}</p>
                  </div>
                ))}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
