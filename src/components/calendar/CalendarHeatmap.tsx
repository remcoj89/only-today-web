import { useMemo } from "react";
import { Tooltip } from "@/components/ui";
import { buildHeatmapGrid, getHeatmapMonthLabels } from "./utils";
import type { CalendarHeatmapPoint } from "./types";
import "./CalendarHeatmap.css";

type CalendarHeatmapProps = {
  year: number;
  locale: string;
  points: CalendarHeatmapPoint[];
  weekdayLabels: string[];
  onSelectDate: (date: string) => void;
  tooltipLabel: (dateLabel: string, score: number) => string;
};

function formatDateLabel(dateKey: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function formatMonthLabel(year: number, monthIndex: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
  }).format(new Date(year, monthIndex, 1));
}

export function CalendarHeatmap({
  year,
  locale,
  points,
  weekdayLabels,
  onSelectDate,
  tooltipLabel,
}: CalendarHeatmapProps) {
  const columns = useMemo(() => buildHeatmapGrid(year, points), [points, year]);
  const monthLabels = useMemo(() => getHeatmapMonthLabels(year), [year]);

  return (
    <section className="calendar-heatmap">
      <div className="calendar-heatmap__scroll">
        <div className="calendar-heatmap__layout">
          <div className="calendar-heatmap__weekdays" aria-hidden="true">
            {weekdayLabels.map((label) => (
              <span key={label} className="calendar-heatmap__weekday-label">
                {label}
              </span>
            ))}
          </div>

          <div className="calendar-heatmap__content">
            <div
              className="calendar-heatmap__months"
              style={{ gridTemplateColumns: `repeat(${columns.length}, var(--calendar-heatmap-cell-size))` }}
              aria-hidden="true"
            >
              {monthLabels.map((label) => (
                <span
                  key={`${label.monthIndex}-${label.weekIndex}`}
                  className="calendar-heatmap__month-label"
                  style={{ gridColumnStart: label.weekIndex + 1 }}
                >
                  {formatMonthLabel(year, label.monthIndex, locale)}
                </span>
              ))}
            </div>

            <div className="calendar-heatmap__grid" role="grid" aria-label={`Kalender heatmap ${year}`}>
              {columns.map((column, weekIndex) => (
                <div key={`week-${weekIndex}`} className="calendar-heatmap__week-column" role="row">
                  {column.map((cell) => {
                    const score = cell.point?.normalizedScore ?? 0;
                    const dateLabel = formatDateLabel(cell.date, locale);
                    const content = tooltipLabel(dateLabel, score);
                    return (
                      <Tooltip key={cell.date} content={content}>
                        <button
                          type="button"
                          role="gridcell"
                          className={`calendar-heatmap__cell calendar-heatmap__cell--level-${cell.intensityLevel}`}
                          data-in-year={cell.isInYear ? "true" : "false"}
                          onClick={() => onSelectDate(cell.date)}
                          aria-label={content}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
