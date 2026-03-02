import { useState, useMemo } from "react";
import { I18nProvider } from "@/context/I18nContext";
import { useTranslation } from "@/i18n/useTranslation";
import { usePlanningPeriods } from "@/hooks/usePlanningPeriods";
import { Button, Card, Spinner } from "@/components/ui";
import { GoalProgressCard } from "./GoalProgressCard";
import { LifeWheel, type LifeWheelKey, type LifeWheelScores } from "./LifeWheel";
import type { QuarterGoalPayload } from "./types";
import "./QuarterStart.css";

const defaultLifeWheel: LifeWheelScores = {
  work: 5,
  fun: 5,
  social: 5,
  giving: 5,
  money: 5,
  growth: 5,
  health: 5,
  love: 5,
};

const WHEEL_KEYS: LifeWheelKey[] = ["work", "fun", "social", "giving", "money", "growth", "health", "love"];

function QuarterStartContent() {
  const { t } = useTranslation();
  const {
    periods,
    quarterLifeWheel,
    quarterGoals,
    setQuarterLifeWheel,
    updateGoalProgress,
    refreshPeriod,
  } = usePlanningPeriods();
  const [rescoreMode, setRescoreMode] = useState(false);

  const state = periods.quarter;
  const isLoading = state.loading;
  const error = state.error;

  const wheelScores = useMemo((): LifeWheelScores => {
    const raw = quarterLifeWheel;
    if (!raw) {
      return defaultLifeWheel;
    }
    const result = { ...defaultLifeWheel };
    for (const key of WHEEL_KEYS) {
      const val = (raw as Record<string, number>)[key];
      if (typeof val === "number" && val >= 1 && val <= 10) {
        result[key] = val;
      }
    }
    return result;
  }, [quarterLifeWheel]);

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

  const handleWheelChange = (key: LifeWheelKey, value: number) => {
    const next = { ...wheelScores, [key]: value };
    void setQuarterLifeWheel(next);
  };

  const handleRescore = () => {
    setRescoreMode(true);
  };

  const handleRescoreDone = () => {
    setRescoreMode(false);
  };

  if (isLoading) {
    return (
      <section className="quarter-start">
        <div className="quarter-start__loading">
          <Spinner size="md" />
          <p>{t("planning.quarter.loading")}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="quarter-start">
        <Card variant="accent">
          <p className="quarter-start__error">{error}</p>
          <Button variant="secondary" onClick={() => void refreshPeriod("quarter")}>
            {t("common.retry")}
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="quarter-start" aria-label={t("planning.quarter.title")}>
      <header className="quarter-start__header">
        <h1>{t("planning.quarter.title")}</h1>
        <p>{t("planning.quarter.subtitle")}</p>
      </header>

      <div className="quarter-start__life-wheel">
        <div className="quarter-start__life-wheel-head">
          <h2>{t("planning.quarter.lifeWheel")}</h2>
          <div className="quarter-start__life-wheel-actions">
            {rescoreMode ? (
              <Button variant="secondary" onClick={handleRescoreDone}>
                {t("common.save")}
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleRescore}>
                {t("planning.quarter.rescore")}
              </Button>
            )}
          </div>
        </div>
        <LifeWheel
          values={wheelScores}
          labels={wheelLabels}
          onChange={rescoreMode ? handleWheelChange : undefined}
          readOnly={!rescoreMode}
          compact={!rescoreMode}
        />
      </div>

      <div className="quarter-start__goals">
        <h2>{t("planning.quarter.goals")}</h2>
        {!quarterGoals || quarterGoals.length === 0 ? (
          <p className="quarter-start__empty">{t("planning.quarter.empty")}</p>
        ) : (
          <div className="quarter-start__goal-list">
            {quarterGoals.map((goal: QuarterGoalPayload, index: number) => (
              <GoalProgressCard
                key={goal.id}
                title={goal.title}
                description={goal.smartDefinition}
                progress={goal.progress}
                onProgressChange={(progress) => void updateGoalProgress("quarter", index, progress)}
                readOnly={false}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function QuarterStart() {
  return (
    <I18nProvider>
      <QuarterStartContent />
    </I18nProvider>
  );
}
