import Link from "next/link";
import { SiteBrand } from "@/components/Logo";
import { getAuthUser } from "@/lib/auth";
import { HERO_TEXT } from "@/lib/site-config";
import { isGoogleAuthConfigured } from "@/lib/api-config";

export async function WelcomeHero() {
  const user = await getAuthUser();
  const googleConfigured = isGoogleAuthConfigured();

  return (
    <section className="relative">
      <div className="relative mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
        <SiteBrand size="lg" className="mb-6" />

        <p
          className="mb-4 font-serif text-4xl tracking-wide text-[var(--color-accent)] md:text-5xl"
          style={{ fontFamily: "var(--font-literata), Literata, serif" }}
        >
          HOŞGELDİNİZ!
        </p>

        {user ? (
          <p className="mx-auto mb-2 max-w-2xl text-lg text-[var(--color-text)] md:text-xl">
            Tekrar hoş geldin, <span className="text-[var(--color-accent)]">{user.username}</span>.
          </p>
        ) : (
          <p className="mx-auto mb-8 max-w-xl text-base text-[var(--color-text-muted)] md:text-lg">
            Kitapları okumak için giriş yapın veya ücretsiz hesap oluşturun.
          </p>
        )}

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--color-text-muted)] md:text-xl">
          {HERO_TEXT}
        </p>

        {!user && (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
            <h2
              className="mb-2 font-serif text-xl text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-literata), Literata, serif" }}
            >
              Kütüphaneye Girin
            </h2>
            <p className="mb-6 text-sm text-[var(--color-text-muted)]">
              Üye olmadan kitaplar okunamaz. Hemen başlayın.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/giris"
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-3 font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                className="rounded-xl bg-[var(--color-accent)] px-6 py-3 font-medium text-[var(--color-btn-text)] transition-opacity hover:opacity-90"
              >
                Kayıt Ol
              </Link>
            </div>
            {googleConfigured && (
              <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                <a
                  href="/api/auth/google"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-6 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] sm:w-auto"
                >
                  Google ile devam et
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
