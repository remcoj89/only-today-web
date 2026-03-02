import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Toggle } from "@/components/ui";
import type { UserSettings } from "./types";
import { isValidTime } from "./utils";
import "./NotificationPrefs.css";

type NotificationPrefsProps = {
  title: string;
  description: string;
  fields: {
    dayStartReminder: string;
    dayCloseReminder: string;
    push: string;
    escalation: string;
    timeLabel: string;
  };
  saveLabel: string;
  validationError: string;
  settings: UserSettings;
  isSaving: boolean;
  onSave: (next: UserSettings) => Promise<void>;
};

export function NotificationPrefs({
  title,
  description,
  fields,
  saveLabel,
  validationError,
  settings,
  isSaving,
  onSave,
}: NotificationPrefsProps) {
  const [local, setLocal] = useState<UserSettings>(settings);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const hasInvalidTime = useMemo(() => {
    if (local.dayStartReminderTime && !isValidTime(local.dayStartReminderTime)) {
      return true;
    }
    if (local.dayCloseReminderTime && !isValidTime(local.dayCloseReminderTime)) {
      return true;
    }
    return false;
  }, [local.dayCloseReminderTime, local.dayStartReminderTime]);

  const applySave = async () => {
    if (hasInvalidTime) {
      setShowError(true);
      return;
    }
    setShowError(false);
    await onSave(local);
  };

  return (
    <Card className="settings-notifications" as="section">
      <header className="settings-notifications__header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <div className="settings-notifications__list">
        <div className="settings-notifications__row">
          <Toggle
            label={fields.dayStartReminder}
            checked={Boolean(local.dayStartReminderTime)}
            onChange={(event) =>
              setLocal((current) => ({
                ...current,
                dayStartReminderTime: event.target.checked ? current.dayStartReminderTime ?? "08:00" : null,
              }))
            }
          />
          <Input
            type="time"
            label={fields.timeLabel}
            value={local.dayStartReminderTime ?? ""}
            disabled={!local.dayStartReminderTime}
            onChange={(event) =>
              setLocal((current) => ({
                ...current,
                dayStartReminderTime: event.target.value || null,
              }))
            }
          />
        </div>

        <div className="settings-notifications__row">
          <Toggle
            label={fields.dayCloseReminder}
            checked={Boolean(local.dayCloseReminderTime)}
            onChange={(event) =>
              setLocal((current) => ({
                ...current,
                dayCloseReminderTime: event.target.checked ? current.dayCloseReminderTime ?? "21:00" : null,
              }))
            }
          />
          <Input
            type="time"
            label={fields.timeLabel}
            value={local.dayCloseReminderTime ?? ""}
            disabled={!local.dayCloseReminderTime}
            onChange={(event) =>
              setLocal((current) => ({
                ...current,
                dayCloseReminderTime: event.target.value || null,
              }))
            }
          />
        </div>

        <Toggle
          label={fields.push}
          checked={local.pushEnabled}
          onChange={(event) =>
            setLocal((current) => ({
              ...current,
              pushEnabled: event.target.checked,
            }))
          }
        />
        <Toggle
          label={fields.escalation}
          checked={local.emailEscalationsEnabled}
          onChange={(event) =>
            setLocal((current) => ({
              ...current,
              emailEscalationsEnabled: event.target.checked,
            }))
          }
        />
      </div>

      {showError ? (
        <p className="settings-notifications__error" role="alert">
          {validationError}
        </p>
      ) : null}

      <div className="settings-notifications__actions">
        <Button loading={isSaving} onClick={() => void applySave()}>
          {saveLabel}
        </Button>
      </div>
    </Card>
  );
}
