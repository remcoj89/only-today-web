import { apiFetch, type ApiError } from "@/lib/api";
import type { CalendarHeatmapPoint, CompletionRates, Correlations, DateRange, PomodoroStats, Streaks } from "./types";

type CompletionRatesResponse = {
  dayClosedRate: number;
  dayStartAdherence: number;
  dayCloseAdherence: number;
  lifePillarAdherence: CompletionRates["lifePillarAdherence"];
};

type PomodoroStatsResponse = {
  stats: PomodoroStats;
};

type StreaksResponse = {
  streaks: Streaks;
};

type CorrelationsResponse = {
  correlations: Correlations;
};

type HeatmapResponse = {
  data: CalendarHeatmapPoint[];
};

function asError(error: ApiError): Error {
  return new Error(error.message || "Er ging iets mis.");
}

function toRangeQuery(range: DateRange): string {
  return new URLSearchParams(range).toString();
}

export async function getCompletionRates(range: DateRange): Promise<CompletionRates> {
  const response = await apiFetch<CompletionRatesResponse>(`/analytics/completion-rates?${toRangeQuery(range)}`);
  if (!response.success) {
    throw asError(response);
  }
  return response.data;
}

export async function getPomodoroStats(range: DateRange): Promise<PomodoroStats> {
  const response = await apiFetch<PomodoroStatsResponse>(`/analytics/pomodoro-stats?${toRangeQuery(range)}`);
  if (!response.success) {
    throw asError(response);
  }
  return response.data.stats;
}

export async function getStreaks(): Promise<Streaks> {
  const response = await apiFetch<StreaksResponse>("/analytics/streaks");
  if (!response.success) {
    throw asError(response);
  }
  return response.data.streaks;
}

export async function getCorrelations(range: DateRange): Promise<Correlations> {
  const response = await apiFetch<CorrelationsResponse>(`/analytics/correlations?${toRangeQuery(range)}`);
  if (!response.success) {
    throw asError(response);
  }
  return response.data.correlations;
}

export async function getHeatmapForYear(year: number): Promise<CalendarHeatmapPoint[]> {
  const response = await apiFetch<HeatmapResponse>(`/analytics/calendar-heatmap?year=${year}`);
  if (!response.success) {
    throw asError(response);
  }
  return response.data.data;
}
