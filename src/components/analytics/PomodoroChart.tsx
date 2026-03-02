import { Card, EmptyState } from "@/components/ui";
import type { PomodoroChartPoint } from "./types";
import "./PomodoroChart.css";

type PomodoroChartProps = {
  title: string;
  subtitle: string;
  plannedLabel: string;
  doneLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  points: PomodoroChartPoint[];
};

export function PomodoroChart({
  title,
  subtitle,
  plannedLabel,
  doneLabel,
  emptyTitle,
  emptyDescription,
  points,
}: PomodoroChartProps) {
  const maxValue = Math.max(1, ...points.map((point) => Math.max(point.planned, point.done)));
  const visiblePoints = points.slice(-10);
  const hasSeries = points.some((point) => point.planned > 0 || point.done > 0);

  return (
    <Card className="analytics-pomodoro" as="article">
      <header className="analytics-pomodoro__header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      {!hasSeries ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className="analytics-pomodoro__plot" role="img" aria-label={title}>
            {visiblePoints.map((point) => (
              <div key={point.date} className="analytics-pomodoro__group">
                <div className="analytics-pomodoro__bars">
                  <span
                    className="analytics-pomodoro__bar analytics-pomodoro__bar--planned"
                    style={{ height: `${Math.round((point.planned / maxValue) * 100)}%` }}
                    title={`${plannedLabel}: ${point.planned}`}
                  />
                  <span
                    className="analytics-pomodoro__bar analytics-pomodoro__bar--done"
                    style={{ height: `${Math.round((point.done / maxValue) * 100)}%` }}
                    title={`${doneLabel}: ${point.done}`}
                  />
                </div>
                <span className="analytics-pomodoro__tick" aria-hidden="true">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
          <footer className="analytics-pomodoro__legend">
            <span>
              <i className="analytics-pomodoro__dot analytics-pomodoro__dot--planned" />
              {plannedLabel}
            </span>
            <span>
              <i className="analytics-pomodoro__dot analytics-pomodoro__dot--done" />
              {doneLabel}
            </span>
          </footer>
        </>
      )}
    </Card>
  );
}
