import { useEffect, useMemo, useRef } from "react";
import { Button, Modal } from "@/components/ui";
import { usePomodoro } from "@/hooks/usePomodoro";
import { trackEvent } from "@/lib/tracking";
import "./PomodoroTimer.css";

type PomodoroTimerProps = {
  isOpen: boolean;
  taskName: string;
  pomodorosDone: number;
  pomodorosPlanned: number;
  taskType?: "one" | "three";
  onClose: () => void;
  onFocusCompleted: () => void;
};

export function PomodoroTimer({
  isOpen,
  taskName,
  pomodorosDone,
  pomodorosPlanned,
  taskType = "one",
  onClose,
  onFocusCompleted,
}: PomodoroTimerProps) {
  const pomodoro = usePomodoro();
  const trackedPomodoroNumberRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      pomodoro.stop();
      trackedPomodoroNumberRef.current = 0;
    }
  }, [isOpen, pomodoro]);

  useEffect(() => {
    if (pomodoro.state === "break" && pomodoro.pomodoroNumber > trackedPomodoroNumberRef.current) {
      trackedPomodoroNumberRef.current = pomodoro.pomodoroNumber;
      trackEvent("pomodoro_completed", { task_type: taskType, duration: 25 });
      onFocusCompleted();
    }
  }, [onFocusCompleted, pomodoro.pomodoroNumber, pomodoro.state, taskType]);

  const timerProgress = useMemo(() => {
    const full = pomodoro.state === "break" ? 5 * 60 : 25 * 60;
    return Math.max(0, Math.min(100, (pomodoro.secondsLeft / full) * 100));
  }, [pomodoro.secondsLeft, pomodoro.state]);

  const isRunning = pomodoro.state === "running" || pomodoro.state === "break";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Pomodoro timer"
      footer={
        <div className="today-pomodoro__actions">
          {isRunning ? (
            <Button variant="secondary" onClick={pomodoro.pause}>
              Pauze
            </Button>
          ) : null}
          {pomodoro.state === "paused" ? <Button onClick={pomodoro.resume}>Hervat</Button> : null}
          {(pomodoro.state === "idle" || pomodoro.state === "completed") && (
            <Button
              onClick={() => {
                pomodoro.start(taskName);
                trackEvent("pomodoro_started", { task_type: taskType });
              }}
            >
              Start
            </Button>
          )}
          <Button variant="ghost" onClick={pomodoro.stop}>
            Stop
          </Button>
        </div>
      }
    >
      <div className={`today-pomodoro ${isRunning ? "today-pomodoro--running" : ""}`}>
        <div className="today-pomodoro__ring" style={{ ["--progress" as string]: `${timerProgress}%` }}>
          <span className="today-pomodoro__time">{pomodoro.formattedTime}</span>
        </div>
        <p className="today-pomodoro__task">{taskName}</p>
        <p className="today-pomodoro__counter">
          Pomodoro {Math.max(1, pomodoro.pomodoroNumber || pomodorosDone + 1)}/{Math.max(1, pomodorosPlanned)} voor{" "}
          {taskName}
        </p>
      </div>
    </Modal>
  );
}

