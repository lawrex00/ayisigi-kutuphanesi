"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import {
  loadPreferences,
  savePreferences,
  applyThemeToDocument,
  type UserPreferences,
  type SiteTheme,
  type FontSize,
  DEFAULT_PREFERENCES,
} from "@/lib/reading-preferences";

interface ThemeContextValue {
  prefs: UserPreferences;
  mounted: boolean;
  setTheme: (theme: SiteTheme) => void;
  toggleTheme: () => void;
  setFontSize: (fontSize: FontSize) => void;
  cycleFontSize: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loaded = loadPreferences();
    setPrefs(loaded);
    applyThemeToDocument(loaded.theme);
    setMounted(true);
  }, []);

  const update = useCallback((partial: Partial<UserPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      savePreferences(next);
      if (partial.theme) applyThemeToDocument(next.theme);
      return next;
    });
  }, []);

  const setTheme = (theme: SiteTheme) => update({ theme });
  const toggleTheme = () => update({ theme: prefs.theme === "light" ? "dark" : "light" });
  const setFontSize = (fontSize: FontSize) => update({ fontSize });
  const cycleFontSize = () => {
    const sizes: FontSize[] = [16, 18, 20, 22, 24];
    const idx = sizes.indexOf(prefs.fontSize);
    setFontSize(sizes[(idx + 1) % sizes.length]);
  };

  return (
    <ThemeContext.Provider
      value={{ prefs, mounted, setTheme, toggleTheme, setFontSize, cycleFontSize }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// Okuyucu bileşenleri için alias
export function useReadingPreferences() {
  const { prefs, mounted, setTheme, toggleTheme, setFontSize, cycleFontSize } = useTheme();
  return {
    prefs,
    mounted,
    setTheme,
    cycleTheme: toggleTheme,
    setFontSize,
    cycleFontSize,
  };
}
