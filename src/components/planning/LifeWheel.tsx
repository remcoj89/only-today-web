import { Slider } from "@/components/ui/Slider";
import type { LifeWheelKey, LifeWheelScores } from "./types";
import "./LifeWheel.css";

export type { LifeWheelKey, LifeWheelScores };

export type LifeWheelProps = {
  values: LifeWheelScores;
  labels: Record<LifeWheelKey, string>;
  onChange?: (key: LifeWheelKey, value: number) => void;
  readOnly?: boolean;
  compact?: boolean;
};

const wheelOrder: LifeWheelKey[] = ["work", "fun", "social", "giving", "money", "growth", "health", "love"];

function toPolygonPoints(values: LifeWheelScores, radius: number, center: number): string {
  return wheelOrder
    .map((key, index) => {
      const angle = (Math.PI / 180) * (-90 + index * (360 / wheelOrder.length));
      const clamped = Math.max(1, Math.min(10, values[key]));
      const valueRadius = (clamped / 10) * radius;
      const x = center + Math.cos(angle) * valueRadius;
      const y = center + Math.sin(angle) * valueRadius;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function toAxisPoint(index: number, radius: number, center: number): { x: number; y: number } {
  const angle = (Math.PI / 180) * (-90 + index * (360 / wheelOrder.length));
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

export function LifeWheel({ values, labels, onChange, readOnly = false, compact = false }: LifeWheelProps) {
  const center = compact ? 88 : 110;
  const radius = compact ? 70 : 90;
  const chartSize = center * 2;
  const polygonPoints = toPolygonPoints(values, radius, center);

  return (
    <section className={`life-wheel ${compact ? "life-wheel--compact" : ""}`} aria-label="Life wheel">
      <div className="life-wheel__visual">
        <svg viewBox={`0 0 ${chartSize} ${chartSize}`} className="life-wheel__chart" role="img" aria-hidden="true">
          {[20, 40, 60, 80, 100].map((level) => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={(radius * level) / 100}
              className="life-wheel__grid-circle"
            />
          ))}
          {wheelOrder.map((key, index) => {
            const point = toAxisPoint(index, radius, center);
            return (
              <line
                key={key}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                className="life-wheel__axis-line"
              />
            );
          })}
          <polygon points={polygonPoints} className="life-wheel__shape" />
          {wheelOrder.map((key, index) => {
            const point = toAxisPoint(index, radius + (compact ? 18 : 24), center);
            const anchor = point.x > center + 5 ? "start" : point.x < center - 5 ? "end" : "middle";
            return (
              <text
                key={`${key}-label`}
                x={point.x}
                y={point.y}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="life-wheel__axis-label"
              >
                {labels[key]}
              </text>
            );
          })}
        </svg>
      </div>
      {!compact ? (
        <div className="life-wheel__sliders">
          {wheelOrder.map((key) => (
            <Slider
              key={key}
              min={1}
              max={10}
              step={1}
              showValue
              value={values[key]}
              label={labels[key]}
              onChange={(event) => onChange?.(key, Number(event.target.value))}
              disabled={readOnly}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
