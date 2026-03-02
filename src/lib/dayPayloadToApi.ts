const LIFE_WHEEL_KEYS = ["work", "fun", "social", "giving", "money", "growth", "health", "love"] as const;

function ensureNonEmpty(s: unknown): string {
  if (typeof s === "string" && s.trim().length > 0) return s.trim();
  return "-";
}

/**
 * Transforms period document payloads (quarter, week, month) to API format.
 * API schemas require specific structure (e.g. lifeWheel 1-10, quarterGoals length 3).
 */
export function periodPayloadToApiContent(
  docType: string,
  payload: unknown,
): Record<string, unknown> {
  const raw = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;

  if (docType === "quarter") {
    const lifeWheelRaw = (raw.lifeWheel && typeof raw.lifeWheel === "object"
      ? raw.lifeWheel
      : {}) as Record<string, number>;
    const lifeWheel: Record<string, number> = {};
    for (const key of LIFE_WHEEL_KEYS) {
      const v = lifeWheelRaw[key];
      const n = Number.isFinite(v) ? Math.max(1, Math.min(10, Math.round(Number(v)))) : 5;
      lifeWheel[key] = n;
    }

    const goalsRaw = (Array.isArray(raw.quarterGoals) ? raw.quarterGoals : []) as unknown[];
    const quarterGoals = [0, 1, 2].map((i) => {
      const g = (goalsRaw[i] && typeof goalsRaw[i] === "object" ? goalsRaw[i] : {}) as Record<string, unknown>;
      return {
        id: ensureNonEmpty(g.id) || `q-${i}`,
        title: ensureNonEmpty(g.title),
        smartDefinition: ensureNonEmpty(g.smartDefinition),
        whatIsDifferent: ensureNonEmpty(g.whatIsDifferent),
        consequencesIfNot: ensureNonEmpty(g.consequencesIfNot),
        rewardIfAchieved: ensureNonEmpty(g.rewardIfAchieved),
        progress: Number.isFinite(g.progress) ? Math.max(0, Math.min(100, Math.round(Number(g.progress)))) : 0,
      };
    });

    return { lifeWheel, quarterGoals };
  }

  if (docType === "week") {
    const goalsRaw = (Array.isArray(raw.weeklyGoals) ? raw.weeklyGoals : []) as unknown[];
    const weeklyGoals = goalsRaw.map((g, i) => {
      const item = (g && typeof g === "object" ? g : {}) as Record<string, unknown>;
      const linkedMonthGoals = Array.isArray(item.linkedMonthGoals)
        ? item.linkedMonthGoals
            .map((x) => (typeof x === "string" ? x.trim() : ""))
            .filter((x): x is string => x.length > 0)
        : [];
      const assignedDays = Array.isArray(item.assignedDays)
        ? item.assignedDays.filter((d): d is number => typeof d === "number" && d >= 0 && d <= 6)
        : [];
      return {
        id: ensureNonEmpty(item.id) || `w-${i}`,
        title: ensureNonEmpty(item.title),
        description: typeof item.description === "string" ? item.description : "",
        linkedMonthGoals,
        progress: Number.isFinite(item.progress) ? Math.max(0, Math.min(100, Math.round(Number(item.progress)))) : 0,
        assignedDays,
      };
    });
    return { weeklyGoals };
  }

  if (docType === "month") {
    const goalsRaw = (Array.isArray(raw.monthlyGoals) ? raw.monthlyGoals : []) as unknown[];
    const monthlyGoals = goalsRaw.map((g, i) => {
      const item = (g && typeof g === "object" ? g : {}) as Record<string, unknown>;
      const linkedQuarterGoals = Array.isArray(item.linkedQuarterGoals)
        ? item.linkedQuarterGoals
            .map((x) => (typeof x === "string" ? x.trim() : ""))
            .filter((x): x is string => x.length > 0)
        : [];
      return {
        id: ensureNonEmpty(item.id) || `m-${i}`,
        title: ensureNonEmpty(item.title),
        description: typeof item.description === "string" ? item.description : "",
        linkedQuarterGoals,
        progress: Number.isFinite(item.progress) ? Math.max(0, Math.min(100, Math.round(Number(item.progress)))) : 0,
      };
    });
    return { monthlyGoals };
  }

  return raw;
}

/**
 * Transforms frontend DayPayload format to API DayContent format.
 * The frontend uses different field names and structure than the API schema.
 */
