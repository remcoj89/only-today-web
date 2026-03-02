export type AnalyticsPeriod = "7d" | "30d" | "quarter";

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type CompletionRates = {
  dayClosedRate: number;
  dayStartAdherence: number;
  dayCloseAdherence: number;
  lifePillarAdherence: {
    training: number;
    deepRelaxation: number;
    healthyNutrition: number;
    realConnection: number;
  };
};

export type PomodoroStats = {
  totals: {
    planned: number;
    done: number;
  };
  byDay: Array<{
    date: string;
    planned: number;
    done: number;
  }>;
};

export type Streaks = {
  dayClosed: number;
  allPillars: number;
  perPillar: {
    training: number;
    deepRelaxation: number;
    healthyNutrition: number;
    realConnection: number;
  };
};

export type Correlations = {
  dayStartComplete: number;
  dayClosed: number;
  both: number;
  dayStartToClosedRate: number;
};

export type CalendarHeatmapPoint = {
  date: string;
  completionScore: number;
};

export type CompletionChartPoint = {
  date: string;
  label: string;
  value: number;
};

export type PomodoroChartPoint = {
  date: string;
  label: string;
  planned: number;
  done: number;
};

export type PillarMetric = {
  id: "training" | "deepRelaxation" | "healthyNutrition" | "realConnection";
  value: number;
};
