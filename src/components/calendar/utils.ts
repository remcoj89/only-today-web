import {
  addDays,
  differenceInCalendarWeeks,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type {
  CalendarDayStatus,
  CalendarHeatmapApiPoint,
  CalendarHeatmapCell,
  CalendarHeatmapPoint,
  CalendarMonthCell,
  CalendarMonthStatusMap,
} from "./types";

const WEEK_STARTS_ON = 1 as const;
const MAX_COMPLETENESS_SCORE = 3;
const DAYS_IN_WEEK = 7;

export function normalizeCompletionScore(rawScore: number): number {
  const bounded = Math.max(0, Math.min(MAX_COMPLETENESS_SCORE, Number(rawScore) || 0));
  return Math.round((bounded / MAX_COMPLETENESS_SCORE) * 100);
}

export function getHeatmapIntensityLevel(normalizedScore: number): 0 | 1 | 2 | 3 {
  if (normalizedScore <= 0) {
    return 0;
  }
  if (normalizedScore <= 33) {
    return 1;
  }
  if (normalizedScore <= 66) {
    return 2;
  }
  return 3;
}

export function toHeatmapPoints(points: CalendarHeatmapApiPoint[]): CalendarHeatmapPoint[] {
  return points.map((point) => ({
    date: point.date,
    rawScore: Math.max(0, Math.min(MAX_COMPLETENESS_SCORE, Number(point.completionScore) || 0)),
    normalizedScore: normalizeCompletionScore(point.completionScore),
  }));
}

function toIsoDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function toMondayIndex(date: Date): number {
  return (date.getDay() + 6) % DAYS_IN_WEEK;
}

export function buildHeatmapGrid(year: number, points: CalendarHeatmapPoint[]): CalendarHeatmapCell[][] {
  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);
  const intervalStart = startOfWeek(firstDay, { weekStartsOn: WEEK_STARTS_ON });
  const intervalEnd = endOfWeek(lastDay, { weekStartsOn: WEEK_STARTS_ON });

  const pointMap = new Map(points.map((point) => [point.date, point]));
  const columns: CalendarHeatmapCell[][] = [];

  for (let cursor = intervalStart; cursor <= intervalEnd; cursor = addDays(cursor, 1)) {
    const dateKey = toIsoDateKey(cursor);
    const weekIndex = differenceInCalendarWeeks(cursor, intervalStart, { weekStartsOn: WEEK_STARTS_ON });
    const dayIndex = toMondayIndex(cursor);
    const point = pointMap.get(dateKey) ?? null;
    const normalizedScore = point?.normalizedScore ?? 0;

    if (!columns[weekIndex]) {
      columns[weekIndex] = [];
    }

    columns[weekIndex][dayIndex] = {
      date: dateKey,
      dayIndex,
      weekIndex,
      monthIndex: cursor.getMonth(),
      isInYear: cursor.getFullYear() === year,
      point,
      normalizedScore,
      intensityLevel: getHeatmapIntensityLevel(normalizedScore),
    };
  }

  return columns;
}

export function getHeatmapMonthLabels(year: number): Array<{ monthIndex: number; weekIndex: number }> {
  const firstDay = new Date(year, 0, 1);
  const intervalStart = startOfWeek(firstDay, { weekStartsOn: WEEK_STARTS_ON });

  return eachMonthOfInterval({
    start: firstDay,
    end: new Date(year, 11, 31),
  }).map((date) => ({
    monthIndex: date.getMonth(),
    weekIndex: differenceInCalendarWeeks(date, intervalStart, { weekStartsOn: WEEK_STARTS_ON }),
  }));
}

export function buildMonthGrid(monthDate: Date, statusMap: CalendarMonthStatusMap): CalendarMonthCell[][] {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON });

  const rows: CalendarMonthCell[][] = [];
  let week: CalendarMonthCell[] = [];

  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    const dateKey = toIsoDateKey(cursor);
    const isCurrentMonth = cursor.getMonth() === monthDate.getMonth();
    const status: CalendarDayStatus = isCurrentMonth ? (statusMap[dateKey] ?? "empty") : "empty";
    week.push({
      date: dateKey,
      dayOfMonth: cursor.getDate(),
      isCurrentMonth,
      status,
    });

    if (week.length === DAYS_IN_WEEK) {
      rows.push(week);
      week = [];
    }
  }

  return rows;
}
