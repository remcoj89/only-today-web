const HH_MM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const DELETE_CONFIRMATION_TEXT = "DELETE";

export function normalizeTime(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  if (HH_MM_REGEX.test(value)) {
    return value;
  }
  const match = /^([01]\d|2[0-3]):([0-5]\d):[0-5]\d$/.exec(value);
  if (!match) {
    return null;
  }
  return `${match[1]}:${match[2]}`;
}

export function isValidTime(value: string): boolean {
  return HH_MM_REGEX.test(value);
}

export function getTimezones(): string[] {
  try {
    if (typeof Intl?.supportedValuesOf === "function") {
      return ["UTC", ...Intl.supportedValuesOf("timeZone")];
    }
  } catch {
    /* fallback to common list */
  }
  return ["UTC", "Europe/Amsterdam", "Europe/Berlin", "Europe/London", "America/New_York"];
}

export function toBackendTime(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return isValidTime(value) ? value : null;
}
