import Link from "next/link";

export default function WattpadCekPage() {
  return (
    <div className="site-transparent min-h-screen bg-[var(--color-bg)] px-6 py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 font-serif text-2xl text-[var(--color-text)]">Kitap Ekleme</h1>
        <p className="mb-8 text-sm leading-relaxed text-[var(--color-text-muted)]">
          Wattpad kitaplarını admin panelinden ekleyebilirsin. Bölümler geldikten sonra site içinde
          okunabilir ve PDF olarak indirilebilir.
        </p>

        <Link
          href="/admin"
          className="mb-6 block w-full rounded-xl bg-[var(--color-accent)] py-4 text-center text-[var(--color-btn-text)]"
        >
          Admin paneline git
        </Link>

        <p className="text-xs text-[var(--color-text-muted)]">
          Admin panelinden giriş yaparak kitap ekleyebilirsin.
        </p>

        <Link href="/" className="mt-6 inline-block text-sm text-[var(--color-accent)]">
          ← Ana sayfa
        </Link>
      </div>
    </div>
  );
}
