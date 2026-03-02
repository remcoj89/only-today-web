import { Card, Checkbox } from "@/components/ui";
import { trackEvent } from "@/lib/tracking";
import type { DayStartChecklistState } from "./types";
import "./DayStartChecklist.css";

type DayStartChecklistProps = {
  value: DayStartChecklistState;
  readOnly: boolean;
  onChange: (next: DayStartChecklistState) => void;
};

function ringProgress(value: DayStartChecklistState): number {
  const total = Object.values(value).filter(Boolean).length;
  return (total / 4) * 100;
}

export function DayStartChecklist({ value, readOnly, onChange }: DayStartChecklistProps) {
  const completed = Object.values(value).filter(Boolean).length;
  const progress = ringProgress(value);
  const handleChange = (next: DayStartChecklistState) => {
    const nextCompleted = Object.values(next).filter(Boolean).length;
    if (completed < 4 && nextCompleted === 4) {
      trackEvent("day_start_complete", { items_checked: 4 });
    }
    onChange(next);
  };

  return (
    <Card as="section" className="today-daystart">
      <div className="today-daystart__header">
        <h2 className="today-daystart__title">Dagstart</h2>
        <div className="today-daystart__ring" style={{ ["--progress" as string]: `${progress}%` }} aria-hidden="true">
          <span>{completed}/4</span>
        </div>
      </div>
      <div className="today-daystart__list">
        <Checkbox
          label="8 uur geslapen"
          checked={value.sleptEightHours}
          onChange={(event) => handleChange({ ...value, sleptEightHours: event.target.checked })}
          disabled={readOnly}
        />
        <Checkbox
          label="3 glazen water"
          checked={value.drankWater}
          onChange={(event) => handleChange({ ...value, drankWater: event.target.checked })}
          disabled={readOnly}
        />
        <Checkbox
          label="5 min meditatie"
          checked={value.meditation}
          onChange={(event) => handleChange({ ...value, meditation: event.target.checked })}
          disabled={readOnly}
        />
        <Checkbox
          label="5 min mobility"
          checked={value.mobility}
          onChange={(event) => handleChange({ ...value, mobility: event.target.checked })}
          disabled={readOnly}
        />
      </div>
      <p className="today-daystart__status">{completed === 4 ? "Compleet ✓" : `${completed} van 4`}</p>
    </Card>
  );
}

