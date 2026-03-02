export type UserProfile = {
  name: string;
  email: string;
};

export type UserSettings = {
  dayStartReminderTime: string | null;
  dayCloseReminderTime: string | null;
  pushEnabled: boolean;
  emailEscalationsEnabled: boolean;
  timezone: string;
};

export type UserSettingsUpdate = Partial<{
  dayStartReminderTime: string | null;
  dayCloseReminderTime: string | null;
  pushEnabled: boolean;
  emailEscalationsEnabled: boolean;
  timezone: string;
}>;
