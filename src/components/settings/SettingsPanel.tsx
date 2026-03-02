import { useEffect, useMemo, useState } from "react";
import { Card, Skeleton, Spinner } from "@/components/ui";
import { ThemeProvider } from "@/context/ThemeContext";
import { I18nProvider } from "@/context/I18nContext";
import { clearPersistedSession } from "@/lib/auth";
import { useTranslation } from "@/i18n/useTranslation";
import { deleteAccount, getProfile, getSettings, updatePassword, updateProfile, updateSettings } from "./api";
import { AccountSection } from "./AccountSection";
import { LanguageSelector } from "./LanguageSelector";
import { NotificationPrefs } from "./NotificationPrefs";
import { ProfileSection } from "./ProfileSection";
import { ThemeToggle } from "./ThemeToggle";
import type { UserProfile, UserSettings } from "./types";
import { getTimezones } from "./utils";
import "./SettingsPanel.css";

const DEFAULT_SETTINGS: UserSettings = {
  dayStartReminderTime: null,
  dayCloseReminderTime: null,
  pushEnabled: true,
  emailEscalationsEnabled: true,
  timezone: "UTC",
};

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  email: "",
};

function SettingsPanelContent() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingTimezone, setSavingTimezone] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const timezones = useMemo(() => getTimezones(), []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [loadedSettings, loadedProfile] = await Promise.all([getSettings(), getProfile()]);
        if (!mounted) {
          return;
        }
        setSettings(loadedSettings);
        setProfile(loadedProfile);
      } catch (err) {
        if (!mounted) {
          return;
        }
        const message = err instanceof Error && err.message ? err.message : t("settings.messages.loadError");
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const setSuccess = (message: string) => {
    setStatusMessage(message);
  };

  const setFailure = (err: unknown, fallbackKey: string) => {
    if (err instanceof Error && err.message) {
      setError(err.message);
      return;
    }
    setError(t(fallbackKey));
  };

  return (
    <section className="settings-panel" aria-label={t("settings.page.ariaLabel")}>
      <header className="settings-panel__header">
        <h1>{t("settings.page.title")}</h1>
        <p>{t("settings.page.subtitle")}</p>
      </header>

      {statusMessage ? (
        <Card className="settings-panel__message settings-panel__message--success" role="status">
          {statusMessage}
        </Card>
      ) : null}

      {error ? (
        <Card className="settings-panel__message settings-panel__message--error" role="alert">
          {error}
        </Card>
      ) : null}

      {loading ? (
        <Card className="settings-panel__state">
          <Spinner size="md" label={t("settings.messages.loading")} />
          <Skeleton lines={4} />
        </Card>
      ) : null}

      {!loading ? (
        <div className="settings-panel__sections">
          <ProfileSection
            title={t("settings.profile.title")}
            description={t("settings.profile.description")}
            nameLabel={t("settings.profile.nameLabel")}
            emailLabel={t("settings.profile.emailLabel")}
            saveLabel={t("common.save")}
            profile={profile}
            isSaving={savingProfile}
            onSave={async (name) => {
              if (!name) {
                setError(t("settings.profile.errors.nameRequired"));
                return;
              }
              setSavingProfile(true);
              setError(null);
              try {
                const updated = await updateProfile({ name });
                setProfile(updated);
                setSuccess(t("settings.messages.profileSaved"));
              } catch (err) {
                setFailure(err, "settings.messages.profileSaveError");
              } finally {
                setSavingProfile(false);
              }
            }}
          />

          <NotificationPrefs
            title={t("settings.notifications.title")}
            description={t("settings.notifications.description")}
            fields={{
              dayStartReminder: t("settings.notifications.dayStartReminder"),
              dayCloseReminder: t("settings.notifications.dayCloseReminder"),
              push: t("settings.notifications.pushEnabled"),
              escalation: t("settings.notifications.emailEscalations"),
              timeLabel: t("settings.notifications.timeLabel"),
            }}
            saveLabel={t("common.save")}
            validationError={t("settings.notifications.errors.invalidTime")}
            settings={settings}
            isSaving={savingNotifications}
            onSave={async (nextSettings) => {
              setSavingNotifications(true);
              setError(null);
              try {
                const updated = await updateSettings(nextSettings);
                setSettings(updated);
                setSuccess(t("settings.messages.notificationsSaved"));
              } catch (err) {
                setFailure(err, "settings.messages.notificationsSaveError");
              } finally {
                setSavingNotifications(false);
              }
            }}
          />

          <Card as="section" className="settings-panel__surface">
            <ThemeToggle
              title={t("settings.theme.title")}
              description={t("settings.theme.description")}
              options={[
                { value: "light", label: t("settings.theme.light") },
                { value: "dark", label: t("settings.theme.dark") },
                { value: "system", label: t("settings.theme.system") },
              ]}
              successMessage={t("settings.messages.themeSaved")}
              onSaved={setSuccess}
            />
          </Card>

          <Card as="section" className="settings-panel__surface">
            <LanguageSelector
              title={t("settings.language.title")}
              description={t("settings.language.description")}
              label={t("settings.language.label")}
              options={[
                { value: "nl", label: t("settings.language.nl") },
                { value: "en", label: t("settings.language.en") },
                { value: "de", label: t("settings.language.de") },
              ]}
              successMessage={t("settings.messages.languageSaved")}
              onSaved={setSuccess}
            />
          </Card>

          <AccountSection
            title={t("settings.account.title")}
            description={t("settings.account.description")}
            timezoneLabel={t("settings.account.timezoneLabel")}
            timezoneHelp={t("settings.account.timezoneHelp")}
            timezoneSaveLabel={t("settings.account.saveTimezone")}
            passwordTitle={t("settings.account.passwordTitle")}
            passwordDescription={t("settings.account.passwordDescription")}
            currentPasswordLabel={t("settings.account.currentPassword")}
            newPasswordLabel={t("settings.account.newPassword")}
            updatePasswordLabel={t("settings.account.changePassword")}
            deletingLabel={t("settings.account.deleting")}
            deleteTitle={t("settings.account.deleteTitle")}
            deleteDescription={t("settings.account.deleteDescription")}
            deleteActionLabel={t("settings.account.deleteAction")}
            deleteConfirmTitle={t("settings.account.deleteConfirmTitle")}
            deleteConfirmDescription={t("settings.account.deleteConfirmDescription")}
            deleteSecondStepTitle={t("settings.account.deleteSecondStepTitle")}
            deleteSecondStepDescription={t("settings.account.deleteSecondStepDescription")}
            deleteSecondStepLabel={t("settings.account.deleteSecondStepLabel")}
            deleteSecondStepPlaceholder={t("settings.account.deleteSecondStepPlaceholder")}
            confirm={t("common.confirm")}
            cancel={t("common.cancel")}
            save={t("common.save")}
            timezoneOptions={timezones}
            settings={settings}
            isSavingTimezone={savingTimezone}
            isUpdatingPassword={savingPassword}
            isDeletingAccount={deleting}
            onSaveTimezone={async (timezone) => {
              setSavingTimezone(true);
              setError(null);
              try {
                const updated = await updateSettings({ timezone });
                setSettings(updated);
                setSuccess(t("settings.messages.timezoneSaved"));
              } catch (err) {
                setFailure(err, "settings.messages.timezoneSaveError");
              } finally {
                setSavingTimezone(false);
              }
            }}
            onUpdatePassword={async (currentPassword, newPassword) => {
              if (!currentPassword || !newPassword) {
                setError(t("settings.account.errors.passwordRequired"));
                return;
              }
              if (newPassword.length < 8) {
                setError(t("settings.account.errors.passwordTooShort"));
                return;
              }
              setSavingPassword(true);
              setError(null);
              try {
                await updatePassword({ currentPassword, newPassword });
                setSuccess(t("settings.messages.passwordSaved"));
              } catch (err) {
                setFailure(err, "settings.messages.passwordSaveError");
              } finally {
                setSavingPassword(false);
              }
            }}
            onDeleteAccount={async (confirmation) => {
              if (confirmation !== "DELETE") {
                setError(t("settings.account.errors.deleteConfirmation"));
                return;
              }
              setDeleting(true);
              setError(null);
              try {
                await deleteAccount({ confirmation });
                clearPersistedSession();
                window.location.assign("/register");
              } catch (err) {
                setFailure(err, "settings.messages.deleteError");
              } finally {
                setDeleting(false);
              }
            }}
          />
        </div>
      ) : null}
    </section>
  );
}

export function SettingsPanel() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <SettingsPanelContent />
      </I18nProvider>
    </ThemeProvider>
  );
}
