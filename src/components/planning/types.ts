export type PlanningPeriodType = "quarter" | "month" | "week";

export type WeekDayStatus = "done" | "open" | "missed";

export type LifeWheelKey =
  | "work"
  | "fun"
  | "social"
  | "giving"
  | "money"
  | "growth"
  | "health"
  | "love";

export type LifeWheelScores = Record<LifeWheelKey, number>;

export type PlanningGoalLink = {
  id: string;
  title: string;
  href?: string;
};

export type PlanningGoalViewModel = {
  id: string;
  title: string;
  description: string;
  progress: number;
  parentGoalId: string | null;
  linkedGoals: PlanningGoalLink[];
  weekDayStatuses?: WeekDayStatus[];
};

export type PlanningPeriodViewModel = {
  periodType: PlanningPeriodType;
  docKey: string;
  goals: PlanningGoalViewModel[];
};

export type QuarterGoalPayload = {
  id: string;
  title: string;
  smartDefinition: string;
  whatIsDifferent: string;
  consequencesIfNot: string;
  rewardIfAchieved: string;
  progress: number;
};

export type MonthGoalPayload = {
  id: string;
  title: string;
  description: string;
  linkedQuarterGoals: string[];
  progress: number;
};

export type WeekGoalPayload = {
  id: string;
  title: string;
  description: string;
  linkedMonthGoals: string[];
  progress: number;
  assignedDays?: number[];
};

export type QuarterContentPayload = {
  lifeWheel: Record<string, number>;
  quarterGoals: QuarterGoalPayload[];
};

export type MonthContentPayload = {
  monthlyGoals: MonthGoalPayload[];
};

export type WeekContentPayload = {
  weeklyGoals: WeekGoalPayload[];
};

export type PeriodDocumentPayload = QuarterContentPayload | MonthContentPayload | WeekContentPayload;
