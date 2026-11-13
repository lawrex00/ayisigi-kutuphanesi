import Link from "next/link";
import { SiteThemeToggle } from "@/components/SiteThemeToggle";

export default function NotFound() {
  return (
    <div className="site-transparent flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-6 text-center">
      <div className="absolute right-6 top-6">
        <SiteThemeToggle />
      </div>
      <h1 className="mb-2 font-serif text-3xl text-[var(--color-text)]">Sayfa bulunamadı</h1>
      <p className="mb-8 text-[var(--color-text-muted)]">Aradığınız kitap veya bölüm mevcut değil.</p>
      <Link
        href="/"
        className="rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm text-[var(--color-btn-text)] hover:opacity-90"
      >
        Kütüphaneye Dön
      </Link>
    </div>
  );
}
