const CONSENT_KEY = "onlyTodayAnalyticsConsent";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export type AnalyticsConsent = "granted" | "denied" | "unknown";

export function getAnalyticsConsent(): AnalyticsConsent {
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === "granted" || stored === "denied") {
    return stored;
  }
  return "unknown";
}

export function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, "unknown">): void {
  localStorage.setItem(CONSENT_KEY, consent);
}

export function hasAnalyticsConsent(): boolean {
  return getAnalyticsConsent() === "granted";
}

export function trackEvent(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) {
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...params,
  });
}
