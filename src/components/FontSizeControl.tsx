"use client";

import { useReadingPreferences } from "@/components/ThemeProvider";
import { THEMES } from "@/lib/reading-preferences";

export function FontSizeControl() {
  const { prefs, cycleFontSize } = useReadingPreferences();
  const theme = THEMES[prefs.theme];

  return (
    <button
      onClick={cycleFontSize}
      className="rounded-full px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-70"
      style={{ color: theme.accent }}
      title={`Yazı boyutu: ${prefs.fontSize}px`}
      aria-label="Yazı boyutunu değiştir"
    >
      Aa
    </button>
  );
}
