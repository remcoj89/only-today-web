import { useState, useMemo } from "react";
import { Button, Modal } from "@/components/ui";
import { CloseChecklist } from "./CloseChecklist";
import { DaySummary } from "./DaySummary";
import { ReflectionForm } from "./ReflectionForm";
import type { DayCloseState, DayPayload, ReflectionState } from "./types";
import "./DayCloseFlow.css";

function allReflectionFilled(reflection: ReflectionState): boolean {
  return (
    reflection.whatWentWell.trim() !== "" &&
    reflection.whyWentWell.trim() !== "" &&
    reflection.howToRepeat.trim() !== "" &&
    reflection.whatWentWrong.trim() !== "" &&
    reflection.whyWentWrong.trim() !== "" &&
    reflection.whatToChangeNextTime.trim() !== ""
  );
}

function getReflectionErrors(reflection: ReflectionState): Partial<Record<keyof ReflectionState, string>> {
  const keys: (keyof ReflectionState)[] = [
    "whatWentWell",
    "whyWentWell",
    "howToRepeat",
    "whatWentWrong",
    "whyWentWrong",
    "whatToChangeNextTime",
  ];
  const errors: Partial<Record<keyof ReflectionState, string>> = {};
  for (const key of keys) {
    if (!reflection[key].trim()) {
      errors[key] = "Verplicht veld";
    }
  }
  return errors;
}

type DayCloseFlowProps = {
  isOpen: boolean;
  payload: DayPayload;
  closeState: DayCloseState;
  readOnly: boolean;
  canClose: boolean;
  onClose: () => void;
  onChange: (next: DayCloseState) => void;
  onComplete: () => void;
};

const STEPS = ["checklist", "reflection", "summary"] as const;

export function DayCloseFlow({
  isOpen,
  payload,
  closeState,
  readOnly,
  canClose,
  onClose,
  onChange,
  onComplete,
}: DayCloseFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const reflectionErrors = useMemo(
    () => getReflectionErrors(closeState.reflection),
    [closeState.reflection],
  );
  const reflectionValid = allReflectionFilled(closeState.reflection);

  const handleNext = () => {
    if (step === "checklist") {
      setStepIndex(1);
    } else if (step === "reflection") {
      if (reflectionValid) {
        setStepIndex(2);
      }
    }
  };

  const handleComplete = () => {
    onComplete();
    setStepIndex(0);
  };

  const handleClose = () => {
    onClose();
    setStepIndex(0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Dag afronden"
    >
      <div className="day-close-flow">
        <p className="day-close-flow__step-indicator">
          Stap {stepIndex + 1} van 3
        </p>
        {!canClose && stepIndex === 0 ? (
          <p className="day-close-flow__warning">
            Vul Je EEN en alle DRIE in en markeer ze als voltooid om je dag af te ronden.
          </p>
        ) : null}
        {step === "checklist" && (
          <>
            <CloseChecklist
              value={closeState.checklist}
              readOnly={readOnly}
              onChange={(next) => onChange({ ...closeState, checklist: next })}
            />
            <div className="day-close-flow__footer">
              <Button variant="secondary" onClick={handleClose}>
                Annuleren
              </Button>
              <Button onClick={handleNext} disabled={!canClose || readOnly}>
                Volgende
              </Button>
            </div>
          </>
        )}
        {step === "reflection" && (
          <>
            <ReflectionForm
              value={closeState.reflection}
              readOnly={readOnly}
              onChange={(next) => onChange({ ...closeState, reflection: next })}
              errors={reflectionErrors}
            />
            <div className="day-close-flow__footer">
              <Button variant="secondary" onClick={() => setStepIndex(0)}>
                Terug
              </Button>
              <Button onClick={handleNext} disabled={!reflectionValid || readOnly}>
                Volgende
              </Button>
            </div>
          </>
        )}
        {step === "summary" && (
          <>
            <DaySummary payload={payload} onClose={handleComplete} />
          </>
        )}
      </div>
    </Modal>
  );
}
