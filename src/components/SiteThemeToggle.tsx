"use client";

import { useTheme } from "@/components/ThemeProvider";
import { THEMES } from "@/lib/reading-preferences";

interface SiteThemeToggleProps {
  className?: string;
}

export function SiteThemeToggle({ className = "" }: SiteThemeToggleProps) {
  const { prefs, toggleTheme, mounted } = useTheme();
  const isDark = prefs.theme === "dark";

  if (!mounted) {
    return <div className={`h-10 w-24 rounded-full bg-[var(--color-border)] ${className}`} />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all hover:opacity-90 ${className}`}
      style={{
        borderColor: "var(--color-border)",
        color: "var(--color-accent)",
        backgroundColor: "var(--color-surface)",
      }}
      aria-label={`Tema değiştir, şu an ${THEMES[prefs.theme].label}`}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-4.4 2.26 5.5 5.5 0 0 1-5.44-6.25A9 9 0 0 0 12 3z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
      <span>{isDark ? "Karanlık" : "Aydınlık"}</span>
    </button>
  );
}
