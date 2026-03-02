import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildMonthGrid } from "./utils";
import type { CalendarMonthStatusMap } from "./types";
import "./MonthGrid.css";

type MonthGridProps = {
  monthDate: Date;
  locale: string;
  statusMap: CalendarMonthStatusMap;
  weekdayLabels: string[];
  onMonthChange: (next: Date) => void;
  onSelectDate: (date: string) => void;
  statusLabel: (status: string) => string;
  previousLabel: string;
  nextLabel: string;
};

function formatMonthTitle(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function MonthGrid({
  monthDate,
  locale,
  statusMap,
  weekdayLabels,
  onMonthChange,
  onSelectDate,
  statusLabel,
  previousLabel,
  nextLabel,
}: MonthGridProps) {
  const rows = useMemo(() => buildMonthGrid(monthDate, statusMap), [monthDate, statusMap]);
  const monthTitle = useMemo(() => formatMonthTitle(monthDate, locale), [locale, monthDate]);

  return (
    <section className="month-grid">
      <header className="month-grid__header">
        <button
          type="button"
          className="month-grid__nav-button"
          onClick={() => onMonthChange(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
          aria-label={previousLabel}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <h2>{monthTitle}</h2>
        <button
          type="button"
          className="month-grid__nav-button"
          onClick={() => onMonthChange(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
          aria-label={nextLabel}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="month-grid__weekday-row" aria-hidden="true">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="month-grid__rows" role="grid" aria-label={monthTitle}>
        {rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="month-grid__row" role="row">
            {row.map((cell) => {
              const label = `${cell.dayOfMonth} - ${statusLabel(cell.status)}`;
              return (
                <button
                  key={cell.date}
                  type="button"
                  className={`month-grid__day month-grid__day--${cell.status}`}
                  data-current-month={cell.isCurrentMonth ? "true" : "false"}
                  role="gridcell"
                  onClick={() => onSelectDate(cell.date)}
                  disabled={!cell.isCurrentMonth}
                  aria-label={label}
                >
                  <span className="month-grid__day-number">{cell.dayOfMonth}</span>
                  <span className={`month-grid__status-dot month-grid__status-dot--${cell.status}`} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
