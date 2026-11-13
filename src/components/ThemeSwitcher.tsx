"use client";

import { THEMES } from "@/lib/reading-preferences";
import { useReadingPreferences } from "@/components/ThemeProvider";

export function ThemeSwitcher() {
  const { prefs, cycleTheme } = useReadingPreferences();
  const theme = THEMES[prefs.theme];
  const isDark = prefs.theme === "dark";

  return (
    <button
      onClick={cycleTheme}
      className="rounded-full px-3 py-1.5 text-sm transition-opacity hover:opacity-70"
      style={{ color: theme.accent }}
      title={`Tema: ${theme.label}`}
      aria-label={`Tema değiştir, şu an ${theme.label}`}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-4.4 2.26 5.5 5.5 0 0 1-5.44-6.25A9 9 0 0 0 12 3z" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  );
}
