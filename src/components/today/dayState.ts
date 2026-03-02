import { apiContentToDayPayload } from "@/lib/dayPayloadToApi";
import type { DayPayload, DayStatus, LifePillarsState, TaskState } from "./types";

function createDefaultTask(id: string): TaskState {
  return {
    id,
    title: "",
    description: "",
    completed: false,
    pomodorosPlanned: 0,
    pomodorosDone: 0,
  };
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toDateAtLocalNoon(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map((value) => Number(value));
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0, 0);
}

export function resolveStatus(dateKey: string, currentStatus: DayStatus): DayStatus {
  if (currentStatus !== "open") {
    return currentStatus;
  }

  const dayDate = toDateAtLocalNoon(dateKey).getTime();
  const now = Date.now();
  const hours48 = 48 * 60 * 60 * 1_000;
  if (now - dayDate > hours48) {
    return "auto_closed";
  }
  return "open";
}

export function createDefaultDayPayload(dateKey: string): DayPayload {
  const status = resolveStatus(dateKey, "open");
  return {
    docVersion: 1,
    dateKey,
    targetDateIso: toDateAtLocalNoon(dateKey).toISOString(),
    status,
    dayStart: {
      sleptEightHours: false,
      drankWater: false,
      meditation: false,
      mobility: false,
    },
    mindset: {
      gratitude: "",
      intention: "",
    },
    oneThing: createDefaultTask("one"),
    topThree: [createDefaultTask("three-1"), createDefaultTask("three-2"), createDefaultTask("three-3")],
    otherTasks: [],
    lifePillars: {
      training: { task: "", completed: false },
      deepRelaxation: { task: "", completed: false },
      healthyFood: { task: "", completed: false },
      realConnection: { task: "", completed: false },
    },
    dayClose: {
      checklist: {
        noScreensBeforeSleep: false,
        noCarbsBeforeSleep: false,
        plannedTomorrow: false,
        reviewedGoals: false,
      },
      reflection: {
        whatWentWell: "",
        whyWentWell: "",
        howToRepeat: "",
        whatWentWrong: "",
        whyWentWrong: "",
        whatToChangeNextTime: "",
      },
      closedAt: null,
    },
  };
}

function normalizeTask(task: Partial<TaskState> | undefined, fallbackId: string): TaskState {
  return {
    id: typeof task?.id === "string" ? task.id : fallbackId,
    title: typeof task?.title === "string" ? task.title : "",
    description: typeof task?.description === "string" ? task.description : "",
    completed: Boolean(task?.completed),
    pomodorosPlanned: Number.isFinite(task?.pomodorosPlanned) ? Math.max(0, Math.min(6, Number(task?.pomodorosPlanned))) : 0,
    pomodorosDone: Number.isFinite(task?.pomodorosDone) ? Math.max(0, Math.min(6, Number(task?.pomodorosDone))) : 0,
  };
}

function isApiFormat(input: unknown): boolean {
  const raw = input as Record<string, unknown>;
  const dayStart = raw?.dayStart as Record<string, unknown> | undefined;
  return typeof dayStart?.slept8Hours === "boolean";
}

function normalizePillarValue(
  value: unknown,
  fallback: LifePillarsState["training"]
): LifePillarsState["training"] {
  if (value && typeof value === "object" && "task" in value && "completed" in value) {
    return {
      task: typeof (value as { task: unknown }).task === "string" ? (value as { task: string }).task : "",
      completed: Boolean((value as { completed: unknown }).completed),
    };
  }
  if (typeof value === "boolean") {
    return { task: "", completed: value };
  }
  return fallback;
}

const defaultPillar = { task: "", completed: false } as const;

function normalizeLifePillars(raw: unknown): LifePillarsState {
  const fallback: LifePillarsState = {
    training: { ...defaultPillar },
    deepRelaxation: { ...defaultPillar },
    healthyFood: { ...defaultPillar },
    realConnection: { ...defaultPillar },
  };
  if (!raw || typeof raw !== "object") return fallback;
  const obj = raw as Record<string, unknown>;
  return {
    training: normalizePillarValue(obj.training, fallback.training),
    deepRelaxation: normalizePillarValue(obj.deepRelaxation, fallback.deepRelaxation),
    healthyFood: normalizePillarValue(obj.healthyFood ?? obj.healthyNutrition, fallback.healthyFood),
    realConnection: normalizePillarValue(obj.realConnection, fallback.realConnection),
  };
}

