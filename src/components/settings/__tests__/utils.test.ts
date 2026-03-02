import { describe, expect, it } from "vitest";
import { normalizeTime, toBackendTime, isValidTime } from "../utils";

describe("settings utils", () => {
  it("normalizes postgres time to HH:MM", () => {
    expect(normalizeTime("08:30:00")).toBe("08:30");
    expect(normalizeTime("22:59")).toBe("22:59");
  });

  it("validates HH:MM input", () => {
    expect(isValidTime("09:45")).toBe(true);
    expect(isValidTime("99:99")).toBe(false);
    expect(isValidTime("9:45")).toBe(false);
  });

  it("maps invalid times to null for backend payload", () => {
    expect(toBackendTime("10:00")).toBe("10:00");
    expect(toBackendTime("10:00:00")).toBeNull();
    expect(toBackendTime(null)).toBeNull();
  });
});
