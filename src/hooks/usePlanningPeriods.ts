import { useCallback, useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type {
  LifeWheelScores,
  MonthGoalPayload,
  PlanningPeriodType,
  PlanningPeriodViewModel,
  QuarterGoalPayload,
  WeekGoalPayload,
} from "@/components/planning/types";

type PeriodDoc = {
  docKey: string;
  content: unknown;
};

type HierarchyResponse = {
  quarter: PeriodDoc | null;
  month: PeriodDoc | null;
  week: PeriodDoc | null;
};

type PeriodState = {
  loading: boolean;
  error: string | null;
  viewModel: PlanningPeriodViewModel | null;
};

function extractQuarterContent(doc: PeriodDoc | null): {
  lifeWheel: Record<string, number>;
  quarterGoals: QuarterGoalPayload[];
} {
  if (!doc?.content || typeof doc.content !== "object") {
    return { lifeWheel: {}, quarterGoals: [] };
  }
  const c = doc.content as { lifeWheel?: Record<string, number>; quarterGoals?: unknown[] };
  const goals = (c.quarterGoals ?? []).map((value: unknown, i: number) => {
    const g = value as Record<string, unknown>;
    return {
    id: typeof g.id === "string" ? g.id : `q-${i}`,
    title: typeof g.title === "string" ? g.title : "",
    smartDefinition: typeof g.smartDefinition === "string" ? g.smartDefinition : "",
    whatIsDifferent: typeof g.whatIsDifferent === "string" ? g.whatIsDifferent : "",
    consequencesIfNot: typeof g.consequencesIfNot === "string" ? g.consequencesIfNot : "",
    rewardIfAchieved: typeof g.rewardIfAchieved === "string" ? g.rewardIfAchieved : "",
    progress: typeof g.progress === "number" ? g.progress : 0,
  };
  });
  return {
    lifeWheel: (c.lifeWheel && typeof c.lifeWheel === "object") ? c.lifeWheel : {},
    quarterGoals: goals,
  };
}

function extractMonthContent(doc: PeriodDoc | null): MonthGoalPayload[] {
  if (!doc?.content || typeof doc.content !== "object") {
    return [];
  }
  const goals = (doc.content as { monthlyGoals?: unknown[] }).monthlyGoals ?? [];
  return goals.map((value: unknown, i: number) => {
    const g = value as Record<string, unknown>;
    return {
    id: typeof g.id === "string" ? g.id : `m-${i}`,
    title: typeof g.title === "string" ? g.title : "",
    description: typeof g.description === "string" ? g.description : "",
    linkedQuarterGoals: Array.isArray(g.linkedQuarterGoals) ? g.linkedQuarterGoals.map(String) : [],
    progress: typeof g.progress === "number" ? g.progress : 0,
  };
  });
}

function extractWeekContent(doc: PeriodDoc | null): WeekGoalPayload[] {
  if (!doc?.content || typeof doc.content !== "object") {
    return [];
  }
  const goals = (doc.content as { weeklyGoals?: unknown[] }).weeklyGoals ?? [];
  return goals.map((value: unknown, i: number) => {
    const g = value as Record<string, unknown>;
    const rawDays = Array.isArray(g.assignedDays) ? g.assignedDays : [];
    const assignedDays = rawDays.filter((d): d is number => typeof d === "number" && d >= 0 && d <= 6);
    return {
      id: typeof g.id === "string" ? g.id : `w-${i}`,
      title: typeof g.title === "string" ? g.title : "",
      description: typeof g.description === "string" ? g.description : "",
      linkedMonthGoals: Array.isArray(g.linkedMonthGoals) ? g.linkedMonthGoals.map(String) : [],
      progress: typeof g.progress === "number" ? g.progress : 0,
      assignedDays,
    };
  });
}

function toViewModel(
  periodType: PlanningPeriodType,
  docKey: string,
  goals: { id: string; title: string; description?: string; progress: number; linkedQuarterGoals?: string[]; linkedMonthGoals?: string[] }[],
): PlanningPeriodViewModel {
  return {
    periodType,
    docKey,
    goals: goals.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description ?? "",
      progress: g.progress,
      parentGoalId: null,
      linkedGoals: [],
    })),
  };
}

