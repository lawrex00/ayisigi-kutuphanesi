import Link from "next/link";
import { SiteBrand } from "@/components/Logo";
import { SiteThemeToggle } from "@/components/SiteThemeToggle";
import { SiteMusicPlayer } from "@/components/SiteMusicPlayer";
import { AuthNav } from "@/components/AuthNav";
import { getAuthUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getAuthUser();

  return (
    <header className="border-b border-[var(--color-border)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <SiteBrand size="sm" />
        </Link>
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <AuthNav user={user} />
          <SiteMusicPlayer />
          <SiteThemeToggle />
        </div>
      </div>
    </header>
  );
}
