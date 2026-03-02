import { useEffect, useState } from "react";
import { Button, Card, ConfirmDialog, Input, Modal, Select } from "@/components/ui";
import type { UserSettings } from "./types";
import { DELETE_CONFIRMATION_TEXT } from "./utils";
import "./AccountSection.css";

type AccountSectionProps = {
  title: string;
  description: string;
  timezoneLabel: string;
  timezoneHelp: string;
  timezoneSaveLabel: string;
  passwordTitle: string;
  passwordDescription: string;
  currentPasswordLabel: string;
  newPasswordLabel: string;
  updatePasswordLabel: string;
  deletingLabel: string;
  deleteTitle: string;
  deleteDescription: string;
  deleteActionLabel: string;
  deleteConfirmTitle: string;
  deleteConfirmDescription: string;
  deleteSecondStepTitle: string;
  deleteSecondStepDescription: string;
  deleteSecondStepLabel: string;
  deleteSecondStepPlaceholder: string;
  confirm: string;
  cancel: string;
  save: string;
  timezoneOptions: string[];
  settings: UserSettings;
  isSavingTimezone: boolean;
  isUpdatingPassword: boolean;
  isDeletingAccount: boolean;
  onSaveTimezone: (timezone: string) => Promise<void>;
  onUpdatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onDeleteAccount: (confirmation: string) => Promise<void>;
};

export function AccountSection({
  title,
  description,
  timezoneLabel,
  timezoneHelp,
  timezoneSaveLabel,
  passwordTitle,
  passwordDescription,
  currentPasswordLabel,
  newPasswordLabel,
  updatePasswordLabel,
  deletingLabel,
  deleteTitle,
  deleteDescription,
  deleteActionLabel,
  deleteConfirmTitle,
  deleteConfirmDescription,
  deleteSecondStepTitle,
  deleteSecondStepDescription,
  deleteSecondStepLabel,
  deleteSecondStepPlaceholder,
  confirm,
  cancel,
  save,
  timezoneOptions,
  settings,
  isSavingTimezone,
  isUpdatingPassword,
  isDeletingAccount,
  onSaveTimezone,
  onUpdatePassword,
  onDeleteAccount,
}: AccountSectionProps) {
  const [timezone, setTimezone] = useState(settings.timezone);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePhraseOpen, setDeletePhraseOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");

  useEffect(() => {
    setTimezone(settings.timezone);
  }, [settings.timezone]);

  return (
    <Card className="settings-account" as="section">
      <header className="settings-account__header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <div className="settings-account__block">
        <Select
          label={timezoneLabel}
          helperText={timezoneHelp}
          value={timezone}
          options={timezoneOptions.map((value) => ({ value, label: value }))}
          onChange={(event) => setTimezone(event.target.value)}
        />
        <Button loading={isSavingTimezone} onClick={() => void onSaveTimezone(timezone)}>
          {timezoneSaveLabel}
        </Button>
      </div>

      <div className="settings-account__block">
        <h3>{passwordTitle}</h3>
        <p>{passwordDescription}</p>
        <Button variant="secondary" onClick={() => setPasswordModalOpen(true)}>
          {updatePasswordLabel}
        </Button>
      </div>

      <div className="settings-account__block settings-account__block--danger">
        <h3>{deleteTitle}</h3>
        <p>{deleteDescription}</p>
        <Button variant="danger" onClick={() => setDeleteConfirmOpen(true)}>
          {isDeletingAccount ? deletingLabel : deleteActionLabel}
        </Button>
      </div>

      <Modal
        isOpen={passwordModalOpen}
        title={passwordTitle}
        onClose={() => setPasswordModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPasswordModalOpen(false)}>
              {cancel}
            </Button>
            <Button
              loading={isUpdatingPassword}
              onClick={() =>
                void onUpdatePassword(currentPassword, newPassword).then(() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setPasswordModalOpen(false);
                })
              }
            >
              {save}
            </Button>
          </>
        }
      >
        <div className="settings-account__modal">
          <Input
            type="password"
            label={currentPasswordLabel}
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <Input
            type="password"
            label={newPasswordLabel}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title={deleteConfirmTitle}
        description={deleteConfirmDescription}
        confirmLabel={confirm}
        cancelLabel={cancel}
        destructive
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          setDeletePhraseOpen(true);
        }}
      />

      <Modal
        isOpen={deletePhraseOpen}
        title={deleteSecondStepTitle}
        onClose={() => setDeletePhraseOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeletePhraseOpen(false)}>
              {cancel}
            </Button>
            <Button
              variant="danger"
              loading={isDeletingAccount}
              disabled={deletePhrase !== DELETE_CONFIRMATION_TEXT}
              onClick={() => void onDeleteAccount(deletePhrase)}
            >
              {deleteActionLabel}
            </Button>
          </>
        }
      >
        <div className="settings-account__modal">
          <p>{deleteSecondStepDescription}</p>
          <Input
            label={deleteSecondStepLabel}
            value={deletePhrase}
            placeholder={deleteSecondStepPlaceholder}
            onChange={(event) => setDeletePhrase(event.target.value)}
          />
        </div>
      </Modal>
    </Card>
  );
}
