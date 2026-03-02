import { Card, EmptyState } from "@/components/ui";
import type { CompletionChartPoint } from "./types";
import "./CompletionChart.css";

type CompletionChartProps = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  points: CompletionChartPoint[];
};

function buildPolyline(points: CompletionChartPoint[], width: number, height: number, padding: number): string {
  if (!points.length) {
    return "";
  }

  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;

  return points
    .map((point, index) => {
      const x = padding + index * step;
      const y = padding + innerHeight - (point.value / 100) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

export function CompletionChart({ title, subtitle, emptyTitle, emptyDescription, points }: CompletionChartProps) {
  const hasSeries = points.some((point) => point.value > 0);
  const maxLabelCount = 4;
  const labelStep = Math.max(1, Math.ceil(points.length / maxLabelCount));
  const labels = points.filter((_point, index) => index % labelStep === 0 || index === points.length - 1);
  const line = buildPolyline(points, 100, 48, 4);

  return (
    <Card className="analytics-completion" as="article">
      <header className="analytics-completion__header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      {!hasSeries ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <svg
            className="analytics-completion__chart"
            viewBox="0 0 100 48"
            role="img"
            aria-label={title}
            preserveAspectRatio="none"
          >
            <line x1="4" y1="4" x2="4" y2="44" />
            <line x1="4" y1="44" x2="96" y2="44" />
            <polyline points={line} />
          </svg>
          <div className="analytics-completion__labels" aria-hidden="true">
            {labels.map((point) => (
              <span key={point.date}>{point.label}</span>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
