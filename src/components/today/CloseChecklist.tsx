import { Card, Checkbox } from "@/components/ui";
import type { DayCloseChecklistState } from "./types";
import "./CloseChecklist.css";

type CloseChecklistProps = {
  value: DayCloseChecklistState;
  readOnly: boolean;
  onChange: (next: DayCloseChecklistState) => void;
};

export function CloseChecklist({ value, readOnly, onChange }: CloseChecklistProps) {
  return (
    <Card as="div" className="close-checklist">
      <Checkbox
        label="2 uur voor slapen geen scherm"
        checked={value.noScreensBeforeSleep}
        onChange={(e) => onChange({ ...value, noScreensBeforeSleep: e.target.checked })}
        disabled={readOnly}
      />
      <Checkbox
        label="3 uur voor slapen geen koolhydraten"
        checked={value.noCarbsBeforeSleep}
        onChange={(e) => onChange({ ...value, noCarbsBeforeSleep: e.target.checked })}
        disabled={readOnly}
      />
      <Checkbox
        label="Planning voor morgen gemaakt"
        checked={value.plannedTomorrow}
        onChange={(e) => onChange({ ...value, plannedTomorrow: e.target.checked })}
        disabled={readOnly}
      />
      <Checkbox
        label="Doelen bekeken"
        checked={value.reviewedGoals}
        onChange={(e) => onChange({ ...value, reviewedGoals: e.target.checked })}
        disabled={readOnly}
      />
    </Card>
  );
}
