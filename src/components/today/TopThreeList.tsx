import { Card } from "@/components/ui";
import { TaskItem } from "./TaskItem";
import type { TaskState } from "./types";
import "./TopThreeList.css";

type TopThreeListProps = {
  tasks: TaskState[];
  readOnly: boolean;
  onChange: (next: TaskState[]) => void;
  onStartPomodoro: (taskIndex: number) => void;
};

export function TopThreeList({ tasks, readOnly, onChange, onStartPomodoro }: TopThreeListProps) {
  return (
    <Card as="section" className="today-top-three">
      <h2 className="today-top-three__title">Je DRIE</h2>
      <div className="today-top-three__list">
        {tasks.map((task, index) => (
          <div key={task.id} className="today-top-three__item">
            <TaskItem
              heading={`Taak ${index + 1}`}
              task={task}
              variant="three"
              readOnly={readOnly}
              onChange={(nextTask) => {
                const clone = [...tasks];
                clone[index] = nextTask;
                onChange(clone);
              }}
            />
            <button
              type="button"
              className="today-top-three__start"
              onClick={() => onStartPomodoro(index)}
              disabled={readOnly || task.pomodorosPlanned === 0}
            >
              Start Pomodoro
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