export function usePlanningPeriods() {
  const [quarterDoc, setQuarterDoc] = useState<PeriodDoc | null>(null);
  const [monthDoc, setMonthDoc] = useState<PeriodDoc | null>(null);
  const [weekDoc, setWeekDoc] = useState<PeriodDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPeriod = useCallback(async () => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ quarter: PeriodDoc; month: PeriodDoc; week: PeriodDoc }>("/periods/hierarchy");
      if (res.success) {
        setQuarterDoc(res.data.quarter ?? null);
        setMonthDoc(res.data.month ?? null);
        setWeekDoc(res.data.week ?? null);
      } else {
        setError(res.message ?? "Kon periodes niet laden.");
      }
    } catch {
      setError("Kon periodes niet laden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPeriod();
  }, [loadPeriod]);

  const quarterContent = extractQuarterContent(quarterDoc);
  const monthGoals = extractMonthContent(monthDoc);
  const weekGoals = extractWeekContent(weekDoc);

  const periods = {
    quarter: {
      loading,
      error,
      viewModel: quarterDoc
        ? toViewModel("quarter", quarterDoc.docKey, quarterContent.quarterGoals)
        : null,
    } satisfies PeriodState,
    month: {
      loading,
      error,
      viewModel: monthDoc ? toViewModel("month", monthDoc.docKey, monthGoals) : null,
    } satisfies PeriodState,
    week: {
      loading,
      error,
      viewModel: weekDoc ? toViewModel("week", weekDoc.docKey, weekGoals) : null,
    } satisfies PeriodState,
  };

  const refreshPeriod = useCallback(
    async (_period: PlanningPeriodType) => {
      await loadPeriod();
    },
    [loadPeriod],
  );

  const updateGoalProgress = useCallback(
    async (period: PlanningPeriodType, index: number, progress: number) => {
      const doc = period === "quarter" ? quarterDoc : period === "month" ? monthDoc : weekDoc;
      if (!doc?.docKey) return;
      const endpoint = `/periods/${period}/${encodeURIComponent(doc.docKey)}/goals/${index}/progress`;
      const res = await apiFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ progress }),
      });
      if (res.success) {
        await loadPeriod();
      }
    },
    [quarterDoc, monthDoc, weekDoc, loadPeriod],
  );

  const replaceWeekGoals = useCallback(
    async (
      goals: Array<{
        id?: string;
        title: string;
        description: string;
        linkedMonthGoalId: string;
        progress?: number;
        assignedDays?: number[];
      }>,
    ) => {
      if (!weekDoc?.docKey) {
        setError("Geen weekdocument beschikbaar. Vernieuw de pagina.");
        return;
      }
      const res = await apiFetch(`/periods/week/${encodeURIComponent(weekDoc.docKey)}/goals`, {
        method: "PUT",
        body: JSON.stringify({
          goals: goals.map((g) => ({
            id: g.id,
            title: g.title,
            description: g.description,
            linkedMonthGoals: g.linkedMonthGoalId ? [g.linkedMonthGoalId] : [],
            progress: g.progress,
            assignedDays: g.assignedDays ?? [],
          })),
        }),
      });
      if (res.success) {
        setError(null);
        await loadPeriod();
      } else {
        setError(res.message ?? "Kon weekdoelen niet opslaan.");
      }
    },
    [weekDoc, loadPeriod],
  );

  const replaceMonthGoals = useCallback(
    async (goals: Array<{ title: string; description: string; linkedQuarterGoalId: string }>) => {
      if (!monthDoc?.docKey) {
        setError("Geen maanddocument beschikbaar. Vernieuw de pagina.");
        return;
      }
      const res = await apiFetch(`/periods/month/${encodeURIComponent(monthDoc.docKey)}/goals`, {
        method: "PUT",
        body: JSON.stringify({
          goals: goals.map((g) => ({
            title: g.title,
            description: g.description,
            linkedQuarterGoals: g.linkedQuarterGoalId ? [g.linkedQuarterGoalId] : [],
          })),
        }),
      });
      if (res.success) {
        setError(null);
        await loadPeriod();
      } else {
        setError(res.message ?? "Kon maanddoelen niet opslaan.");
      }
    },
    [monthDoc, loadPeriod],
  );

  const setQuarterLifeWheel = useCallback(
    async (scores: LifeWheelScores) => {
      if (!quarterDoc?.docKey) return;
      const res = await apiFetch(
        `/periods/quarter/${encodeURIComponent(quarterDoc.docKey)}/life-wheel`,
        {
          method: "PATCH",
          body: JSON.stringify(scores),
        },
      );
      if (res.success) await loadPeriod();
    },
    [quarterDoc, loadPeriod],
  );

  return {
    periods,
    quarterLifeWheel: quarterContent.lifeWheel,
    quarterGoals: quarterContent.quarterGoals,
    monthGoals,
    weekGoals,
    updateGoalProgress,
    replaceWeekGoals,
    replaceMonthGoals,
    setQuarterLifeWheel,
    refreshPeriod,
  };
}
