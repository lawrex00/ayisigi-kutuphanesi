"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

interface LoginFormProps {
  googleConfigured?: boolean;
}

export function LoginForm({ googleConfigured = false }: LoginFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    params.get("hata") === "google" ? "Google girişi tamamlanamadı." : ""
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.detail || data.non_field_errors?.[0] || "Giriş başarısız.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  function googleLogin() {
    window.location.href = "/api/auth/google";
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1
        className="mb-2 font-serif text-3xl text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-literata), Literata, serif" }}
      >
        Giriş Yap
      </h1>
      <p className="mb-8 text-[var(--color-text-muted)]">
        Kitapları okumak için giriş yapmanız gerekir.
      </p>

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-[var(--color-text-muted)]">E-posta</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Şifre</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--color-accent)] px-4 py-3 font-medium text-[var(--color-btn-text)] disabled:opacity-60"
        >
          {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </form>

      {googleConfigured && (
        <>
          <div className="my-6 text-center text-sm text-[var(--color-text-muted)]">veya</div>

          <button
            type="button"
            onClick={googleLogin}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-medium text-[var(--color-text)]"
          >
            Google ile Giriş Yap
          </button>
        </>
      )}

      <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="text-[var(--color-accent)] hover:underline">
          Kayıt olun
        </Link>
      </p>
    </div>
  );
}
