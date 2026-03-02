import { useState } from "react";
import { Card, Checkbox, Input } from "@/components/ui";
import { classNames } from "@/components/ui/classNames";
import type { OtherTaskState } from "./types";
import "./OtherTasksList.css";

function generateId(): string {
  return `other-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type OtherTasksListProps = {
  tasks: OtherTaskState[];
  readOnly: boolean;
  onChange: (next: OtherTaskState[]) => void;
};

export function OtherTasksList({ tasks, readOnly, onChange }: OtherTasksListProps) {
  const [expanded, setExpanded] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (!trimmed || readOnly) return;
    onChange([
      ...tasks,
      { id: generateId(), title: trimmed, completed: false },
    ]);
    setNewTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleToggle = (id: string, completed: boolean) => {
    if (readOnly) return;
    onChange(
      tasks.map((t) => (t.id === id ? { ...t, completed } : t)),
    );
  };

  const handleRemove = (id: string) => {
    if (readOnly) return;
    onChange(tasks.filter((t) => t.id !== id));
  };

  const handleTitleChange = (id: string, title: string) => {
    if (readOnly) return;
    onChange(
      tasks.map((t) => (t.id === id ? { ...t, title } : t)),
    );
  };

  return (
    <Card as="section" className="today-other-tasks">
      <button
        type="button"
        className="today-other-tasks__toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span>Overige taken</span>
        <span className={classNames("today-other-tasks__chevron", expanded && "today-other-tasks__chevron--open")}>
          ▼
        </span>
      </button>
      {expanded ? (
        <div className="today-other-tasks__body">
          <p className="today-other-tasks__hint">Parking lot voor taken zonder pomodoro&apos;s</p>
          <div className="today-other-tasks__add">
            <Input
              placeholder="Nieuwe taak toevoegen..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              readOnly={readOnly}
            />
            <button
              type="button"
              className="today-other-tasks__add-btn"
              onClick={handleAdd}
              disabled={readOnly || !newTitle.trim()}
            >
              Toevoegen
            </button>
          </div>
          <ul className="today-other-tasks__list">
            {tasks.map((task) => (
              <li key={task.id} className="today-other-tasks__item">
                <div className="today-other-tasks__item-row">
                  <Checkbox
                    label=""
                    checked={task.completed}
                    onChange={(e) => handleToggle(task.id, e.target.checked)}
                    disabled={readOnly}
                    aria-label="Voltooid"
                  />
                  <input
                    type="text"
                    className="today-other-tasks__item-input"
                    value={task.title}
                    onChange={(e) => handleTitleChange(task.id, e.target.value)}
                    readOnly={readOnly}
                    style={{ textDecoration: task.completed ? "line-through" : undefined }}
                  />
                  <button
                    type="button"
                    className="today-other-tasks__delete"
                    onClick={() => handleRemove(task.id)}
                    disabled={readOnly}
                    aria-label="Verwijderen"
                  >
                    Verwijderen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
