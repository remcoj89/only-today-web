import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { POMODORO_BREAK_SECONDS, POMODORO_DURATION_SECONDS } from "@/lib/constants";

export type PomodoroState = "idle" | "running" | "paused" | "break" | "completed";

type UsePomodoroOptions = {
  focusSeconds?: number;
  breakSeconds?: number;
};

function formatSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

async function notify(title: string, body: string): Promise<void> {
  if (!("Notification" in window)) {
    return;
  }
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

export function usePomodoro(options: UsePomodoroOptions = {}) {
  const focusSeconds = options.focusSeconds ?? POMODORO_DURATION_SECONDS;
  const breakSeconds = options.breakSeconds ?? POMODORO_BREAK_SECONDS;

  const [state, setState] = useState<PomodoroState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(focusSeconds);
  const [taskLabel, setTaskLabel] = useState<string | null>(null);
  const [pomodoroNumber, setPomodoroNumber] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (task?: string) => {
      setTaskLabel(task ?? null);
      setState("running");
      setSecondsLeft(focusSeconds);
      setPomodoroNumber((current) => current + 1);
    },
    [focusSeconds],
  );

  const pause = useCallback(() => {
    setState((current) => (current === "running" ? "paused" : current));
  }, []);

  const resume = useCallback(() => {
    setState((current) => (current === "paused" ? "running" : current));
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setState("idle");
    setSecondsLeft(focusSeconds);
    setTaskLabel(null);
  }, [clearTimer, focusSeconds]);

  useEffect(() => {
    clearTimer();

    if (state !== "running" && state !== "break") {
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((current) => current - 1);
    }, 1_000);

    return clearTimer;
  }, [clearTimer, state]);

  useEffect(() => {
    if (secondsLeft > 0) {
      return;
    }

    if (state === "running") {
      void notify("Pomodoro afgerond", "Goed gedaan. Tijd voor 5 minuten pauze.");
      setState("break");
      setSecondsLeft(breakSeconds);
      return;
    }

    if (state === "break") {
      void notify("Pauze afgerond", "Klaar voor de volgende focusblok.");
      setState("completed");
      setSecondsLeft(0);
    }
  }, [breakSeconds, secondsLeft, state]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return useMemo(
    () => ({
      state,
      secondsLeft,
      formattedTime: formatSeconds(secondsLeft),
      taskLabel,
      pomodoroNumber,
      start,
      pause,
      resume,
      stop,
    }),
    [pause, pomodoroNumber, resume, secondsLeft, start, state, stop, taskLabel],
  );
}
