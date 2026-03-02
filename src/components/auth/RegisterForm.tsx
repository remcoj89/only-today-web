import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { defaultLocale } from "@/i18n/config";
import { getCurrentLocale, translateForLocale } from "@/i18n/runtime";
import {
  getAccessToken,
  getPersistedUser,
  login as loginRequest,
  register as registerRequest,
} from "@/lib/auth";
import { trackEvent } from "@/lib/tracking";
import { getPasswordStrength, getPostAuthRedirectPath, isValidEmail, mapAuthErrorKey } from "./utils";
import "./RegisterForm.css";

type RegisterValues = {
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

export function RegisterForm() {
  const [locale, setLocale] = useState<ReturnType<typeof getCurrentLocale>>(defaultLocale);
  const [values, setValues] = useState<RegisterValues>({
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const t = useMemo(
    () => (key: string, values?: Record<string, string | number>) => translateForLocale(locale, key, values),
    [locale],
  );
  const strength = useMemo(() => getPasswordStrength(values.password), [values.password]);

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

  const validate = (nextValues: RegisterValues): RegisterErrors => {
    const nextErrors: RegisterErrors = {};

    if (!nextValues.email.trim()) {
      nextErrors.email = t("auth.errors.emailRequired");
    } else if (!isValidEmail(nextValues.email.trim())) {
      nextErrors.email = t("auth.errors.emailInvalid");
    }

    if (!nextValues.password) {
      nextErrors.password = t("auth.errors.passwordRequired");
    } else if (nextValues.password.length < 8) {
      nextErrors.password = t("auth.errors.passwordMinLength");
    }

    if (!nextValues.confirmPassword) {
      nextErrors.confirmPassword = t("auth.errors.confirmPasswordRequired");
    } else if (nextValues.password !== nextValues.confirmPassword) {
      nextErrors.confirmPassword = t("auth.errors.confirmPasswordMismatch");
    }

    if (!nextValues.termsAccepted) {
      nextErrors.termsAccepted = t("auth.errors.termsRequired");
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
      const session = await registerRequest(values.email.trim(), values.password);
      if (!session) {
        await loginRequest(values.email.trim(), values.password);
      }
      trackEvent("sign_up", { method: "password" });
      window.location.assign("/onboarding");
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
    <form className="register-form" onSubmit={onSubmit} noValidate>
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
        autoComplete="new-password"
        value={values.password}
        error={errors.password}
        onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
        required
      />
      <div className="register-form__strength">
        <ProgressBar value={strength.score * 25} max={100} />
        <p className={`register-form__strength-label register-form__strength-label--${strength.label}`}>
          {t(`auth.passwordStrength.${strength.label}`)}
        </p>
      </div>
      <Input
        label={t("auth.confirmPassword")}
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={(event) => setValues((current) => ({ ...current, confirmPassword: event.target.value }))}
        required
      />
      <Checkbox
        checked={values.termsAccepted}
        error={errors.termsAccepted}
        onChange={(event) => setValues((current) => ({ ...current, termsAccepted: event.target.checked }))}
        label={t("auth.acceptTerms")}
        required
      />
      {formError ? (
        <p className="register-form__error" role="alert">
          {formError}
        </p>
      ) : null}
      <Button type="submit" fullWidth loading={submitting}>
        {t("auth.register")}
      </Button>
      <p className="register-form__login-link">
        <a href="/login">{t("auth.alreadyHaveAccount")}</a>
      </p>
    </form>
  );
}
