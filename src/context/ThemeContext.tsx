import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

export type ThemeSetting = "light" | "dark" | "system";
export type AppliedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeSetting;
  resolvedTheme: AppliedTheme;
  setTheme: (next: ThemeSetting) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): AppliedTheme {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveAppliedTheme(theme: ThemeSetting): AppliedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

function readInitialTheme(): ThemeSetting {
  const persisted = localStorage.getItem(STORAGE_KEYS.theme);
  if (persisted === "light" || persisted === "dark" || persisted === "system") {
    return persisted;
  }
  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeSetting>("system");
  const resolvedTheme = useMemo(() => resolveAppliedTheme(theme), [theme]);

  useEffect(() => {
    const initialTheme = readInitialTheme();
    setThemeState(initialTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        document.documentElement.dataset.theme = getSystemTheme();
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next) => setThemeState(next),
      toggleTheme: () =>
        setThemeState((current) => {
          const currentApplied = resolveAppliedTheme(current);
          return currentApplied === "light" ? "dark" : "light";
        }),
    }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
