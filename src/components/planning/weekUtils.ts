import { addDays, startOfWeek } from "date-fns";

/** Parse week key (e.g. "2025-W09") to get Monday's date (ISO week) */
export function getWeekStartFromKey(weekKey: string): Date {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekKey);
  if (!match) {
    return new Date();
  }
  const year = Number(match[1]);
  const week = Number(match[2]);
  const jan4 = new Date(year, 0, 4);
  const week1Monday = startOfWeek(jan4, { weekStartsOn: 1 });
  const monday = addDays(week1Monday, (week - 1) * 7);
  return monday;
}

/** Get the 7 dates (Mon-Sun) for a week key */
export function getWeekDates(weekKey: string): Date[] {
  const monday = getWeekStartFromKey(weekKey);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
