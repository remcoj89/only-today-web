import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Card, Skeleton, Spinner } from "@/components/ui";
import { useDocument } from "@/hooks/useDocument";
import nlMessages from "@/i18n/nl.json";
import { trackEvent } from "@/lib/tracking";
import { DayCloseFlow } from "./DayCloseFlow";
import { DayStartChecklist } from "./DayStartChecklist";
import { LifePillars } from "./LifePillars";
import { MindsetSection } from "./MindsetSection";
import { OneThingCard } from "./OneThingCard";
import { OtherTasksList } from "./OtherTasksList";
import { PomodoroTimer } from "./PomodoroTimer";
import { TopThreeList } from "./TopThreeList";
import { canCloseDay, createDefaultDayPayload, getLocalDateKey, normalizeDayPayload, resolveStatus } from "./dayState";
import type { DayPayload } from "./types";
import "./TodayScreen.css";

type ActivePomodoroTarget =
  | { type: "one" }
  | {
      type: "three";
      index: number;
    };

function offsetDate(date: Date, offsetDays: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offsetDays, 12, 0, 0, 0);
}

function statusLabel(status: DayPayload["status"]): string {
  switch (status) {
    case "closed":
      return "Afgesloten";
    case "auto_closed":
      return "Automatisch gesloten";
    default:
      return "Open";
  }
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function TodayScreen() {
  const [dateOffset, setDateOffset] = useState(0);
  const [showDayCloseFlow, setShowDayCloseFlow] = useState(false);
  const [activePomodoroTarget, setActivePomodoroTarget] = useState<ActivePomodoroTarget | null>(null);

  const selectedDate = useMemo(() => offsetDate(new Date(), dateOffset), [dateOffset]);
  const dateKey = useMemo(() => getLocalDateKey(selectedDate), [selectedDate]);
  const { document, loading, saveDocument } = useDocument("day", dateKey);
  const [payload, setPayload] = useState<DayPayload | null>(null);
  const lastInitializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!document) {
      if (lastInitializedRef.current === dateKey) {
        return;
      }
      lastInitializedRef.current = dateKey;
      const base = createDefaultDayPayload(dateKey);
      setPayload(base);
      void saveDocument(base);
      return;
    }

    const normalized = normalizeDayPayload(document.payload, dateKey);
    setPayload(normalized);
    if (normalized.status !== (document.payload as Partial<DayPayload>)?.status) {
      void saveDocument(normalized);
    }
  }, [dateKey, document, loading, saveDocument]);

  const persist = (next: DayPayload) => {
    setPayload(next);
    void saveDocument(next);
  };

  const isReadOnly = payload ? resolveStatus(payload.dateKey, payload.status) !== "open" : false;
  const isAutoClosed = payload?.status === "auto_closed";
  const canClose = payload ? canCloseDay(payload) : false;

  const activePomodoroTask = useMemo(() => {
    if (!payload || !activePomodoroTarget) {
      return null;
    }
    if (activePomodoroTarget.type === "one") {
      return payload.oneThing;
    }
    return payload.topThree[activePomodoroTarget.index] ?? null;
  }, [activePomodoroTarget, payload]);

  if (loading || !payload) {
    return (
      <Card className="today-screen__loading-card">
        <Spinner size="md" label="Laden..." />
        <Skeleton lines={5} />
      </Card>
    );
  }

  const badgeVariant = payload.status === "open" ? "success" : payload.status === "auto_closed" ? "warning" : "neutral";
  const translatedTitle = (nlMessages as { today?: { title?: string } }).today?.title ?? "Vandaag";
  const translatedCloseDay = (nlMessages as { today?: { closeDay?: string } }).today?.closeDay ?? "Dag afronden";
  const translatedGratitude =
    (nlMessages as { today?: { mindsetGratitude?: string } }).today?.mindsetGratitude ?? "Ik ben dankbaar voor...";
  const translatedIntention =
    (nlMessages as { today?: { mindsetIntention?: string } }).today?.mindsetIntention ?? "Mijn intentie voor vandaag";

  return (
    <div className="today-screen">
      <header className="today-screen__header">
        <div>
          <h1>{translatedTitle}</h1>
          <p className="today-screen__date">{formatDateLabel(selectedDate)}</p>
        </div>
        <Badge variant={badgeVariant}>{statusLabel(payload.status)}</Badge>
      </header>

      <div className="today-screen__date-controls">
        <Button variant={dateOffset === -1 ? "primary" : "secondary"} onClick={() => setDateOffset(-1)}>
          Gisteren
        </Button>
        <Button variant={dateOffset === 0 ? "primary" : "secondary"} onClick={() => setDateOffset(0)}>
          Vandaag
        </Button>
        <Button variant={dateOffset === 1 ? "primary" : "secondary"} onClick={() => setDateOffset(1)}>
          Morgen
        </Button>
      </div>

      <div className="today-screen__sections">
        <section className="today-screen__section">
          <DayStartChecklist
            value={payload.dayStart}
            readOnly={isReadOnly}
            onChange={(next) => persist({ ...payload, dayStart: next })}
          />
        </section>

        <section className="today-screen__section">
          <MindsetSection
            value={payload.mindset}
            readOnly={isReadOnly}
            onChange={(next) => persist({ ...payload, mindset: next })}
            gratitudeLabel={translatedGratitude}
            intentionLabel={translatedIntention}
          />
        </section>

        <section className="today-screen__section">
          <OneThingCard
            task={payload.oneThing}
            readOnly={isReadOnly}
            onChange={(next) => persist({ ...payload, oneThing: next })}
            onStartPomodoro={() => setActivePomodoroTarget({ type: "one" })}
          />
        </section>

        <section className="today-screen__section">
          <TopThreeList
            tasks={payload.topThree}
            readOnly={isReadOnly}
            onChange={(next) => persist({ ...payload, topThree: next })}
            onStartPomodoro={(index) => setActivePomodoroTarget({ type: "three", index })}
          />
        </section>

        <section className="today-screen__section">
          <OtherTasksList
            tasks={payload.otherTasks}
            readOnly={isReadOnly}
            onChange={(next) => persist({ ...payload, otherTasks: next })}
          />
        </section>

        <section className="today-screen__section">
          <LifePillars
            value={payload.lifePillars}
            readOnly={isReadOnly}
            onChange={(next) => persist({ ...payload, lifePillars: next })}
          />
        </section>

        <section className="today-screen__section">
          <Card as="section" className="today-screen__close-card">
            <h2>{translatedCloseDay}</h2>
            <p>
              {canClose
                ? "Alles staat klaar om je dag af te ronden."
                : "Vul Je EEN en alle DRIE in en markeer ze als voltooid om je dag af te ronden."}
            </p>
            <Button onClick={() => setShowDayCloseFlow(true)} disabled={!canClose || isReadOnly}>
              Dag afronden
            </Button>
          </Card>
        </section>
      </div>

      {isReadOnly ? (
        <div className="today-screen__readonly-overlay" role="note" aria-live="polite">
          {isAutoClosed ? "Deze dag is automatisch afgesloten en staat op read-only." : "Deze dag is read-only."}
        </div>
      ) : null}

      <PomodoroTimer
        isOpen={Boolean(activePomodoroTask)}
        taskName={activePomodoroTask?.title || "Taak"}
        pomodorosDone={activePomodoroTask?.pomodorosDone || 0}
        pomodorosPlanned={activePomodoroTask?.pomodorosPlanned || 0}
        taskType={activePomodoroTarget?.type === "three" ? "three" : "one"}
        onClose={() => setActivePomodoroTarget(null)}
        onFocusCompleted={() => {
          if (!payload || !activePomodoroTarget) {
            return;
          }
          if (activePomodoroTarget.type === "one") {
            const maxDone = Math.min(payload.oneThing.pomodorosPlanned, payload.oneThing.pomodorosDone + 1);
            persist({
              ...payload,
              oneThing: { ...payload.oneThing, pomodorosDone: maxDone },
            });
            return;
          }
          const clone = [...payload.topThree];
          const current = clone[activePomodoroTarget.index];
          if (!current) {
            return;
          }
          clone[activePomodoroTarget.index] = {
            ...current,
            pomodorosDone: Math.min(current.pomodorosPlanned, current.pomodorosDone + 1),
          };
          persist({ ...payload, topThree: clone });
        }}
      />

      <DayCloseFlow
        isOpen={showDayCloseFlow}
        payload={payload}
        closeState={payload.dayClose}
        readOnly={isReadOnly}
        canClose={canClose}
        onClose={() => setShowDayCloseFlow(false)}
        onChange={(next) => persist({ ...payload, dayClose: next })}
        onComplete={() => {
          trackEvent("day_closed", {
            reflection_filled: Boolean(
              payload.dayClose.reflection.whatWentWell.trim() ||
                payload.dayClose.reflection.whyWentWell.trim() ||
                payload.dayClose.reflection.howToRepeat.trim() ||
                payload.dayClose.reflection.whatWentWrong.trim() ||
                payload.dayClose.reflection.whyWentWrong.trim() ||
                payload.dayClose.reflection.whatToChangeNextTime.trim(),
            ),
          });
          persist({
            ...payload,
            status: "closed",
            dayClose: {
              ...payload.dayClose,
              closedAt: new Date().toISOString(),
            },
          });
          setShowDayCloseFlow(false);
        }}
      />
    </div>
  );
}

