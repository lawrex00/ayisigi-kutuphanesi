"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface RegisterFormProps {
  googleConfigured?: boolean;
}

export function RegisterForm({ googleConfigured = false }: RegisterFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      const msg =
        data.email?.[0] || data.username?.[0] || data.password?.[0] || "Kayıt başarısız.";
      setError(msg);
      return;
    }
    router.push("/");
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
        Kayıt Ol
      </h1>
      <p className="mb-8 text-[var(--color-text-muted)]">
        Ay Işığı Kütüphanesi&apos;ne hoş geldiniz.
      </p>

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-[var(--color-text-muted)]">
            Kullanıcı adı
          </label>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)]"
          />
        </div>
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
            minLength={8}
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
          {loading ? "Kaydediliyor…" : "Kayıt Ol"}
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
            Google ile Kayıt Ol
          </button>
        </>
      )}

      <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="text-[var(--color-accent)] hover:underline">
          Giriş yapın
        </Link>
      </p>
    </div>
  );
}
