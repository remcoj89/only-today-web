import { API_FETCH_TIMEOUT_MS, STORAGE_KEYS } from "@/lib/constants";

export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type BackendUser = {
  id: string;
  email?: string | null;
};

type BackendSession = {
  access_token?: string;
  refresh_token?: string;
  user?: BackendUser | null;
};

type ApiErrorPayload = {
  success: false;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

type ApiSuccessPayload<T> = {
  success: true;
  data: T;
};

type ApiPayload<T> = ApiErrorPayload | ApiSuccessPayload<T>;

function persistSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEYS.accessToken, session.accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, session.refreshToken);
  localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(session.user));
}

export function clearPersistedSession(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.authUser);
}

function getApiBaseUrl(): string {
  const raw = import.meta.env.PUBLIC_APP_URL;
  if (!raw) {
    throw new Error("Missing PUBLIC_APP_URL environment variable.");
  }

  return String(raw).replace(/\/$/, "");
}

function resolveApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const typedPayload = payload as Partial<ApiErrorPayload>;
  if (typedPayload.details && typeof typedPayload.details === "object") {
    const detailsMessage = (typedPayload.details as Record<string, unknown>).message;
    if (typeof detailsMessage === "string" && detailsMessage.trim()) {
      return detailsMessage;
    }
  }

  if (typeof typedPayload.message === "string" && typedPayload.message.trim()) {
    return typedPayload.message;
  }

  return fallback;
}

async function requestAuth<T>(path: string, init: RequestInit): Promise<T> {
  const endpoint = `${getApiBaseUrl()}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(resolveApiErrorMessage(payload, "Authentication request failed."));
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Authentication response was empty.");
  }

  const typedPayload = payload as Partial<ApiPayload<T>>;
  if (typedPayload.success !== true) {
    throw new Error(resolveApiErrorMessage(payload, "Authentication request failed."));
  }

  return typedPayload.data as T;
}

function toAuthSession(
  session: BackendSession | null | undefined,
  explicitUser?: BackendUser | null,
): AuthSession | null {
  if (!session) {
    return null;
  }

  if (typeof session.access_token !== "string" || typeof session.refresh_token !== "string") {
    throw new Error("No session returned from auth endpoint.");
  }

  const user = session.user ?? explicitUser ?? null;
  if (!user?.id) {
    throw new Error("No user returned from auth endpoint.");
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: {
      id: user.id,
      email: user.email ?? null,
    },
  };
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const data = await requestAuth<{ user: BackendUser; session: BackendSession | null }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const session = toAuthSession(data.session, data.user);
  if (!session) {
    throw new Error("No session returned from login.");
  }

  persistSession(session);
  return session;
}

export async function register(email: string, password: string): Promise<AuthSession | null> {
  const data = await requestAuth<{ user: BackendUser; session: BackendSession | null }>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const session = toAuthSession(data.session, data.user);
  if (session) {
    persistSession(session);
  }

  return session;
}

export async function logout(): Promise<void> {
  const accessToken = getAccessToken();
  const user = getPersistedUser();

  if (accessToken) {
    await requestAuth<{ success: true }>("/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  if (user?.id) {
    const { clearOfflineOnLogout } = await import("@/lib/offline");
    await clearOfflineOnLogout(user.id);
  }

  clearPersistedSession();
}

export async function refreshToken(): Promise<AuthSession> {
  const refreshTokenValue = localStorage.getItem(STORAGE_KEYS.refreshToken);
  if (!refreshTokenValue) {
    throw new Error("No refresh token found.");
  }

  const data = await requestAuth<{ session: BackendSession | null }>("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken: refreshTokenValue,
    }),
  });

  const fallbackUser = getPersistedUser();
  const session = toAuthSession(
    data.session,
    fallbackUser ? { id: fallbackUser.id, email: fallbackUser.email } : null,
  );
  if (!session) {
    throw new Error("No session returned after refresh.");
  }

  persistSession(session);
  return session;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await requestAuth<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export function getPersistedUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEYS.authUser);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearPersistedSession();
    return null;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}
