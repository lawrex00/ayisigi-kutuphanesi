export type SiteTheme = "light" | "dark";

export const THEMES: Record<
  SiteTheme,
  {
    bg: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    border: string;
    btnText: string;
    label: string;
  }
> = {
  light: {
    bg: "#FFFFFF",
    surface: "#FFFFFF",
    text: "#1A1A1A",
    textMuted: "#8E2424",
    accent: "#D90429",
    accentHover: "#B80022",
    border: "rgba(217, 4, 41, 0.16)",
    btnText: "#FFFFFF",
    label: "Aydınlık",
  },
  dark: {
    bg: "#08080C",
    surface: "#12101A",
    text: "#EEE8F5",
    textMuted: "#9D8BB5",
    accent: "#A855F7",
    accentHover: "#9333EA",
    border: "rgba(168, 85, 247, 0.22)",
    btnText: "#FFFFFF",
    label: "Karanlık",
  },
};

export const FONT_SIZES = [16, 18, 20, 22, 24] as const;
export type FontSize = (typeof FONT_SIZES)[number];

export interface UserPreferences {
  theme: SiteTheme;
  fontSize: FontSize;
}

const STORAGE_KEY = "wattpad-okuma-preferences";

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "light",
  fontSize: 18,
};

export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(stored);
    const theme: SiteTheme = parsed.theme === "dark" ? "dark" : "light";
    return { ...DEFAULT_PREFERENCES, ...parsed, theme };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function applyThemeToDocument(theme: SiteTheme) {
  const colors = THEMES[theme];
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.setProperty("--color-bg", colors.bg);
  root.style.setProperty("--color-surface", colors.surface);
  root.style.setProperty("--color-text", colors.text);
  root.style.setProperty("--color-text-muted", colors.textMuted);
  root.style.setProperty("--color-accent", colors.accent);
  root.style.setProperty("--color-accent-hover", colors.accentHover);
  root.style.setProperty("--color-border", colors.border);
  root.style.setProperty("--color-btn-text", colors.btnText);
}

// Geriye uyumluluk
export type ReadingTheme = SiteTheme;
