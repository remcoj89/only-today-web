import { Spinner, Modal } from "@/components/ui";
import type { DayPayload } from "@/components/today/types";
import "./DayDetailModal.css";

type DayDetailModalProps = {
  isOpen: boolean;
  dateKey: string | null;
  payload: DayPayload | null;
  loading: boolean;
  error: string | null;
  title: string;
  onClose: () => void;
  labels: {
    loading: string;
    empty: string;
    dayStart: string;
    mindset: string;
    oneAndThree: string;
    lifePillars: string;
    reflection: string;
    score: string;
    notFilled: string;
  };
};

function countTrue(values: boolean[]): number {
  return values.filter(Boolean).length;
}

export function DayDetailModal({
  isOpen,
  dateKey,
  payload,
  loading,
  error,
  title,
  onClose,
  labels,
}: DayDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="day-detail-modal">
        {loading ? (
          <div className="day-detail-modal__loading">
            <Spinner size="md" />
            <p>{labels.loading}</p>
          </div>
        ) : null}

        {!loading && error ? (
          <p className="day-detail-modal__error" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error && !payload ? <p>{labels.empty}</p> : null}

        {!loading && !error && payload ? (
          <>
            <section className="day-detail-modal__section">
              <h4>{labels.dayStart}</h4>
              <p>
                {labels.score}: {countTrue(Object.values(payload.dayStart))}/4
              </p>
            </section>

            <section className="day-detail-modal__section">
              <h4>{labels.mindset}</h4>
              <p>{payload.mindset.gratitude.trim() || labels.notFilled}</p>
              <p>{payload.mindset.intention.trim() || labels.notFilled}</p>
            </section>

            <section className="day-detail-modal__section">
              <h4>{labels.oneAndThree}</h4>
              <p>{payload.oneThing.title.trim() || labels.notFilled}</p>
              <ul className="day-detail-modal__list">
                {payload.topThree.map((task) => (
                  <li key={task.id}>{task.title.trim() || labels.notFilled}</li>
                ))}
              </ul>
            </section>

            <section className="day-detail-modal__section">
              <h4>{labels.lifePillars}</h4>
              <p>
                {labels.score}: {countTrue(Object.values(payload.lifePillars))}/4
              </p>
            </section>

            <section className="day-detail-modal__section">
              <h4>{labels.reflection}</h4>
              <ul className="day-detail-modal__list">
                <li>{payload.dayClose.reflection.whatWentWell.trim() || labels.notFilled}</li>
                <li>{payload.dayClose.reflection.whyWentWell.trim() || labels.notFilled}</li>
                <li>{payload.dayClose.reflection.howToRepeat.trim() || labels.notFilled}</li>
                <li>{payload.dayClose.reflection.whatWentWrong.trim() || labels.notFilled}</li>
                <li>{payload.dayClose.reflection.whyWentWrong.trim() || labels.notFilled}</li>
                <li>{payload.dayClose.reflection.whatToChangeNextTime.trim() || labels.notFilled}</li>
              </ul>
            </section>
          </>
        ) : null}

        {dateKey ? <p className="day-detail-modal__meta">{dateKey}</p> : null}
      </div>
    </Modal>
  );
}
