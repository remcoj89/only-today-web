import { Card, Textarea } from "@/components/ui";
import type { ReflectionState } from "./types";
import "./ReflectionForm.css";

const FIELDS: Array<{ key: keyof ReflectionState; label: string }> = [
  { key: "whatWentWell", label: "Wat ging er goed?" },
  { key: "whyWentWell", label: "Waarom ging het goed?" },
  { key: "howToRepeat", label: "Hoe kan ik dit herhalen?" },
  { key: "whatWentWrong", label: "Wat ging er fout?" },
  { key: "whyWentWrong", label: "Waarom ging het fout?" },
  { key: "whatToChangeNextTime", label: "Wat doe ik volgende keer anders?" },
];

type ReflectionFormProps = {
  value: ReflectionState;
  readOnly: boolean;
  onChange: (next: ReflectionState) => void;
  errors?: Partial<Record<keyof ReflectionState, string>>;
};

export function ReflectionForm({ value, readOnly, onChange, errors = {} }: ReflectionFormProps) {
  return (
    <Card as="div" className="reflection-form">
      {FIELDS.map(({ key, label }) => (
        <Textarea
          key={key}
          label={label}
          value={value[key]}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          readOnly={readOnly}
          error={errors[key]}
          rows={3}
        />
      ))}
    </Card>
  );
}
