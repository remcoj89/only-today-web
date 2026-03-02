import type { PartnerStatusViewModel, PartnerSummaryDay } from "./types";

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Returns today's date key (YYYY-MM-DD) in the given timezone. */
export function toDateKeyInTimezone(timezone: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
}

export function offsetDate(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12, 0, 0, 0);
}

export function toPartnerStatus(
  summaryDays: PartnerSummaryDay[],
  todayDateKey: string,
  partnerTodayDateKey?: string | null
): PartnerStatusViewModel {
  const lookupKey = partnerTodayDateKey ?? todayDateKey;
  const today = summaryDays.find((entry) => entry.date === lookupKey);
  const sorted = [...summaryDays].sort((a, b) => a.date.localeCompare(b.date));
  const mostRecent = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const day = today ?? mostRecent;
  return {
    dayClosed: day ? day.dayClosed : null,
    oneDone: day ? day.oneThingDone : null,
    reflectionDone: day ? day.reflectionPresent : null,
    streak: computeClosedDayStreak(summaryDays),
  };
}

function computeClosedDayStreak(summaryDays: PartnerSummaryDay[]): number {
  const sorted = [...summaryDays].sort((a, b) => a.date.localeCompare(b.date));
  let streak = 0;
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    if (sorted[index]?.dayClosed) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
