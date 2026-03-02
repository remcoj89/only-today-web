import type { ThemeSetting } from "@/context/ThemeContext";
import { useTheme } from "@/hooks/useTheme";
import { trackEvent } from "@/lib/tracking";
import type { ThemeOption } from "./types";
import "./ThemeToggle.css";

type ThemeToggleProps = {
  title: string;
  description: string;
  options: ThemeOption[];
  onSaved?: (message: string) => void;
  successMessage: string;
};

export function ThemeToggle({ title, description, options, onSaved, successMessage }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const handleSelect = (nextTheme: ThemeSetting) => {
    setTheme(nextTheme);
    trackEvent("theme_changed", { theme: nextTheme });
    onSaved?.(successMessage);
  };

  return (
    <section className="settings-theme" aria-label={title}>
      <div className="settings-theme__header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="settings-theme__segmented" role="radiogroup" aria-label={title}>
        {options.map((option) => {
          const active = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`settings-theme__option ${active ? "settings-theme__option--active" : ""}`}
              role="radio"
              aria-checked={active}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
