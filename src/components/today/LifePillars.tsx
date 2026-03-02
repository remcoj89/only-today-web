import { Card, Checkbox, Input } from "@/components/ui";
import { trackEvent } from "@/lib/tracking";
import type { LifePillarsState } from "./types";
import "./LifePillars.css";

type LifePillarsProps = {
  value: LifePillarsState;
  readOnly: boolean;
  onChange: (next: LifePillarsState) => void;
};

type PillarKey = keyof LifePillarsState;

const pillarEntries: Array<{ key: PillarKey; label: string; emoji: string }> = [
  { key: "training", label: "Training", emoji: "🏋️" },
  { key: "deepRelaxation", label: "Diepe ontspanning", emoji: "🧘" },
  { key: "healthyFood", label: "Gezonde voeding", emoji: "🥗" },
  { key: "realConnection", label: "Echte verbinding", emoji: "💬" },
];

export function LifePillars({ value, readOnly, onChange }: LifePillarsProps) {
  const completed = pillarEntries.filter((p) => value[p.key].completed).length;
  return (
    <Card as="section" className="today-pillars">
      <div className="today-pillars__header">
        <h2 className="today-pillars__title">Levenszagen</h2>
        <p className="today-pillars__progress">{completed} van 4 pijlers</p>
      </div>
      <div className="today-pillars__grid">
        {pillarEntries.map((pillar) => {
          const item = value[pillar.key];
          const isCompleted = item.completed;
          return (
            <div
              key={pillar.key}
              className={`today-pillars__card ${isCompleted ? "today-pillars__card--active" : ""}`}
            >
              <div className="today-pillars__card-header">
                <span className="today-pillars__emoji">{pillar.emoji}</span>
                <span className="today-pillars__label">{pillar.label}</span>
              </div>
              <div className="today-pillars__card-body">
                <Input
                  label=""
                  placeholder="Wat ga je doen?"
                  value={item.task}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      [pillar.key]: { ...item, task: event.target.value },
                    })
                  }
                  disabled={readOnly}
                  className="today-pillars__input"
                />
                <Checkbox
                  label="Afgevinkt"
                  checked={item.completed}
                  onChange={(event) => {
                    const nextCompleted = event.target.checked;
                    onChange({
                      ...value,
                      [pillar.key]: { ...item, completed: nextCompleted },
                    });
                    if (nextCompleted) {
                      trackEvent("pillar_checked", { pillar_name: pillar.key });
                    }
                  }}
                  disabled={readOnly}
                  className="today-pillars__checkbox"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