export function dayPayloadToApiContent(payload: unknown): Record<string, unknown> {
  if (isApiFormat(payload)) {
    return payload as Record<string, unknown>;
  }
  const raw = payload as Record<string, unknown>;
  const dayStart = raw.dayStart as Record<string, unknown> | undefined;
  const mindset = raw.mindset as Record<string, unknown> | undefined;
  const oneThing = raw.oneThing as Record<string, unknown> | undefined;
  const topThree = (raw.topThree as unknown[]) ?? [];
  const otherTasks = (raw.otherTasks as unknown[]) ?? [];
  const lifePillars = raw.lifePillars as Record<string, unknown> | undefined;
  const dayClose = raw.dayClose as Record<string, unknown> | undefined;
  const checklist = dayClose?.checklist as Record<string, unknown> | undefined;
  const reflection = dayClose?.reflection as Record<string, unknown> | undefined;

  const toTask = (t: unknown): Record<string, unknown> => {
    const task = (t as Record<string, unknown>) ?? {};
    return {
      title: typeof task.title === "string" ? task.title : "",
      description: typeof task.description === "string" ? task.description : "",
      pomodorosPlanned: Number.isFinite(task.pomodorosPlanned) ? Math.max(0, Math.min(6, Number(task.pomodorosPlanned))) : 0,
      pomodorosDone: Number.isFinite(task.pomodorosDone) ? Math.max(0, Math.min(6, Number(task.pomodorosDone))) : 0,
    };
  };

  const toPillarItem = (p: unknown): { task: string; completed: boolean } => {
    if (p && typeof p === "object" && "task" in p && "completed" in p) {
      return {
        task: typeof (p as { task: unknown }).task === "string" ? (p as { task: string }).task : "",
        completed: Boolean((p as { completed: unknown }).completed),
      };
    }
    if (typeof p === "boolean") {
      return { task: "", completed: p };
    }
    return { task: "", completed: false };
  };

  const toOtherTask = (t: unknown): Record<string, unknown> => {
    const task = (t as Record<string, unknown>) ?? {};
    return {
      title: typeof task.title === "string" ? task.title : "",
      description: typeof task.description === "string" ? task.description : undefined,
      pomodorosPlanned: undefined,
      pomodorosDone: undefined,
    };
  };

  return {
    dayStart: {
      slept8Hours: Boolean(dayStart?.sleptEightHours),
      water3Glasses: Boolean(dayStart?.drankWater),
      meditation5Min: Boolean(dayStart?.meditation),
      mobility5Min: Boolean(dayStart?.mobility),
      gratefulFor: typeof mindset?.gratitude === "string" ? mindset.gratitude : "",
      intentionForDay: typeof mindset?.intention === "string" ? mindset.intention : "",
    },
    planning: {
      oneThing: toTask(oneThing),
      topThree: [0, 1, 2].map((i) => toTask(topThree[i])),
      otherTasks: otherTasks.map(toOtherTask),
    },
    lifePillars: {
      training: toPillarItem(lifePillars?.training),
      deepRelaxation: toPillarItem(lifePillars?.deepRelaxation),
      healthyNutrition: toPillarItem(lifePillars?.healthyFood),
      realConnection: toPillarItem(lifePillars?.realConnection),
    },
    dayClose: {
      noScreens2Hours: Boolean(checklist?.noScreensBeforeSleep),
      noCarbs3Hours: Boolean(checklist?.noCarbsBeforeSleep),
      tomorrowPlanned: Boolean(checklist?.plannedTomorrow),
      goalsReviewed: Boolean(checklist?.reviewedGoals),
      reflection: {
        wentWell: typeof reflection?.whatWentWell === "string" ? reflection.whatWentWell : "",
        whyWentWell: typeof reflection?.whyWentWell === "string" ? reflection.whyWentWell : "",
        repeatInFuture: typeof reflection?.howToRepeat === "string" ? reflection.howToRepeat : "",
        wentWrong: typeof reflection?.whatWentWrong === "string" ? reflection.whatWentWrong : "",
        whyWentWrong: typeof reflection?.whyWentWrong === "string" ? reflection.whyWentWrong : "",
        doDifferently: typeof reflection?.whatToChangeNextTime === "string" ? reflection.whatToChangeNextTime : "",
      },
    },
  };
}

function isApiFormat(payload: unknown): boolean {
  const raw = payload as Record<string, unknown>;
  const dayStart = raw?.dayStart as Record<string, unknown> | undefined;
  return typeof dayStart?.slept8Hours === "boolean";
}

/**
 * Transforms API DayContent format to frontend DayPayload format.
 * Used when receiving documents from the server (e.g. conflict resolution).
 */
