import { useState } from "react";
import { Button, Card, Textarea } from "@/components/ui";
import { useTranslation } from "@/i18n/useTranslation";
import "./CheckinComposer.css";

type CheckinComposerProps = {
  disabled: boolean;
  loading: boolean;
  onSubmit: (message: string) => Promise<void>;
};

const MAX_LENGTH = 500;

export function CheckinComposer({ disabled, loading, onSubmit }: CheckinComposerProps) {
  const { t } = useTranslation();
  const genericErrorMessage = t("accountability.errors.generic");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError(t("accountability.errors.messageRequired"));
      return;
    }

    setError(null);
    setNotice(null);
    try {
      await onSubmit(trimmed);
      setMessage("");
      setNotice(t("accountability.checkin.sent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : genericErrorMessage);
    }
  }

  return (
    <Card as="section" className="checkin-composer" aria-label={t("accountability.checkin.ariaLabel")}>
      <h2>{t("accountability.checkin.title")}</h2>
      <p>{t("accountability.checkin.subtitle")}</p>
      <form className="checkin-composer__form" onSubmit={handleSubmit}>
        <Textarea
          label={t("accountability.checkin.messageLabel")}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("accountability.checkin.placeholder")}
          maxLength={MAX_LENGTH}
          showCharacterCount
          autoResize
          disabled={disabled || loading}
          required
          error={error ?? undefined}
        />
        <Button type="submit" loading={loading} disabled={disabled} fullWidth>
          {disabled ? t("accountability.checkin.alreadySent") : t("accountability.checkin.send")}
        </Button>
      </form>
      {notice ? (
        <p className="checkin-composer__notice" aria-live="polite">
          {notice}
        </p>
      ) : null}
    </Card>
  );
}
