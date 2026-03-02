import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { GoalEditor, type GoalEditorValue } from "@/components/planning/GoalEditor";
import { LifeWheel, type LifeWheelKey, type LifeWheelScores } from "@/components/planning/LifeWheel";
import { defaultLocale } from "@/i18n/config";
import { getCurrentLocale, translateForLocale } from "@/i18n/runtime";
import { apiFetch } from "@/lib/api";
import { saveDocument } from "@/lib/offline";
import { trackEvent } from "@/lib/tracking";
import "./OnboardingWizard.css";

type WizardStep = 0 | 1 | 2 | 3;

type QuarterDocumentResponse = {
  document: {
    docKey: string;
  };
};

const totalSteps = 4;

const initialLifeWheel: LifeWheelScores = {
  work: 5,
  fun: 5,
  social: 5,
  giving: 5,
  money: 5,
  growth: 5,
  health: 5,
  love: 5,
};

const initialGoals: [GoalEditorValue, GoalEditorValue, GoalEditorValue] = [
  { title: "", whatIsDifferent: "", consequencesIfNot: "", rewardIfAchieved: "", progress: 0 },
  { title: "", whatIsDifferent: "", consequencesIfNot: "", rewardIfAchieved: "", progress: 0 },
  { title: "", whatIsDifferent: "", consequencesIfNot: "", rewardIfAchieved: "", progress: 0 },
];

function isNotFoundOrUninitializedCode(code: string): boolean {
  return code === "VALIDATION_ERROR" || code === "NOT_FOUND" || code === "DOC_NOT_FOUND";
}

