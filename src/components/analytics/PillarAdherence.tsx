import { Card, EmptyState, ProgressBar } from "@/components/ui";
import type { PillarMetric } from "./types";
import "./PillarAdherence.css";

type PillarAdherenceProps = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  labels: Record<PillarMetric["id"], string>;
  metrics: PillarMetric[];
};

export function PillarAdherence({
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  labels,
  metrics,
}: PillarAdherenceProps) {
  const hasData = metrics.some((metric) => metric.value > 0);

  return (
    <Card className="analytics-pillars" as="article">
      <header className="analytics-pillars__header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      {!hasData ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ul className="analytics-pillars__list">
          {metrics.map((metric) => (
            <li key={metric.id}>
              <div className="analytics-pillars__row">
                <span>{labels[metric.id]}</span>
                <strong>{Math.round(metric.value * 100)}%</strong>
              </div>
              <ProgressBar value={Math.round(metric.value * 100)} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
