import { Card, EmptyState } from "@/components/ui";
import type { Correlations } from "./types";
import "./CorrelationInsight.css";

type CorrelationInsightProps = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  insightTemplate: string;
  startMetricLabel: string;
  endMetricLabel: string;
  data: Correlations;
};

export function CorrelationInsight({
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  insightTemplate,
  startMetricLabel,
  endMetricLabel,
  data,
}: CorrelationInsightProps) {
  const hasData = data.dayStartComplete > 0;
  const percentage = Math.round(data.dayStartToClosedRate * 100);
  const insight = insightTemplate.replace("{{percentage}}", String(percentage));

  return (
    <Card className="analytics-correlation" as="article">
      <header className="analytics-correlation__header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      {!hasData ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <p className="analytics-correlation__insight">{insight}</p>
          <div className="analytics-correlation__metrics" role="group" aria-label={title}>
            <section className="analytics-correlation__metric">
              <span>{startMetricLabel}</span>
              <strong>{data.dayStartComplete}</strong>
            </section>
            <span className="analytics-correlation__link" aria-hidden="true">
              {percentage}%
            </span>
            <section className="analytics-correlation__metric">
              <span>{endMetricLabel}</span>
              <strong>{data.dayClosed}</strong>
            </section>
          </div>
        </>
      )}
    </Card>
  );
}
