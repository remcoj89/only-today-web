import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultLocale, getBrowserLocale, isSupportedLocale, type AppLocale } from "@/i18n/config";
import { STORAGE_KEYS } from "@/lib/constants";
import nlMessages from "@/i18n/nl.json";
import enMessages from "@/i18n/en.json";
import deMessages from "@/i18n/de.json";

type Messages = Record<string, unknown>;

const messageBundles: Record<AppLocale, Messages> = {
  nl: nlMessages as Messages,
  en: enMessages as Messages,
  de: deMessages as Messages,
};

type I18nContextValue = {
  locale: AppLocale;
  messages: Messages;
  setLocale: (next: AppLocale) => void;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): AppLocale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }
  const stored = localStorage.getItem(STORAGE_KEYS.locale);
  if (stored && isSupportedLocale(stored)) {
    return stored;
  }
  const browser = getBrowserLocale();
  return browser ?? defaultLocale;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(defaultLocale);

  useEffect(() => {
    setLocaleState(readInitialLocale());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.locale, locale);
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      messages: messageBundles[locale],
      setLocale: setLocaleState,
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
