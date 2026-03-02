import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, Spinner } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { offlineDb, type StoredDocument } from "@/lib/offline";
import { useTranslation } from "@/i18n/useTranslation";
import { I18nProvider } from "@/context/I18nContext";
import { normalizeDayPayload } from "@/components/today/dayState";
import type { DayPayload } from "@/components/today/types";
import { CalendarHeatmap } from "./CalendarHeatmap";
import { DayDetailModal } from "./DayDetailModal";
import { MonthGrid } from "./MonthGrid";
import { toHeatmapPoints } from "./utils";
import type { CalendarDayStatus, CalendarHeatmapApiPoint, CalendarMonthStatusMap, CalendarViewMode } from "./types";
import "./CalendarView.css";

type CalendarHeatmapResponse = {
  data: CalendarHeatmapApiPoint[];
};

type DayDocumentListItem = {
  docKey: string;
  status: string;
};

type DayDocumentResponse = {
  document: {
    docKey: string;
    content: unknown;
  };
};

function formatDateForTitle(dateKey: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function toCalendarDayStatus(value: string): CalendarDayStatus {
  if (value === "closed" || value === "auto_closed" || value === "open") {
    return value;
  }
  return "empty";
}

function resolveLocalDayStatus(document: StoredDocument): CalendarDayStatus {
  const payload = document.payload as Partial<DayPayload> | undefined;
  const rawStatus = typeof payload?.status === "string" ? payload.status : "open";
  return toCalendarDayStatus(rawStatus);
}

function CalendarViewContent() {
  const now = useMemo(() => new Date(), []);
  const { locale, t } = useTranslation();
  const loadFailedMessage = t("calendar.errors.loadFailed");

  const [viewMode, setViewMode] = useState<CalendarViewMode>("heatmap");
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [heatmapPoints, setHeatmapPoints] = useState<ReturnType<typeof toHeatmapPoints>>([]);
  const [monthStatuses, setMonthStatuses] = useState<CalendarMonthStatusMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [detailPayload, setDetailPayload] = useState<DayPayload | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadYearData() {
      setLoading(true);
      setError(null);

      const [heatmapResponse, documentsResponse, localDocuments] = await Promise.all([
        apiFetch<CalendarHeatmapResponse>(`/analytics/calendar-heatmap?year=${selectedYear}`),
        apiFetch<{ documents: DayDocumentListItem[] }>("/documents?docType=day"),
        offlineDb.documents.where("docType").equals("day").toArray(),
      ]);

      if (!active) {
        return;
      }

      if (!heatmapResponse.success) {
        setError(heatmapResponse.message || loadFailedMessage);
        setHeatmapPoints([]);
        setMonthStatuses({});
        setLoading(false);
        return;
      }

      setHeatmapPoints(toHeatmapPoints(heatmapResponse.data.data));

      const nextStatusMap: CalendarMonthStatusMap = {};
      if (documentsResponse.success) {
        documentsResponse.data.documents.forEach((document) => {
          if (document.docKey.startsWith(`${selectedYear}-`)) {
            nextStatusMap[document.docKey] = toCalendarDayStatus(document.status);
          }
        });
      }
      // Local cache is the source of truth in offline-first mode, so allow it to fill or override statuses.
      localDocuments.forEach((document) => {
        if (document.docKey.startsWith(`${selectedYear}-`)) {
          nextStatusMap[document.docKey] = resolveLocalDayStatus(document);
        }
      });
      setMonthStatuses(nextStatusMap);

      setLoading(false);
    }

    void loadYearData();
    return () => {
      active = false;
    };
  }, [selectedYear, loadFailedMessage]);

  async function openDayDetail(dateKey: string) {
    setSelectedDateKey(dateKey);
    setDetailLoading(true);
    setDetailError(null);
    setDetailPayload(null);

    const response = await apiFetch<DayDocumentResponse>(`/documents/day/${encodeURIComponent(dateKey)}`);
    if (!response.success) {
      // Treat missing/invalid day document as empty read-only detail instead of hard failure.
      if (response.code === "VALIDATION_ERROR" || response.code === "NOT_FOUND") {
        setDetailPayload(null);
        setDetailLoading(false);
        return;
      }
      setDetailError(response.message || t("calendar.errors.loadDayFailed"));
      setDetailLoading(false);
      return;
    }

    setDetailPayload(normalizeDayPayload(response.data.document.content, dateKey));
    setDetailLoading(false);
  }

  const weekdayLabels = useMemo(
    () => [
      t("calendar.weekdays.mon"),
      t("calendar.weekdays.tue"),
      t("calendar.weekdays.wed"),
      t("calendar.weekdays.thu"),
      t("calendar.weekdays.fri"),
      t("calendar.weekdays.sat"),
      t("calendar.weekdays.sun"),
    ],
    [t],
  );

  const hasData = heatmapPoints.length > 0 || Object.keys(monthStatuses).length > 0;

  const detailTitle = selectedDateKey
    ? t("calendar.dayDetail.titleWithDate", { date: formatDateForTitle(selectedDateKey, locale) })
    : t("calendar.dayDetail.title");

  return (
    <section className="calendar-view">
      <header className="calendar-view__header">
        <div>
          <h1>{t("calendar.title")}</h1>
          <p>{t("calendar.subtitle")}</p>
        </div>

        <div className="calendar-view__toolbar">
          <div className="calendar-view__toggle" role="tablist" aria-label={t("calendar.viewToggleAriaLabel")}>
            <Button
              variant={viewMode === "heatmap" ? "primary" : "secondary"}
              onClick={() => setViewMode("heatmap")}
              role="tab"
              aria-selected={viewMode === "heatmap"}
            >
              {t("calendar.views.heatmap")}
            </Button>
            <Button
              variant={viewMode === "month" ? "primary" : "secondary"}
              onClick={() => setViewMode("month")}
              role="tab"
              aria-selected={viewMode === "month"}
            >
              {t("calendar.views.month")}
            </Button>
          </div>

          <div className="calendar-view__year-nav">
            <button
              type="button"
              className="calendar-view__year-button"
              aria-label={t("calendar.previousYear")}
              onClick={() => {
                setSelectedYear((year) => year - 1);
                setSelectedMonth((month) => new Date(month.getFullYear() - 1, month.getMonth(), 1));
              }}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <strong>{selectedYear}</strong>
            <button
              type="button"
              className="calendar-view__year-button"
              aria-label={t("calendar.nextYear")}
              onClick={() => {
                setSelectedYear((year) => year + 1);
                setSelectedMonth((month) => new Date(month.getFullYear() + 1, month.getMonth(), 1));
              }}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <Card className="calendar-view__state-card">
          <Spinner size="md" />
          <p>{t("calendar.loading")}</p>
        </Card>
      ) : null}

      {!loading && error ? (
        <Card className="calendar-view__state-card" variant="accent">
          <p>{error}</p>
        </Card>
      ) : null}

      {!loading && !error && !hasData ? (
        <Card className="calendar-view__state-card">
          <p>{t("calendar.empty")}</p>
        </Card>
      ) : null}

      {!loading && !error && hasData ? (
        <Card>
          {viewMode === "heatmap" ? (
            <CalendarHeatmap
              year={selectedYear}
              locale={locale}
              points={heatmapPoints}
              weekdayLabels={weekdayLabels}
              onSelectDate={(date) => void openDayDetail(date)}
              tooltipLabel={(dateLabel, score) => t("calendar.tooltip", { date: dateLabel, score })}
            />
          ) : (
            <MonthGrid
              monthDate={selectedMonth}
              locale={locale}
              statusMap={monthStatuses}
              weekdayLabels={weekdayLabels}
              onMonthChange={(nextMonth) => {
                setSelectedMonth(nextMonth);
                if (nextMonth.getFullYear() !== selectedYear) {
                  setSelectedYear(nextMonth.getFullYear());
                }
              }}
              onSelectDate={(date) => void openDayDetail(date)}
              statusLabel={(status) => t(`calendar.status.${status}`)}
              previousLabel={t("calendar.previousMonth")}
              nextLabel={t("calendar.nextMonth")}
            />
          )}
        </Card>
      ) : null}

      <DayDetailModal
        isOpen={Boolean(selectedDateKey)}
        dateKey={selectedDateKey}
        payload={detailPayload}
        loading={detailLoading}
        error={detailError}
        title={detailTitle}
        onClose={() => setSelectedDateKey(null)}
        labels={{
          loading: t("calendar.dayDetail.loading"),
          empty: t("calendar.dayDetail.empty"),
          dayStart: t("calendar.dayDetail.sections.dayStart"),
          mindset: t("calendar.dayDetail.sections.mindset"),
          oneAndThree: t("calendar.dayDetail.sections.oneAndThree"),
          lifePillars: t("calendar.dayDetail.sections.lifePillars"),
          reflection: t("calendar.dayDetail.sections.reflection"),
          score: t("calendar.dayDetail.score"),
          notFilled: t("calendar.dayDetail.notFilled"),
        }}
      />
    </section>
  );
}

export function CalendarView() {
  return (
    <I18nProvider>
      <CalendarViewContent />
    </I18nProvider>
  );
}
