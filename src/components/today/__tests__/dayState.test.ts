import { describe, expect, it } from "vitest";
import { canCloseDay, createDefaultDayPayload } from "../dayState";
import type { DayPayload } from "../types";

function logCheckboxStatus(payload: DayPayload): void {
  const oneThingOk = payload.oneThing.title.trim().length > 0 && payload.oneThing.completed;
  const topThreeStatus = payload.topThree.map((t, i) => ({
    task: i + 1,
    hasTitle: t.title.trim().length > 0,
    completed: t.completed,
    ok: t.title.trim().length > 0 && t.completed,
  }));
  const allTopThreeOk = topThreeStatus.every((s) => s.ok);

  console.log("canCloseDay checkbox status:", {
    oneThing: { hasTitle: payload.oneThing.title.trim().length > 0, completed: payload.oneThing.completed, ok: oneThingOk },
    topThree: topThreeStatus,
    allTopThreeOk,
    canClose: oneThingOk && allTopThreeOk,
  });
}

describe("canCloseDay", () => {
  it("returns false when oneThing has no title", () => {
    const payload = createDefaultDayPayload("2025-02-27");
    payload.oneThing.completed = true;
    payload.topThree.forEach((t) => {
      t.title = "Taak";
      t.completed = true;
    });
    logCheckboxStatus(payload);
    expect(canCloseDay(payload)).toBe(false);
  });

  it("returns false when oneThing is not completed", () => {
    const payload = createDefaultDayPayload("2025-02-27");
    payload.oneThing.title = "Mijn taak";
    payload.oneThing.completed = false;
    payload.topThree.forEach((t) => {
      t.title = "Taak";
      t.completed = true;
    });
    logCheckboxStatus(payload);
    expect(canCloseDay(payload)).toBe(false);
  });

  it("returns false when a topThree task has no title", () => {
    const payload = createDefaultDayPayload("2025-02-27");
    payload.oneThing.title = "Mijn taak";
    payload.oneThing.completed = true;
    payload.topThree[0].title = "Taak 1";
    payload.topThree[0].completed = true;
    payload.topThree[1].title = "";
    payload.topThree[1].completed = true;
    payload.topThree[2].title = "Taak 3";
    payload.topThree[2].completed = true;
    logCheckboxStatus(payload);
    expect(canCloseDay(payload)).toBe(false);
  });

  it("returns false when a topThree task is not completed", () => {
    const payload = createDefaultDayPayload("2025-02-27");
    payload.oneThing.title = "Mijn taak";
    payload.oneThing.completed = true;
    payload.topThree.forEach((t) => {
      t.title = "Taak";
      t.completed = false;
    });
    payload.topThree[1].completed = true;
    logCheckboxStatus(payload);
    expect(canCloseDay(payload)).toBe(false);
  });

  it("returns true when all required checkboxes are true", () => {
    const payload = createDefaultDayPayload("2025-02-27");
    payload.oneThing.title = "Mijn taak";
    payload.oneThing.completed = true;
    payload.topThree.forEach((t) => {
      t.title = "Taak";
      t.completed = true;
    });
    logCheckboxStatus(payload);
    expect(canCloseDay(payload)).toBe(true);
  });
});
