import { useCallback, useEffect, useRef, useState } from "react";
import { Card, Textarea } from "@/components/ui";
import type { MindsetState } from "./types";
import "./MindsetSection.css";

const DEBOUNCE_MS = 2000;

type MindsetSectionProps = {
  value: MindsetState;
  readOnly: boolean;
  onChange: (next: MindsetState) => void;
  gratitudeLabel: string;
  intentionLabel: string;
};

export function MindsetSection({
  value,
  readOnly,
  onChange,
  gratitudeLabel,
  intentionLabel,
}: MindsetSectionProps) {
  const [localGratitude, setLocalGratitude] = useState(value.gratitude);
  const [localIntention, setLocalIntention] = useState(value.intention);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onChange({
      gratitude: localGratitude,
      intention: localIntention,
    });
  }, [localGratitude, localIntention, onChange]);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(flush, DEBOUNCE_MS);
  }, [flush]);

  const handleGratitudeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalGratitude(e.target.value);
    scheduleSave();
  };

  const handleIntentionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalIntention(e.target.value);
    scheduleSave();
  };

  const handleBlur = () => {
    flush();
  };

  useEffect(() => {
    setLocalGratitude(value.gratitude);
    setLocalIntention(value.intention);
  }, [value.gratitude, value.intention]);

  return (
    <Card as="section" className="today-mindset today-mindset--accent">
      <h2 className="today-mindset__title">Mindset</h2>
      <Textarea
        placeholder={gratitudeLabel}
        value={localGratitude}
        onChange={handleGratitudeChange}
        onBlur={handleBlur}
        readOnly={readOnly}
        rows={2}
      />
      <Textarea
        placeholder={intentionLabel}
        value={localIntention}
        onChange={handleIntentionChange}
        onBlur={handleBlur}
        readOnly={readOnly}
        rows={2}
      />
    </Card>
  );
}
