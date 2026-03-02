import { Button, Card } from "@/components/ui";
import type { DayPayload } from "./types";
import "./DaySummary.css";

type DaySummaryProps = {
  payload: DayPayload;
  onClose: () => void;
};

function formatDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, (month || 1) - 1, day || 1));
}

export function DaySummary({ payload, onClose }: DaySummaryProps) {
  const dayStartDone = Object.values(payload.dayStart).filter(Boolean).length;
  const pillarsDone = Object.values(payload.lifePillars).filter((p) => p.completed).length;
  const oneDone = payload.oneThing.completed;
  const threeDone = payload.topThree.filter((t) => t.completed).length;

  return (
    <Card as="div" className="day-summary">
      <div className="day-summary__checkmark" aria-hidden="true">
        ✓
      </div>
      <h2 className="day-summary__title">Goed gedaan. Rust lekker.</h2>
      <ul className="day-summary__stats">
        <li>{formatDate(payload.dateKey)}</li>
        <li>Dagstart: {dayStartDone}/4</li>
        <li>Je EEN: {oneDone ? "voltooid" : "niet voltooid"}</li>
        <li>Je DRIE: {threeDone}/3 voltooid</li>
        <li>Levenszagen: {pillarsDone}/4</li>
      </ul>
      <Button onClick={onClose}>Sluiten</Button>
    </Card>
  );
}