export function normalizeDayPayload(input: unknown, dateKey: string): DayPayload {
  const fallback = createDefaultDayPayload(dateKey);
  if (!input || typeof input !== "object") {
    return fallback;
  }
  if (isApiFormat(input)) {
    return apiContentToDayPayload(input, dateKey) as DayPayload;
  }
  const raw = input as Partial<DayPayload>;
  const status = resolveStatus(dateKey, raw.status === "closed" || raw.status === "auto_closed" ? raw.status : "open");

  const topThreeRaw = Array.isArray(raw.topThree) ? raw.topThree : [];
  const topThree = [0, 1, 2].map((index) => normalizeTask(topThreeRaw[index], `three-${index + 1}`));

  return {
    docVersion: typeof raw.docVersion === "number" ? raw.docVersion : fallback.docVersion,
    dateKey,
    targetDateIso: typeof raw.targetDateIso === "string" ? raw.targetDateIso : fallback.targetDateIso,
    status,
    dayStart: {
      sleptEightHours: Boolean(raw.dayStart?.sleptEightHours),
      drankWater: Boolean(raw.dayStart?.drankWater),
      meditation: Boolean(raw.dayStart?.meditation),
      mobility: Boolean(raw.dayStart?.mobility),
    },
    mindset: {
      gratitude: typeof raw.mindset?.gratitude === "string" ? raw.mindset.gratitude : "",
      intention: typeof raw.mindset?.intention === "string" ? raw.mindset.intention : "",
    },
    oneThing: normalizeTask(raw.oneThing, "one"),
    topThree,
    otherTasks: Array.isArray(raw.otherTasks)
      ? raw.otherTasks
          .filter((item) => item && typeof item === "object")
          .map((item, index) => {
            const typed = item as { id?: unknown; title?: unknown; completed?: unknown };
            return {
              id: typeof typed.id === "string" ? typed.id : `other-${index}-${Date.now()}`,
              title: typeof typed.title === "string" ? typed.title : "",
              completed: Boolean(typed.completed),
            };
          })
      : [],
    lifePillars: normalizeLifePillars(raw.lifePillars),
    dayClose: {
      checklist: {
        noScreensBeforeSleep: Boolean(raw.dayClose?.checklist?.noScreensBeforeSleep),
        noCarbsBeforeSleep: Boolean(raw.dayClose?.checklist?.noCarbsBeforeSleep),
        plannedTomorrow: Boolean(raw.dayClose?.checklist?.plannedTomorrow),
        reviewedGoals: Boolean(raw.dayClose?.checklist?.reviewedGoals),
      },
      reflection: {
        whatWentWell: typeof raw.dayClose?.reflection?.whatWentWell === "string" ? raw.dayClose.reflection.whatWentWell : "",
        whyWentWell: typeof raw.dayClose?.reflection?.whyWentWell === "string" ? raw.dayClose.reflection.whyWentWell : "",
        howToRepeat: typeof raw.dayClose?.reflection?.howToRepeat === "string" ? raw.dayClose.reflection.howToRepeat : "",
        whatWentWrong:
          typeof raw.dayClose?.reflection?.whatWentWrong === "string" ? raw.dayClose.reflection.whatWentWrong : "",
        whyWentWrong: typeof raw.dayClose?.reflection?.whyWentWrong === "string" ? raw.dayClose.reflection.whyWentWrong : "",
        whatToChangeNextTime:
          typeof raw.dayClose?.reflection?.whatToChangeNextTime === "string"
            ? raw.dayClose.reflection.whatToChangeNextTime
            : "",
      },
      closedAt: typeof raw.dayClose?.closedAt === "string" ? raw.dayClose.closedAt : null,
    },
  };
}

export function canCloseDay(payload: DayPayload): boolean {
  const oneValid =
    payload.oneThing.title.trim().length > 0 && payload.oneThing.completed;
  const threeValid =
    payload.topThree.every((task) => task.title.trim().length > 0 && task.completed);
  return oneValid && threeValid;
}

