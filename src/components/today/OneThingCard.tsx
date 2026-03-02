import { Card } from "@/components/ui";
import { TaskItem } from "./TaskItem";
import type { TaskState } from "./types";
import "./OneThingCard.css";

type OneThingCardProps = {
  task: TaskState;
  readOnly: boolean;
  onChange: (next: TaskState) => void;
  onStartPomodoro: () => void;
};

export function OneThingCard({ task, readOnly, onChange, onStartPomodoro }: OneThingCardProps) {
  const planned = task.pomodorosPlanned;

  return (
    <Card as="section" className="today-one-thing today-one-thing--accent">
      <div className="today-one-thing__header">
        <h2 className="today-one-thing__title">Je EEN</h2>
        <button
          type="button"
          className="today-one-thing__start"
          onClick={onStartPomodoro}
          disabled={readOnly || planned === 0}
        >
          Start Pomodoro
        </button>
      </div>
      <TaskItem
        task={task}
        variant="one"
        readOnly={readOnly}
        onChange={onChange}
      />
    </Card>
  );
}
