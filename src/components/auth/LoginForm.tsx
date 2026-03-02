import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { defaultLocale } from "@/i18n/config";
import { getCurrentLocale, translateForLocale } from "@/i18n/runtime";
import { getAccessToken, getPersistedUser, login as loginRequest } from "@/lib/auth";
import { trackEvent } from "@/lib/tracking";
import { getPostAuthRedirectPath, isValidEmail, mapAuthErrorKey } from "./utils";
import "./LoginForm.css";

type LoginValues = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

export function LoginForm() {
  const [locale, setLocale] = useState<ReturnType<typeof getCurrentLocale>>(defaultLocale);
  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
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

  const validate = (nextValues: LoginValues): LoginErrors => {
    const nextErrors: LoginErrors = {};

    if (!nextValues.email.trim()) {
      nextErrors.email = t("auth.errors.emailRequired");
    } else if (!isValidEmail(nextValues.email.trim())) {
      nextErrors.email = t("auth.errors.emailInvalid");
    }

    if (!nextValues.password.trim()) {
      nextErrors.password = t("auth.errors.passwordRequired");
    }

    return nextErrors;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      await loginRequest(values.email.trim(), values.password);
      trackEvent("login", { method: "password" });
      const destination = await getPostAuthRedirectPath();
      window.location.assign(destination);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("auth.errors.generic");
      const displayKey = mapAuthErrorKey(message);
      const toShow =
        import.meta.env.DEV && displayKey === "auth.errors.generic" && message
          ? message
          : t(displayKey);
      setFormError(toShow);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="login-form" onSubmit={onSubmit} noValidate>
      <Input
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
        required
      />
      <Input
        label={t("auth.password")}
        type="password"
        autoComplete="current-password"
        value={values.password}
        error={errors.password}
        onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
        required
      />
      {formError ? (
        <p className="login-form__error" role="alert">
          {formError}
        </p>
      ) : null}
      <Button type="submit" fullWidth loading={submitting}>
        {t("auth.login")}
      </Button>
      <nav className="login-form__links" aria-label={t("auth.linksAria")}>
        <a href="/forgot-password">{t("auth.forgotPassword")}</a>
        <a href="/register">{t("auth.createAccountLink")}</a>
      </nav>
    </form>
  );
}
