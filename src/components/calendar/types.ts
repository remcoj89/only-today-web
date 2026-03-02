export type CalendarViewMode = "heatmap" | "month";

export type CalendarDayStatus = "open" | "closed" | "auto_closed" | "empty";

export type CalendarHeatmapApiPoint = {
  date: string;
  completionScore: number;
};

export type CalendarHeatmapPoint = {
  date: string;
  rawScore: number;
  normalizedScore: number;
};

export type CalendarHeatmapCell = {
  date: string;
  dayIndex: number;
  weekIndex: number;
  monthIndex: number;
  isInYear: boolean;
  point: CalendarHeatmapPoint | null;
  normalizedScore: number;
  intensityLevel: 0 | 1 | 2 | 3;
};

export type CalendarMonthCell = {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  status: CalendarDayStatus;
};

export type CalendarMonthStatusMap = Record<string, CalendarDayStatus>;
