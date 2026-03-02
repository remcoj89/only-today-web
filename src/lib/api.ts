import { clearPersistedSession, getAccessToken, refreshToken } from "@/lib/auth";
import { API_FETCH_TIMEOUT_MS } from "@/lib/constants";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

function toApiError(error: unknown): ApiError {
  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    return {
      success: false,
      code: typeof record.code === "string" ? record.code : "UNKNOWN_ERROR",
      message: typeof record.message === "string" ? record.message : "Er ging iets mis.",
      details: typeof record.details === "object" ? (record.details as Record<string, unknown>) : undefined,
    };
  }

  return {
    success: false,
    code: "UNKNOWN_ERROR",
    message: "Er ging iets mis.",
  };
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.ok) {
    if (payload && typeof payload === "object" && "success" in payload) {
      return payload as ApiResponse<T>;
    }

    return {
      success: true,
      data: payload as T,
    };
  }

  return toApiError(payload);
}

function getApiBaseUrl(): string {
  const raw = import.meta.env.PUBLIC_APP_URL ?? "";
  const base = raw.replace(/\/$/, "");
  if (!base) {
    throw new Error("PUBLIC_APP_URL is niet geconfigureerd. Controleer je .env bestand.");
  }
  return base;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: { allowRetry?: boolean } = {},
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const endpoint = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const accessToken = getAccessToken();
  const headers = new Headers(init.headers ?? {});

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      return {
        success: false,
        code: "TIMEOUT",
        message: "Het verzoek duurde te lang. Controleer je internetverbinding.",
      };
    }
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: err instanceof Error ? err.message : "Netwerkfout. Controleer je verbinding.",
    };
  }
  clearTimeout(timeoutId);

  if (response.status === 401 && options.allowRetry !== false) {
    try {
      await refreshToken();
      return apiFetch<T>(path, init, { allowRetry: false });
    } catch {
      clearPersistedSession();
      window.location.assign("/login");
      return {
        success: false,
        code: "UNAUTHORIZED",
        message: "Je sessie is verlopen. Log opnieuw in.",
      };
    }
  }

  return parseResponse<T>(response);
}
