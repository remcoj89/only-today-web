import { format } from "date-fns";
import { useContext } from "react";
import { I18nContext } from "@/context/I18nContext";
import { dateFormats, dateFnsLocales, defaultLocale, type AppLocale } from "@/i18n/config";
import nlMessages from "@/i18n/nl.json";

type Dictionary = Record<string, unknown>;

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

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used inside I18nProvider.");
  }

  const { locale, messages } = context;

  const t = (key: string, values?: Record<string, string | number>): string => {
    const translated = deepGet(messages as Dictionary, key);
    if (typeof translated === "string") {
      return interpolate(translated, values);
    }

    const fallback = deepGet(nlMessages as Dictionary, key);
    if (typeof fallback === "string") {
      return interpolate(fallback, values);
    }

    return key;
  };

  const formatDate = (date: Date, forcedLocale?: AppLocale): string => {
    const targetLocale = forcedLocale ?? locale ?? defaultLocale;
    return format(date, dateFormats[targetLocale], {
      locale: dateFnsLocales[targetLocale],
    });
  };

  return {
    locale,
    setLocale: context.setLocale,
    t,
    formatDate,
  };
}
