import Link from "next/link";
import { SiteBrand } from "@/components/Logo";
import { SiteThemeToggle } from "@/components/SiteThemeToggle";
import { SiteMusicPlayer } from "@/components/SiteMusicPlayer";
import { AuthNav } from "@/components/AuthNav";
import { getAuthUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getAuthUser();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-x-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="transition-transform active:scale-95 shrink-0">
          <SiteBrand size="sm" />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <AuthNav user={user} />
          <SiteMusicPlayer />
          <SiteThemeToggle />
        </div>
      </div>
    </header>
  );
}