export function OnboardingWizard() {
  const [locale, setLocale] = useState<ReturnType<typeof getCurrentLocale>>(defaultLocale);
  const [step, setStep] = useState<WizardStep>(0);
  const [checkingExistingQuarter, setCheckingExistingQuarter] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lifeWheel, setLifeWheel] = useState<LifeWheelScores>(initialLifeWheel);
  const [goals, setGoals] = useState<[GoalEditorValue, GoalEditorValue, GoalEditorValue]>(initialGoals);
  const [goalTitleErrors, setGoalTitleErrors] = useState<
    [string | undefined, string | undefined, string | undefined]
  >([undefined, undefined, undefined]);
  const t = useMemo(
    () => (key: string, values?: Record<string, string | number>) => translateForLocale(locale, key, values),
    [locale],
  );

  useEffect(() => {
    setLocale(getCurrentLocale());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await apiFetch<QuarterDocumentResponse>("/periods/quarter/current");
        if (cancelled) {
          return;
        }
        if (response.success) {
          window.location.replace("/today");
          return;
        }
        if (response.code === "UNAUTHORIZED") {
          window.location.replace("/login");
          return;
        }
        if (!isNotFoundOrUninitializedCode(response.code)) {
          setFormError(response.message || t("onboarding.errors.loadFailed"));
        }
      } catch {
        if (!cancelled) {
          setFormError(t("onboarding.errors.loadFailed"));
        }
      } finally {
        if (!cancelled) {
          setCheckingExistingQuarter(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const wheelLabels = useMemo<Record<LifeWheelKey, string>>(
    () => ({
      work: t("onboarding.lifeWheel.categories.work"),
      fun: t("onboarding.lifeWheel.categories.fun"),
      social: t("onboarding.lifeWheel.categories.social"),
      giving: t("onboarding.lifeWheel.categories.giving"),
      money: t("onboarding.lifeWheel.categories.money"),
      growth: t("onboarding.lifeWheel.categories.growth"),
      health: t("onboarding.lifeWheel.categories.health"),
      love: t("onboarding.lifeWheel.categories.love"),
    }),
    [t],
  );

  const goalEditorLabels = useMemo(
    () => ({
      goalTitle: t("onboarding.goals.goalTitle"),
      whatIsDifferent: t("onboarding.goals.whatIsDifferent"),
      consequencesIfNot: t("onboarding.goals.consequencesIfNot"),
      rewardIfAchieved: t("onboarding.goals.rewardIfAchieved"),
      progress: t("onboarding.goals.progress"),
      goalCard: t("onboarding.goals.goalCard"),
    }),
    [t],
  );

  const progressPercentage = ((step + 1) / totalSteps) * 100;

  function handleGoalChange<K extends keyof GoalEditorValue>(
    index: 0 | 1 | 2,
    key: K,
    value: GoalEditorValue[K],
  ) {
    setGoals((current) => {
      const next = [...current] as [GoalEditorValue, GoalEditorValue, GoalEditorValue];
      next[index] = {
        ...next[index],
        [key]: value,
      };
      return next;
    });
    if (key === "title") {
      setGoalTitleErrors((current) => {
        const next = [...current] as [string | undefined, string | undefined, string | undefined];
        next[index] = undefined;
        return next;
      });
    }
  }

  function validateGoalStep(): boolean {
    const nextErrors = goals.map((goal) =>
      goal.title.trim().length === 0 ? t("onboarding.errors.goalTitleRequired") : undefined,
    ) as [string | undefined, string | undefined, string | undefined];
    setGoalTitleErrors(nextErrors);
    return nextErrors.every((value) => value === undefined);
  }

  function goToNextStep() {
    setFormError(null);
    if (step === 2 && !validateGoalStep()) {
      return;
    }
    setStep((current) => Math.min(current + 1, 3) as WizardStep);
  }

  function goToPreviousStep() {
    setFormError(null);
    setStep((current) => Math.max(current - 1, 0) as WizardStep);
  }

  async function completeOnboarding() {
    setFormError(null);
    if (!validateGoalStep()) {
      setStep(2);
      return;
    }

    try {
      setSaving(true);
      const startQuarter = await apiFetch<QuarterDocumentResponse>("/periods/quarter/start", {
        method: "POST",
        body: JSON.stringify({ startDate: new Date().toISOString() }),
      });
      if (!startQuarter.success) {
        throw new Error(startQuarter.message || t("onboarding.errors.saveFailed"));
      }

      const quarterKey = startQuarter.data.document.docKey;
      const lifeWheelUpdate = await apiFetch<QuarterDocumentResponse>(
        `/periods/quarter/${encodeURIComponent(quarterKey)}/life-wheel`,
        {
          method: "PATCH",
          body: JSON.stringify(lifeWheel),
        },
      );
      if (!lifeWheelUpdate.success) {
        throw new Error(lifeWheelUpdate.message || t("onboarding.errors.saveFailed"));
      }

      const preparedGoals = goals.map((goal) => {
        const trimmedTitle = goal.title.trim();
        const fallback = trimmedTitle || t("onboarding.defaults.goalFallback");
        return {
          title: trimmedTitle,
          smartDefinition: trimmedTitle,
          whatIsDifferent: goal.whatIsDifferent.trim() || fallback,
          consequencesIfNot: goal.consequencesIfNot.trim() || fallback,
          rewardIfAchieved: goal.rewardIfAchieved.trim() || fallback,
        };
      });
      const goalSave = await apiFetch<QuarterDocumentResponse>(
        `/periods/quarter/${encodeURIComponent(quarterKey)}/goals`,
        {
          method: "PUT",
          body: JSON.stringify({ goals: preparedGoals }),
        },
      );
      if (!goalSave.success) {
        throw new Error(goalSave.message || t("onboarding.errors.saveFailed"));
      }

      for (const [index, goal] of goals.entries()) {
        const progressSave = await apiFetch<QuarterDocumentResponse>(
          `/periods/quarter/${encodeURIComponent(quarterKey)}/goals/${index}/progress`,
          {
            method: "PATCH",
            body: JSON.stringify({ progress: goal.progress }),
          },
        );
        if (!progressSave.success) {
          throw new Error(progressSave.message || t("onboarding.errors.saveFailed"));
        }
      }

      const syncedGoalPayload = goals.map((goal) => {
        const trimmedTitle = goal.title.trim();
        const fallback = trimmedTitle || t("onboarding.defaults.goalFallback");
        return {
          title: trimmedTitle || fallback,
          smartDefinition: trimmedTitle || fallback,
          whatIsDifferent: goal.whatIsDifferent.trim() || fallback,
          consequencesIfNot: goal.consequencesIfNot.trim() || fallback,
          rewardIfAchieved: goal.rewardIfAchieved.trim() || fallback,
          progress: goal.progress,
        };
      });
      await saveDocument({
        docType: "quarter",
        docKey: quarterKey,
        payload: {
          lifeWheel,
          quarterGoals: syncedGoalPayload,
        },
      });

      trackEvent("onboarding_complete");
      window.location.assign("/today");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("onboarding.errors.saveFailed");
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  if (checkingExistingQuarter) {
    return (
      <section className="onboarding-wizard onboarding-wizard--loading">
        <Spinner size="lg" />
        <p>{t("onboarding.loading")}</p>
      </section>
    );
  }

  return (
    <section className="onboarding-wizard">
      <header className="onboarding-wizard__header">
        <p className="onboarding-wizard__step-label">
          {t("onboarding.progress.label", { current: step + 1, total: totalSteps })}
        </p>
        <div className="onboarding-wizard__progress-track" role="presentation" aria-hidden="true">
          <div className="onboarding-wizard__progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>
        <ol className="onboarding-wizard__progress-steps" aria-label={t("onboarding.progress.ariaLabel")}>
          {[0, 1, 2, 3].map((index) => (
            <li
              key={index}
              className={`onboarding-wizard__progress-step ${index <= step ? "onboarding-wizard__progress-step--active" : ""}`}
              aria-current={index === step ? "step" : undefined}
            >
              {index + 1}
            </li>
          ))}
        </ol>
      </header>

      <div key={step} className="onboarding-wizard__content">
        {step === 0 ? (
          <section className="onboarding-wizard__panel">
            <h1>{t("onboarding.welcome.title")}</h1>
            <p>{t("onboarding.welcome.subtitle")}</p>
            <ul className="onboarding-wizard__bullets">
              <li>{t("onboarding.welcome.bullets.first")}</li>
              <li>{t("onboarding.welcome.bullets.second")}</li>
              <li>{t("onboarding.welcome.bullets.third")}</li>
            </ul>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="onboarding-wizard__panel">
            <h2>{t("onboarding.lifeWheel.title")}</h2>
            <p>{t("onboarding.lifeWheel.description")}</p>
            <LifeWheel
              values={lifeWheel}
              labels={wheelLabels}
              onChange={(key, value) =>
                setLifeWheel((current) => ({
                  ...current,
                  [key]: value,
                }))
              }
            />
          </section>
        ) : null}

        {step === 2 ? (
          <section className="onboarding-wizard__panel">
            <h2>{t("onboarding.goals.title")}</h2>
            <p>{t("onboarding.goals.description")}</p>
            <GoalEditor goals={goals} titleErrors={goalTitleErrors} labels={goalEditorLabels} onChange={handleGoalChange} />
          </section>
        ) : null}

        {step === 3 ? (
          <section className="onboarding-wizard__panel">
            <h2>{t("onboarding.confirmation.title")}</h2>
            <p>{t("onboarding.confirmation.description")}</p>
            <div className="onboarding-wizard__summary">
              <article className="onboarding-wizard__summary-card">
                <h3>{t("onboarding.confirmation.lifeWheel")}</h3>
                <LifeWheel values={lifeWheel} labels={wheelLabels} readOnly compact />
              </article>
              <article className="onboarding-wizard__summary-card">
                <h3>{t("onboarding.confirmation.goals")}</h3>
                <ol className="onboarding-wizard__goal-summary">
                  {goals.map((goal, index) => (
                    <li key={index}>
                      <strong>{goal.title.trim() || t("onboarding.defaults.goalFallback")}</strong>
                      <span>{t("onboarding.goals.progressValue", { progress: goal.progress })}</span>
                    </li>
                  ))}
                </ol>
              </article>
            </div>
          </section>
        ) : null}
      </div>

      {formError ? (
        <p className="onboarding-wizard__error" role="alert">
          {formError}
        </p>
      ) : null}

      <footer className="onboarding-wizard__actions">
        <Button variant="secondary" onClick={goToPreviousStep} disabled={step === 0 || saving}>
          {t("onboarding.actions.previous")}
        </Button>
        {step < 3 ? (
          <Button onClick={goToNextStep} disabled={saving}>
            {step === 0 ? t("onboarding.actions.beginQuarter") : t("onboarding.actions.next")}
          </Button>
        ) : (
          <Button onClick={() => void completeOnboarding()} loading={saving}>
            {t("onboarding.actions.startFirstDay")}
          </Button>
        )}
      </footer>
    </section>
  );
}
