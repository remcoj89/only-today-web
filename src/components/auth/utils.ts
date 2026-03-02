import { apiFetch } from "@/lib/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return emailRegex.test(value);
}

export async function getPostAuthRedirectPath(): Promise<string> {
  const response = await apiFetch<{ document: unknown }>("/periods/quarter/current");

  if (response.success) {
    return "/today";
  }

  if (response.code === "VALIDATION_ERROR") {
    return "/onboarding";
  }

  return "/today";
}

export function mapAuthErrorKey(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials") || normalized.includes("invalid email or password")) {
    return "auth.errors.invalidCredentials";
  }
  if (normalized.includes("email not confirmed")) {
    return "auth.errors.emailNotConfirmed";
  }
  if (normalized.includes("already registered") || normalized.includes("already been registered")) {
    return "auth.errors.emailAlreadyRegistered";
  }

  return "auth.errors.generic";
}

export function getPasswordStrength(password: string): { score: number; label: "weak" | "medium" | "strong" } {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
    score += 1;
  }
  if (/\d/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  if (score >= 3) {
    return { score, label: "strong" };
  }
  if (score === 2) {
    return { score, label: "medium" };
  }
  return { score, label: "weak" };
}
