import { useCallback, useEffect, useMemo, useState } from "react";
import { I18nProvider } from "@/context/I18nContext";
import { Button, Card, Skeleton, Spinner } from "@/components/ui";
import { useTranslation } from "@/i18n/useTranslation";
import { getCompletionRates, getCorrelations, getHeatmapForYear, getPomodoroStats, getStreaks } from "./api";
import { CompletionChart } from "./CompletionChart";
import { CorrelationInsight } from "./CorrelationInsight";
import { PillarAdherence } from "./PillarAdherence";
import { PomodoroChart } from "./PomodoroChart";
import { StreakDisplay } from "./StreakDisplay";
import type { AnalyticsPeriod, CalendarHeatmapPoint, Correlations, CompletionRates, PomodoroStats, Streaks } from "./types";
import { averagePercentage, buildCompletionPoints, buildPomodoroPoints, getPeriodRange, getYearsForRange } from "./utils";
import "./AnalyticsDashboard.css";

type AnalyticsData = {
  completionRates: CompletionRates;
  pomodoroStats: PomodoroStats;
  streaks: Streaks;
  correlations: Correlations;
  heatmap: CalendarHeatmapPoint[];
};

const PERIODS: AnalyticsPeriod[] = ["7d", "30d", "quarter"];

const EMPTY_STREAKS: Streaks = {
  dayClosed: 0,
  allPillars: 0,
  perPillar: {
    training: 0,
    deepRelaxation: 0,
    healthyNutrition: 0,
    realConnection: 0,
  },
};

const EMPTY_CORRELATIONS: Correlations = {
  dayStartComplete: 0,
  dayClosed: 0,
  both: 0,
  dayStartToClosedRate: 0,
};

async function loadAnalyticsData(period: AnalyticsPeriod): Promise<AnalyticsData> {
  const range = getPeriodRange(period);
  const years = getYearsForRange(range);

  const [completionRates, pomodoroStats, streaks, correlations, heatmapParts] = await Promise.all([
    getCompletionRates(range),
    getPomodoroStats(range),
    getStreaks(),
    getCorrelations(range),
    Promise.all(years.map((year) => getHeatmapForYear(year))),
  ]);

  return {
    completionRates,
    pomodoroStats,
    streaks,
    correlations,
    heatmap: heatmapParts.flat().filter((point) => point.date >= range.startDate && point.date <= range.endDate),
  };
}

