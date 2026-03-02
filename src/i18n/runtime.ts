import type { AppLocale } from "@/i18n/config";
import { defaultLocale, getBrowserLocale, isSupportedLocale } from "@/i18n/config";
import de from "@/i18n/de.json";
import en from "@/i18n/en.json";
import nl from "@/i18n/nl.json";
import { STORAGE_KEYS } from "@/lib/constants";

type Dictionary = Record<string, unknown>;

const dictionaries: Record<AppLocale, Dictionary> = {
  nl: nl as Dictionary,
  en: en as Dictionary,
  de: de as Dictionary,
};

function deepGet(source: Dictionary, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in (current as Dictionary)) {
      return (current as Dictionary)[segment];
    }
    return undefined;
  }, source);
}

function interpolate(template: string, values?: Record<string, string | number>): string {
  if (!values) {
    return template;
  }
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template,
  );
}

export function getCurrentLocale(): AppLocale {
  try {
    const raw = typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEYS.locale);
    if (raw && isSupportedLocale(raw)) {
      return raw;
    }
    const browserLocale = getBrowserLocale();
    if (browserLocale) {
      return browserLocale;
    }
    const envLocale = import.meta.env.PUBLIC_DEFAULT_LOCALE;
    if (typeof envLocale === "string" && isSupportedLocale(envLocale)) {
      return envLocale;
    }
  } catch {
    /* fall through to default */
  }
  return defaultLocale;
}

export function translateForLocale(
  locale: AppLocale,
  key: string,
  values?: Record<string, string | number>,
): string {
  const value = deepGet(dictionaries[locale], key);
  if (typeof value === "string") {
    return interpolate(value, values);
  }

  const fallback = deepGet(dictionaries[defaultLocale], key);
  if (typeof fallback === "string") {
    return interpolate(fallback, values);
  }

  return key;
}
