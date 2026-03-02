import { Pencil, Trash2 } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { PlanningGoalLink, WeekDayStatus } from "./types";
import "./GoalProgressCard.css";

export type GoalProgressCardProps = {
  title: string;
  description?: string;
  progress: number;
  onProgressChange?: (progress: number) => void;
  readOnly?: boolean;
  linkedGoals?: PlanningGoalLink[];
  weekDayStatuses?: WeekDayStatus[];
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
};

export function GoalProgressCard({
  title,
  description,
  progress,
  onProgressChange,
  readOnly = false,
  linkedGoals = [],
  weekDayStatuses,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: GoalProgressCardProps) {
  const hasActions = onEdit || onDelete;

  return (
    <article className="goal-progress-card">
      <div className="goal-progress-card__header">
        <div className="goal-progress-card__fields">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
        {readOnly ? (
          <ProgressBar value={progress} max={100} showValue />
        ) : onProgressChange ? (
          <Slider
            min={0}
            max={100}
            step={1}
            value={progress}
            showValue
            label=""
            onChange={(e) => onProgressChange(Number(e.target.value))}
          />
        ) : (
          <ProgressBar value={progress} max={100} showValue />
        )}
        </div>
        {hasActions ? (
          <div className="goal-progress-card__actions">
            {onEdit ? (
              <button
                type="button"
                className="goal-progress-card__action"
                onClick={onEdit}
                aria-label={editLabel}
                title={editLabel}
              >
                <Pencil size={16} strokeWidth={1.75} />
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                className="goal-progress-card__action goal-progress-card__action--danger"
                onClick={onDelete}
                aria-label={deleteLabel}
                title={deleteLabel}
              >
                <Trash2 size={16} strokeWidth={1.75} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {weekDayStatuses && weekDayStatuses.length === 7 ? (
        <div className="goal-progress-card__week-strip" role="img" aria-label="Week day status">
          {weekDayStatuses.map((status, i) => (
            <span
              key={i}
              className={`goal-progress-card__day goal-progress-card__day--${status}`}
              title={`Day ${i + 1}: ${status}`}
            />
          ))}
        </div>
      ) : null}
      {linkedGoals.length > 0 ? (
        <ul className="goal-progress-card__linked-list">
          {linkedGoals.map((link) => (
            <li key={link.id}>
              {link.href ? (
                <a href={link.href}>{link.title}</a>
              ) : (
                <span>{link.title}</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
