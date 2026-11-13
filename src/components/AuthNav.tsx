"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/api-config";

interface AuthNavProps {
  user: AuthUser | null;
}

export function AuthNav({ user }: AuthNavProps) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/giris" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          Giriş
        </Link>
        <Link
          href="/kayit"
          className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 font-medium text-[var(--color-btn-text)]"
        >
          Kayıt Ol
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden text-[var(--color-text-muted)] sm:inline">{user.username}</span>
      {user.is_admin && (
        <Link href="/admin" className="text-[var(--color-accent)] hover:underline">
          Yönetim
        </Link>
      )}
      <button
        type="button"
        onClick={logout}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        Çıkış
      </button>
    </div>
  );
}
