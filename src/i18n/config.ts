import { enUS, type Locale as DateFnsLocale, de, nl } from "date-fns/locale";

export const supportedLocales = ["nl", "en", "de"] as const;
export type AppLocale = (typeof supportedLocales)[number];
export const defaultLocale: AppLocale = "en";

export function getBrowserLocale(): AppLocale | null {
  try {
    if (typeof window === "undefined" || typeof navigator === "undefined") return null;
    const lang = navigator.language ?? navigator.languages?.[0];
    if (!lang || typeof lang !== "string") return null;
    const code = lang.split("-")[0].toLowerCase();
    if (code === "nl" || code === "de") return code;
    return null;
  } catch {
    return null;
  }
}

export const dateFnsLocales: Record<AppLocale, DateFnsLocale> = {
  nl,
  en: enUS,
  de,
};

export const dateFormats: Record<AppLocale, string> = {
  nl: "dd-MM-yyyy",
  en: "MM/dd/yyyy",
  de: "dd.MM.yyyy",
};

export const localeStorageKey = "onlyTodayLocale";

export function isSupportedLocale(value: string): value is AppLocale {
  return supportedLocales.includes(value as AppLocale);
}