export function apiContentToDayPayload(
  content: unknown,
  dateKey: string,
  targetDateIso?: string,
): Record<string, unknown> {
  const raw = content as Record<string, unknown>;
  if (!isApiFormat(raw)) {
    return raw as Record<string, unknown>;
  }
  const dayStart = raw.dayStart as Record<string, unknown>;
  const planning = raw.planning as Record<string, unknown>;
  const oneThing = planning?.oneThing as Record<string, unknown>;
  const topThree = (planning?.topThree as unknown[]) ?? [];
  const otherTasks = (planning?.otherTasks as unknown[]) ?? [];
  const lifePillars = raw.lifePillars as Record<string, unknown>;
  const dayClose = raw.dayClose as Record<string, unknown>;
  const reflection = dayClose?.reflection as Record<string, unknown>;

  const toTask = (t: unknown): Record<string, unknown> => {
    const task = (t as Record<string, unknown>) ?? {};
    return {
      id: typeof task.id === "string" ? task.id : `task-${Date.now()}`,
      title: typeof task.title === "string" ? task.title : "",
      description: typeof task.description === "string" ? task.description : "",
      completed: Boolean(task.completed),
      pomodorosPlanned: Number.isFinite(task.pomodorosPlanned) ? Number(task.pomodorosPlanned) : 0,
      pomodorosDone: Number.isFinite(task.pomodorosDone) ? Number(task.pomodorosDone) : 0,
    };
  };

  const toPillarItemPayload = (p: unknown): { task: string; completed: boolean } => {
    if (p && typeof p === "object" && "task" in p && "completed" in p) {
      return {
        task: typeof (p as { task: unknown }).task === "string" ? (p as { task: string }).task : "",
        completed: Boolean((p as { completed: unknown }).completed),
      };
    }
    if (typeof p === "boolean") {
      return { task: "", completed: p };
    }
    return { task: "", completed: false };
  };

  const toOtherTask = (t: unknown): Record<string, unknown> => {
    const task = (t as Record<string, unknown>) ?? {};
    return {
      id: typeof task.id === "string" ? task.id : `other-${Date.now()}`,
      title: typeof task.title === "string" ? task.title : "",
      completed: Boolean(task.completed),
    };
  };

  return {
    docVersion: 1,
    dateKey,
    targetDateIso: targetDateIso ?? new Date(dateKey + "T12:00:00").toISOString(),
    status: "open",
    dayStart: {
      sleptEightHours: Boolean(dayStart?.slept8Hours),
      drankWater: Boolean(dayStart?.water3Glasses),
      meditation: Boolean(dayStart?.meditation5Min),
      mobility: Boolean(dayStart?.mobility5Min),
    },
    mindset: {
      gratitude: typeof dayStart?.gratefulFor === "string" ? dayStart.gratefulFor : "",
      intention: typeof dayStart?.intentionForDay === "string" ? dayStart.intentionForDay : "",
    },
    oneThing: toTask(oneThing),
    topThree: [0, 1, 2].map((i) => toTask(topThree[i])),
    otherTasks: otherTasks.map(toOtherTask),
    lifePillars: {
      training: toPillarItemPayload(lifePillars?.training),
      deepRelaxation: toPillarItemPayload(lifePillars?.deepRelaxation),
      healthyFood: toPillarItemPayload(lifePillars?.healthyNutrition),
      realConnection: toPillarItemPayload(lifePillars?.realConnection),
    },
    dayClose: {
      checklist: {
        noScreensBeforeSleep: Boolean(dayClose?.noScreens2Hours),
        noCarbsBeforeSleep: Boolean(dayClose?.noCarbs3Hours),
        plannedTomorrow: Boolean(dayClose?.tomorrowPlanned),
        reviewedGoals: Boolean(dayClose?.goalsReviewed),
      },
      reflection: {
        whatWentWell: typeof reflection?.wentWell === "string" ? reflection.wentWell : "",
        whyWentWell: typeof reflection?.whyWentWell === "string" ? reflection.whyWentWell : "",
        howToRepeat: typeof reflection?.repeatInFuture === "string" ? reflection.repeatInFuture : "",
        whatWentWrong: typeof reflection?.wentWrong === "string" ? reflection.wentWrong : "",
        whyWentWrong: typeof reflection?.whyWentWrong === "string" ? reflection.whyWentWrong : "",
        whatToChangeNextTime: typeof reflection?.doDifferently === "string" ? reflection.doDifferently : "",
      },
      closedAt: null,
    },
  };
}
