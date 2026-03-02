export const STORAGE_KEYS = {
  theme: "onlyTodayTheme",
  locale: "onlyTodayLocale",
  accessToken: "onlyTodayAccessToken",
  refreshToken: "onlyTodayRefreshToken",
  authUser: "onlyTodayAuthUser",
} as const;

export const POMODORO_DURATION_SECONDS = 25 * 60;
export const POMODORO_BREAK_SECONDS = 5 * 60;

export const OFFLINE_SYNC = {
  heartbeatMs: 30_000,
  intervalMs: 60_000,
  maxRetries: 5,
  baseBackoffMs: 1_000,
} as const;

export const BUDDY_CHECKIN_POLL_MS = 15_000;

/** Timeout for API fetch requests to prevent hanging when server is unreachable. */
export const API_FETCH_TIMEOUT_MS = 15_000;
