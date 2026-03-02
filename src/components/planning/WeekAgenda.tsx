import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui";
import { GoalProgressCard } from "./GoalProgressCard";
import { getWeekDates } from "./weekUtils";
import type { WeekGoalPayload } from "./types";
import "./WeekAgenda.css";

type WeekAgendaProps = {
  weekDocKey: string;
  weekGoals: WeekGoalPayload[];
  monthGoals: { id: string; title: string }[];
  onAddGoal: () => void;
  onEditGoal: (index: number) => void;
  onDeleteGoal: (index: number) => void;
  onProgressChange: (index: number, progress: number) => void;
  editLabel: string;
  deleteLabel: string;
  emptyLabel: string;
};

export function WeekAgenda({
  weekDocKey,
  weekGoals,
  monthGoals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onProgressChange,
  editLabel,
  deleteLabel,
  emptyLabel,
}: WeekAgendaProps) {
  const { t } = useTranslation();
  const weekDates = getWeekDates(weekDocKey);

  const goalsByDay: WeekGoalPayload[][] = Array.from({ length: 7 }, () => []);
  const unassignedGoals: WeekGoalPayload[] = [];

  for (const goal of weekGoals) {
    const days = goal.assignedDays ?? [];
    if (days.length === 0) {
      unassignedGoals.push(goal);
    } else {
      for (const dayIndex of days) {
        if (dayIndex >= 0 && dayIndex < 7) {
          goalsByDay[dayIndex].push(goal);
        }
      }
    }
  }

  const goalToIndex = (goal: WeekGoalPayload) => weekGoals.findIndex((g) => g.id === goal.id);

  return (
    <div className="week-agenda">
      <div className="week-agenda__header">
        <Button variant="primary" onClick={onAddGoal}>
          {t("planning.week.addGoal")}
        </Button>
      </div>

      {weekGoals.length === 0 ? (
        <p className="week-agenda__empty-hint">{emptyLabel}</p>
      ) : null}

      {unassignedGoals.length > 0 ? (
        <section className="week-agenda__section">
          <h3 className="week-agenda__section-title">{t("planning.week.agendaUnassigned")}</h3>
          <div className="week-agenda__goal-list">
            {unassignedGoals.map((goal) => {
              const index = goalToIndex(goal);
              return (
                <GoalProgressCard
                  key={goal.id}
                  title={goal.title}
                  description={goal.description}
                  progress={goal.progress}
                  onProgressChange={(p) => onProgressChange(index, p)}
                  onEdit={() => onEditGoal(index)}
                  onDelete={() => onDeleteGoal(index)}
                  editLabel={editLabel}
                  deleteLabel={deleteLabel}
                  linkedGoals={
                    goal.linkedMonthGoals?.[0] && monthGoals.length
                      ? monthGoals
                          .filter((m) => m.id === goal.linkedMonthGoals[0])
                          .map((m) => ({ id: m.id, title: m.title, href: "/planning/month" }))
                      : []
                  }
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="week-agenda__grid" aria-label={t("planning.week.agendaTitle")}>
        {weekDates.map((date, dayIndex) => (
          <div key={dayIndex} className="week-agenda__day">
            <header className="week-agenda__day-header">
              <span className="week-agenda__day-name">{t(`planning.week.dayShort.${dayIndex}`)}</span>
              <time dateTime={date.toISOString().slice(0, 10)} className="week-agenda__day-date">
                {date.getDate()}
              </time>
            </header>
            <div className="week-agenda__day-goals">
              {goalsByDay[dayIndex].map((goal) => {
                const index = goalToIndex(goal);
                return (
                  <GoalProgressCard
                    key={goal.id}
                    title={goal.title}
                    description={goal.description}
                    progress={goal.progress}
                    onProgressChange={(p) => onProgressChange(index, p)}
                    onEdit={() => onEditGoal(index)}
                    onDelete={() => onDeleteGoal(index)}
                    editLabel={editLabel}
                    deleteLabel={deleteLabel}
                    linkedGoals={
                      goal.linkedMonthGoals?.[0] && monthGoals.length
                        ? monthGoals
                            .filter((m) => m.id === goal.linkedMonthGoals[0])
                            .map((m) => ({ id: m.id, title: m.title, href: "/planning/month" }))
                        : []
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
