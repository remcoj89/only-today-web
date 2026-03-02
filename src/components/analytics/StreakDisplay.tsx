import { Card } from "@/components/ui";
import type { Streaks } from "./types";
import "./StreakDisplay.css";

type StreakDisplayProps = {
  title: string;
  dayClosedLabel: string;
  allPillarsLabel: string;
  perPillarTitle: string;
  dayUnit: string;
  pillarLabels: {
    training: string;
    deepRelaxation: string;
    healthyNutrition: string;
    realConnection: string;
  };
  streaks: Streaks;
};

type PillarId = keyof Streaks["perPillar"];

export function StreakDisplay({
  title,
  dayClosedLabel,
  allPillarsLabel,
  perPillarTitle,
  dayUnit,
  pillarLabels,
  streaks,
}: StreakDisplayProps) {
  const pillarKeys: PillarId[] = ["training", "deepRelaxation", "healthyNutrition", "realConnection"];

  return (
    <Card className="analytics-streaks" as="article">
      <header className="analytics-streaks__header">
        <h2>{title}</h2>
      </header>

      <div className="analytics-streaks__primary">
        <section className="analytics-streaks__big-metric">
          <strong>{streaks.dayClosed}</strong>
          <span>
            {dayClosedLabel} · {dayUnit}
          </span>
        </section>
        <section className="analytics-streaks__big-metric">
          <strong>{streaks.allPillars}</strong>
          <span>
            {allPillarsLabel} · {dayUnit}
          </span>
        </section>
      </div>

      <section className="analytics-streaks__pillars" aria-label={perPillarTitle}>
        <h3>{perPillarTitle}</h3>
        <ul>
          {pillarKeys.map((pillarId) => (
            <li key={pillarId}>
              <span>{pillarLabels[pillarId]}</span>
              <strong>{streaks.perPillar[pillarId]}</strong>
            </li>
          ))}
        </ul>
      </section>
    </Card>
  );
}
