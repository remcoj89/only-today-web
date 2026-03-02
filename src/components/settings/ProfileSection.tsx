import { useEffect, useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import type { UserProfile } from "./types";
import "./ProfileSection.css";

type ProfileSectionProps = {
  title: string;
  description: string;
  nameLabel: string;
  emailLabel: string;
  saveLabel: string;
  profile: UserProfile;
  isSaving: boolean;
  onSave: (name: string) => Promise<void>;
};

export function ProfileSection({
  title,
  description,
  nameLabel,
  emailLabel,
  saveLabel,
  profile,
  isSaving,
  onSave,
}: ProfileSectionProps) {
  const [name, setName] = useState(profile.name);

  useEffect(() => {
    setName(profile.name);
  }, [profile.name]);

  return (
    <Card className="settings-profile" as="section">
      <header className="settings-profile__header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="settings-profile__fields">
        <Input label={nameLabel} value={name} onChange={(event) => setName(event.target.value)} />
        <Input label={emailLabel} value={profile.email} readOnly />
      </div>
      <div className="settings-profile__actions">
        <Button loading={isSaving} onClick={() => void onSave(name.trim())}>
          {saveLabel}
        </Button>
      </div>
    </Card>
  );
}