function AnalyticsDashboardContent() {
  const { t, locale } = useTranslation();
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const loadData = useCallback(
    async (nextState: "initial" | "refresh" = "initial", nextPeriod = period) => {
      if (nextState === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      try {
        const response = await loadAnalyticsData(nextPeriod);
        setData(response);
      } catch (err) {
        const message = err instanceof Error && err.message ? err.message : "Analytics laden mislukt.";
        setError(message);
        setData(null);
      } finally {
        if (nextState === "initial") {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [period],
  );

  useEffect(() => {
    void loadData("initial", period);
  }, [period, loadData]);

  const range = useMemo(() => getPeriodRange(period), [period]);
  const completionPoints = useMemo(
    () => buildCompletionPoints(data?.heatmap ?? [], range, locale),
    [data?.heatmap, range, locale],
  );
  const pomodoroPoints = useMemo(
    () => buildPomodoroPoints(data?.pomodoroStats ?? { totals: { planned: 0, done: 0 }, byDay: [] }, range, locale),
    [data?.pomodoroStats, range, locale],
  );

  const hasAnyData = useMemo(() => {
    if (!data) {
      return false;
    }

    return (
      completionPoints.some((point) => point.value > 0) ||
      pomodoroPoints.some((point) => point.planned > 0 || point.done > 0) ||
      data.streaks.dayClosed > 0 ||
      data.streaks.allPillars > 0 ||
      data.correlations.dayStartComplete > 0
    );
  }, [data, completionPoints, pomodoroPoints]);

  return (
    <section className="analytics-dashboard" aria-label={t("analytics.page.ariaLabel")}>
      <header className="analytics-dashboard__header">
        <div>
          <h1>{t("analytics.page.title")}</h1>
          <p>{t("analytics.page.subtitle")}</p>
        </div>
        <Button variant="secondary" onClick={() => void loadData("refresh")} loading={refreshing}>
          {t("analytics.page.refresh")}
        </Button>
      </header>

      <div className="analytics-dashboard__periods" role="tablist" aria-label={t("analytics.period.ariaLabel")}>
        {PERIODS.map((value) => (
          <Button
            key={value}
            variant={period === value ? "primary" : "secondary"}
            role="tab"
            aria-selected={period === value}
            onClick={() => setPeriod(value)}
          >
            {t(`analytics.period.${value}`)}
          </Button>
        ))}
      </div>

      {loading ? (
        <Card className="analytics-dashboard__state-card">
          <Spinner size="md" label={t("analytics.page.loading")} />
          <Skeleton lines={3} />
        </Card>
      ) : null}

      {!loading && error ? (
        <Card className="analytics-dashboard__state-card" variant="accent">
          <p>{error}</p>
          <Button variant="secondary" onClick={() => void loadData("initial")}>
            {t("common.retry")}
          </Button>
        </Card>
      ) : null}

      {!loading && !error && !hasAnyData ? (
        <Card className="analytics-dashboard__state-card">
          <p>{t("analytics.page.empty")}</p>
        </Card>
      ) : null}

      {!loading && !error && hasAnyData ? (
        <div className="analytics-dashboard__grid">
          <CompletionChart
            title={t("analytics.cards.completion.title")}
            subtitle={t("analytics.cards.completion.subtitle")}
            emptyTitle={t("analytics.cards.emptyTitle")}
            emptyDescription={t("analytics.cards.emptyDescription")}
            points={completionPoints}
          />

          <Card className="analytics-dashboard__adherence" as="article">
            <h2>{t("analytics.cards.dayStart.title")}</h2>
            <strong>{Math.round((data?.completionRates.dayStartAdherence ?? 0) * 100)}%</strong>
            <p>{t("analytics.cards.dayStart.subtitle")}</p>
            <div className="analytics-dashboard__adherence-meta">
              <span>
                {t("analytics.cards.dayClose.label")}: {Math.round((data?.completionRates.dayCloseAdherence ?? 0) * 100)}%
              </span>
              <span>
                {t("analytics.cards.completionAverage.label")}: {averagePercentage(completionPoints)}%
              </span>
            </div>
          </Card>

          <PillarAdherence
            title={t("analytics.cards.pillars.title")}
            subtitle={t("analytics.cards.pillars.subtitle")}
            emptyTitle={t("analytics.cards.emptyTitle")}
            emptyDescription={t("analytics.cards.emptyDescription")}
            labels={{
              training: t("analytics.pillars.training"),
              deepRelaxation: t("analytics.pillars.deepRelaxation"),
              healthyNutrition: t("analytics.pillars.healthyNutrition"),
              realConnection: t("analytics.pillars.realConnection"),
            }}
            metrics={[
              { id: "training", value: data?.completionRates.lifePillarAdherence.training ?? 0 },
              { id: "deepRelaxation", value: data?.completionRates.lifePillarAdherence.deepRelaxation ?? 0 },
              { id: "healthyNutrition", value: data?.completionRates.lifePillarAdherence.healthyNutrition ?? 0 },
              { id: "realConnection", value: data?.completionRates.lifePillarAdherence.realConnection ?? 0 },
            ]}
          />

          <PomodoroChart
            title={t("analytics.cards.pomodoro.title")}
            subtitle={t("analytics.cards.pomodoro.subtitle")}
            plannedLabel={t("analytics.cards.pomodoro.planned")}
            doneLabel={t("analytics.cards.pomodoro.done")}
            emptyTitle={t("analytics.cards.emptyTitle")}
            emptyDescription={t("analytics.cards.emptyDescription")}
            points={pomodoroPoints}
          />

          <StreakDisplay
            title={t("analytics.cards.streaks.title")}
            dayClosedLabel={t("analytics.cards.streaks.dayClosed")}
            allPillarsLabel={t("analytics.cards.streaks.allPillars")}
            perPillarTitle={t("analytics.cards.streaks.perPillar")}
            dayUnit={t("analytics.cards.streaks.days")}
            pillarLabels={{
              training: t("analytics.pillars.training"),
              deepRelaxation: t("analytics.pillars.deepRelaxation"),
              healthyNutrition: t("analytics.pillars.healthyNutrition"),
              realConnection: t("analytics.pillars.realConnection"),
            }}
            streaks={data?.streaks ?? EMPTY_STREAKS}
          />

          <CorrelationInsight
            title={t("analytics.cards.correlation.title")}
            subtitle={t("analytics.cards.correlation.subtitle")}
            emptyTitle={t("analytics.cards.emptyTitle")}
            emptyDescription={t("analytics.cards.emptyDescription")}
            insightTemplate={t("analytics.cards.correlation.insight")}
            startMetricLabel={t("analytics.cards.correlation.startMetric")}
            endMetricLabel={t("analytics.cards.correlation.endMetric")}
            data={data?.correlations ?? EMPTY_CORRELATIONS}
          />
        </div>
      ) : null}
    </section>
  );
}

export function AnalyticsDashboard() {
  return (
    <I18nProvider>
      <AnalyticsDashboardContent />
    </I18nProvider>
  );
}
