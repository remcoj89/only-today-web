import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { defaultLocale } from "@/i18n/config";
import { getCurrentLocale, translateForLocale } from "@/i18n/runtime";
import { getAccessToken, getPersistedUser, requestPasswordReset } from "@/lib/auth";
import { getPostAuthRedirectPath, isValidEmail } from "./utils";
import "./ForgotPassword.css";

export function ForgotPassword() {
  const [locale, setLocale] = useState<ReturnType<typeof getCurrentLocale>>(defaultLocale);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const t = useMemo(
    () => (key: string, values?: Record<string, string | number>) => translateForLocale(locale, key, values),
    [locale],
  );

  useEffect(() => {
    setLocale(getCurrentLocale());
    const user = getPersistedUser();
    const token = getAccessToken();
    if (!user || !token) {
      return;
    }

    let cancelled = false;
    void (async () => {
      const destination = await getPostAuthRedirectPath();
      if (!cancelled) {
        window.location.replace(destination);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError(undefined);

    if (!email.trim()) {
      setEmailError(t("auth.errors.emailRequired"));
      return;
    }
    if (!isValidEmail(email.trim())) {
      setEmailError(t("auth.errors.emailInvalid"));
      return;
    }

    try {
      setSubmitting(true);
      await requestPasswordReset(email.trim());
    } finally {
      // Security: nooit laten blijken of e-mailadres bestaat.
      setSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <section className="forgot-password" aria-live="polite">
      <form className="forgot-password__form" onSubmit={onSubmit} noValidate>
        <Input
          label={t("auth.email")}
          type="email"
          autoComplete="email"
          value={email}
          error={emailError}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Button type="submit" fullWidth loading={submitting}>
          {t("auth.sendResetLink")}
        </Button>
      </form>
      {isSubmitted ? (
        <p className="forgot-password__confirmation" role="status">
          {t("auth.resetEmailConfirmation")}
        </p>
      ) : null}
      <p className="forgot-password__back-link">
        <a href="/login">{t("auth.backToLogin")}</a>
      </p>
    </section>
  );
}
