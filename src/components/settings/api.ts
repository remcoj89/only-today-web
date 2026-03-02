import { apiFetch } from "@/lib/api";
import { normalizeTime } from "./utils";
import type { UserProfile, UserSettings, UserSettingsUpdate } from "./types";

type SettingsApiResponse = {
  settings: {
    day_start_reminder_time?: string | null;
    day_close_reminder_time?: string | null;
    push_enabled?: boolean;
    email_for_escalations_enabled?: boolean;
    timezone?: string;
  };
};

type ProfileApiResponse = {
  profile: {
    name?: string;
    email?: string;
  };
};

function mapSettingsFromApi(raw: SettingsApiResponse["settings"]): UserSettings {
  return {
    dayStartReminderTime: normalizeTime(raw?.day_start_reminder_time ?? null) ?? null,
    dayCloseReminderTime: normalizeTime(raw?.day_close_reminder_time ?? null) ?? null,
    pushEnabled: raw?.push_enabled ?? true,
    emailEscalationsEnabled: raw?.email_for_escalations_enabled ?? true,
    timezone: raw?.timezone ?? "UTC",
  };
}

function mapSettingsToApi(updates: UserSettingsUpdate): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (updates.dayStartReminderTime !== undefined) {
    body.day_start_reminder_time = updates.dayStartReminderTime;
  }
  if (updates.dayCloseReminderTime !== undefined) {
    body.day_close_reminder_time = updates.dayCloseReminderTime;
  }
  if (updates.pushEnabled !== undefined) {
    body.push_enabled = updates.pushEnabled;
  }
  if (updates.emailEscalationsEnabled !== undefined) {
    body.email_for_escalations_enabled = updates.emailEscalationsEnabled;
  }
  if (updates.timezone !== undefined) {
    body.timezone = updates.timezone;
  }
  return body;
}

export async function getSettings(): Promise<UserSettings> {
  const response = await apiFetch<SettingsApiResponse>("/settings");
  if (!response.success) {
    throw new Error(response.message);
  }
  return mapSettingsFromApi(response.data.settings);
}

export async function getProfile(): Promise<UserProfile> {
  const response = await apiFetch<ProfileApiResponse>("/settings/profile");
  if (!response.success) {
    throw new Error(response.message);
  }
  const p = response.data.profile;
  return {
    name: p?.name ?? "",
    email: p?.email ?? "",
  };
}

export async function updateSettings(updates: UserSettingsUpdate): Promise<UserSettings> {
  const body = mapSettingsToApi(updates);
  if (Object.keys(body).length === 0) {
    return getSettings();
  }
  const response = await apiFetch<SettingsApiResponse>("/settings", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!response.success) {
    throw new Error(response.message);
  }
  return mapSettingsFromApi(response.data.settings);
}

export async function updateProfile(payload: { name: string }): Promise<UserProfile> {
  const response = await apiFetch<ProfileApiResponse>("/settings/profile", {
    method: "PATCH",
    body: JSON.stringify({ name: payload.name.trim() }),
  });
  if (!response.success) {
    throw new Error(response.message);
  }
  const p = response.data.profile;
  return {
    name: p?.name ?? "",
    email: p?.email ?? "",
  };
}

export async function updatePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const response = await apiFetch<{ updated: boolean }>("/settings/password", {
    method: "POST",
    body: JSON.stringify({
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    }),
  });
  if (!response.success) {
    throw new Error(response.message);
  }
}

export async function deleteAccount(payload: { confirmation: string }): Promise<void> {
  const response = await apiFetch<{ deleted: boolean }>("/settings/account", {
    method: "DELETE",
    body: JSON.stringify({ confirmation: payload.confirmation }),
  });
  if (!response.success) {
    throw new Error(response.message);
  }
}
