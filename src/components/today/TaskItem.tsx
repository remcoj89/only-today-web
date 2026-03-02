import { Checkbox } from "@/components/ui";
import { classNames } from "@/components/ui/classNames";
import type { TaskState } from "./types";
import "./TaskItem.css";

const MAX_POMODOROS = 6;

type TaskItemProps = {
  heading?: string;
  task: TaskState;
  variant: "one" | "three";
  readOnly: boolean;
  onChange: (next: TaskState) => void;
};

export function TaskItem({ heading, task, variant, readOnly, onChange }: TaskItemProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...task, title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...task, description: e.target.value });
  };

  const handleCompletedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...task, completed: e.target.checked });
  };

  const handleTomatoClick = (index: number) => {
    if (readOnly) return;
    const planned = index + 1;
    const done = Math.min(task.pomodorosDone, planned);
    onChange({
      ...task,
      pomodorosPlanned: planned,
      pomodorosDone: done,
    });
  };

  const planned = Math.min(MAX_POMODOROS, Math.max(0, task.pomodorosPlanned));
  const done = Math.min(planned, Math.max(0, task.pomodorosDone));

  return (
    <div className={classNames("task-item", `task-item--${variant}`)}>
      {heading ? <h3 className="task-item__heading">{heading}</h3> : null}
      <input
        type="text"
        className="task-item__title-input"
        placeholder="Titel"
        value={task.title}
        onChange={handleTitleChange}
        readOnly={readOnly}
        aria-label="Taak titel"
      />
      <textarea
        className="task-item__description"
        placeholder="Omschrijving (optioneel)"
        value={task.description}
        onChange={handleDescriptionChange}
        readOnly={readOnly}
        rows={2}
        aria-label="Taak omschrijving"
      />
      <div className="task-item__pomodoro-groups">
        <div className="task-item__pomodoro-row">
          <span className="task-item__pomodoro-label">Pomodoro&apos;s</span>
          <div className="task-item__tomato-list">
            {Array.from({ length: MAX_POMODOROS }, (_, i) => {
              const isPlanned = i < planned;
              const isDone = i < done;
              const isActive = isPlanned;
              return (
                <button
                  key={i}
                  type="button"
                  className={classNames(
                    "task-item__tomato",
                    isPlanned && "task-item__tomato--planned",
                    isDone && "task-item__tomato--done",
                    isActive && "task-item__tomato--active",
                  )}
                  onClick={() => handleTomatoClick(i)}
                  disabled={readOnly}
                  aria-label={`Pomodoro ${i + 1}: ${isDone ? "voltooid" : isPlanned ? "gepland" : "niet gepland"}`}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="task-item__footer">
        <Checkbox
          label="Voltooid"
          checked={task.completed}
          onChange={handleCompletedChange}
          disabled={readOnly}
        />
        {planned > 0 ? (
          <p className="task-item__status">
            {done} van {planned} pomodoro&apos;s voltooid
          </p>
        ) : null}
      </div>
    </div>
  );
}
