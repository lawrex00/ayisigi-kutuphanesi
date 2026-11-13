import Link from "next/link";
import { SiteBrand } from "@/components/Logo";
import { getAuthUser } from "@/lib/auth";
import { HERO_TEXT } from "@/lib/site-config";
import { isGoogleAuthConfigured } from "@/lib/api-config";

export async function WelcomeHero() {
  const user = await getAuthUser();
  const googleConfigured = isGoogleAuthConfigured();

  return (
    <section className="relative px-4 pt-10 pb-12 sm:pt-16 sm:pb-20">
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="inline-block transform transition-transform hover:scale-105 duration-300">
          <SiteBrand size="lg" className="mb-4 sm:mb-6" />
        </div>

        <h1
          className="mb-3 font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--color-text)] drop-shadow-sm"
          style={{ fontFamily: "var(--font-literata), Literata, serif" }}
        >
          <span className="bg-gradient-to-r from-[var(--color-text)] via-[var(--color-accent)] to-[var(--color-text)] bg-clip-text text-transparent">
            Ay Işığı Kütüphanesi
          </span>
        </h1>

        {user ? (
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--glass-bg)] px-4 py-1.5 text-sm sm:text-base backdrop-blur-md">
            <span>✨</span>
            <span className="text-[var(--color-text)]">
              Tekrar hoş geldin, <strong className="text-[var(--color-accent)]">{user.username}</strong>
            </span>
          </div>
        ) : (
          <p className="mx-auto mb-4 max-w-xl text-sm sm:text-base text-[var(--color-text-muted)] font-medium">
            Sadece ay ışığı ve kelimeler. Geceye fısıldayan hikayeler...
          </p>
        )}

        <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-[var(--color-text-muted)] px-2">
          {HERO_TEXT}
        </p>

        {!user && (
          <div className="mx-auto mt-8 sm:mt-10 max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--glass-bg)] p-6 sm:p-8 backdrop-blur-2xl shadow-xl shadow-[var(--color-accent)]/5">
            <h2
              className="mb-1 font-serif text-lg sm:text-xl font-bold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-literata), Literata, serif" }}
            >
              Kütüphaneye Katıl
            </h2>
            <p className="mb-6 text-xs sm:text-sm text-[var(--color-text-muted)]">
              Kitapları okumak ve kütüphaneni oluşturmak için giriş yap.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/giris"
                className="flex items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/80 py-3 text-sm font-semibold text-[var(--color-text)] backdrop-blur-md transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] active:scale-95"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                className="flex items-center justify-center rounded-2xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-white shadow-md shadow-[var(--color-accent)]/30 transition-all hover:opacity-90 active:scale-95"
              >
                Kayıt Ol
              </Link>
            </div>
            {googleConfigured && (
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <a
                  href="/api/auth/google"
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-[var(--color-border)] bg-white/5 py-3 text-xs sm:text-sm font-medium text-[var(--color-text)] backdrop-blur-md transition-all hover:border-[var(--color-accent)] hover:bg-white/10 active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Google ile Tek Tıkla Bağlan
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
