import { Select } from "@/components/ui";
import { useTranslation } from "@/i18n/useTranslation";
import { trackEvent } from "@/lib/tracking";
import type { LocaleOption } from "./types";
import "./LanguageSelector.css";

type LanguageSelectorProps = {
  title: string;
  description: string;
  label: string;
  options: LocaleOption[];
  successMessage: string;
  onSaved?: (message: string) => void;
};

export function LanguageSelector({
  title,
  description,
  label,
  options,
  successMessage,
  onSaved,
}: LanguageSelectorProps) {
  const { locale, setLocale } = useTranslation();

  return (
    <section className="settings-language" aria-label={title}>
      <div className="settings-language__header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <Select
        label={label}
        value={locale}
        options={options}
        onChange={(event) => {
          const nextLocale = event.target.value as typeof locale;
          setLocale(nextLocale);
          trackEvent("language_changed", { language: nextLocale });
          onSaved?.(successMessage);
        }}
      />
    </section>
  );
}
