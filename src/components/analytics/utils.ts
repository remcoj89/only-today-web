import { eachDayOfInterval, format, subDays } from "date-fns";
import type {
  AnalyticsPeriod,
  CalendarHeatmapPoint,
  CompletionChartPoint,
  DateRange,
  PomodoroChartPoint,
  PomodoroStats,
} from "./types";

function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function toFixedNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

function fromDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

function toPercentFromScore(score: number): number {
  const bounded = Math.max(0, Math.min(3, Number(score) || 0));
  return Math.round((bounded / 3) * 100);
}

export function getPeriodRange(period: AnalyticsPeriod, now = new Date()): DateRange {
  const end = toFixedNoon(now);
  const days = period === "7d" ? 6 : period === "30d" ? 29 : 89;
  const start = subDays(end, days);
  return {
    startDate: toDateKey(start),
    endDate: toDateKey(end),
  };
}

export function getYearsForRange(range: DateRange): number[] {
  const startYear = fromDateKey(range.startDate).getFullYear();
  const endYear = fromDateKey(range.endDate).getFullYear();
  if (startYear === endYear) {
    return [startYear];
  }

  const years: number[] = [];
  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year);
  }
  return years;
}

function formatTick(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function buildCompletionPoints(
  heatmap: CalendarHeatmapPoint[],
  range: DateRange,
  locale: string,
): CompletionChartPoint[] {
  const scoreMap = new Map(heatmap.map((point) => [point.date, point.completionScore]));
  return eachDayOfInterval({
    start: fromDateKey(range.startDate),
    end: fromDateKey(range.endDate),
  }).map((date) => {
    const dateKey = toDateKey(date);
    return {
      date: dateKey,
      label: formatTick(date, locale),
      value: toPercentFromScore(scoreMap.get(dateKey) ?? 0),
    };
  });
}

export function buildPomodoroPoints(stats: PomodoroStats, range: DateRange, locale: string): PomodoroChartPoint[] {
  const byDayMap = new Map(stats.byDay.map((point) => [point.date, point]));
  return eachDayOfInterval({
    start: fromDateKey(range.startDate),
    end: fromDateKey(range.endDate),
  }).map((date) => {
    const dateKey = toDateKey(date);
    const source = byDayMap.get(dateKey);
    return {
      date: dateKey,
      label: formatTick(date, locale),
      planned: source?.planned ?? 0,
      done: source?.done ?? 0,
    };
  });
}

export function averagePercentage(points: CompletionChartPoint[]): number {
  if (!points.length) {
    return 0;
  }
  const sum = points.reduce((acc, point) => acc + point.value, 0);
  return Math.round(sum / points.length);
}
