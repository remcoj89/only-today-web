export type DayStatus = "open" | "closed" | "auto_closed";

export type DayStartChecklistState = {
  sleptEightHours: boolean;
  drankWater: boolean;
  meditation: boolean;
  mobility: boolean;
};

export type MindsetState = {
  gratitude: string;
  intention: string;
};

export type TaskState = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  pomodorosPlanned: number;
  pomodorosDone: number;
};

export type OtherTaskState = {
  id: string;
  title: string;
  completed: boolean;
};

export type LifePillarItemState = {
  task: string;
  completed: boolean;
};

export type LifePillarsState = {
  training: LifePillarItemState;
  deepRelaxation: LifePillarItemState;
  healthyFood: LifePillarItemState;
  realConnection: LifePillarItemState;
};

export type DayCloseChecklistState = {
  noScreensBeforeSleep: boolean;
  noCarbsBeforeSleep: boolean;
  plannedTomorrow: boolean;
  reviewedGoals: boolean;
};

export type ReflectionState = {
  whatWentWell: string;
  whyWentWell: string;
  howToRepeat: string;
  whatWentWrong: string;
  whyWentWrong: string;
  whatToChangeNextTime: string;
};

export type DayCloseState = {
  checklist: DayCloseChecklistState;
  reflection: ReflectionState;
  closedAt: string | null;
};

export type DayPayload = {
  docVersion: number;
  dateKey: string;
  targetDateIso: string;
  status: DayStatus;
  dayStart: DayStartChecklistState;
  mindset: MindsetState;
  oneThing: TaskState;
  topThree: TaskState[];
  otherTasks: OtherTaskState[];
  lifePillars: LifePillarsState;
  dayClose: DayCloseState;
};

