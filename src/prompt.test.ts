import { describe, it, expect } from "vitest";
import { parseConfirmAnswer } from "./prompt.js";

describe("parseConfirmAnswer", () => {
  it("returns defaultYes=true on empty input", () => {
    expect(parseConfirmAnswer("", true)).toBe(true);
  });

  it("returns defaultYes=false on empty input", () => {
    expect(parseConfirmAnswer("", false)).toBe(false);
  });

  it("returns defaultYes on whitespace-only input", () => {
    expect(parseConfirmAnswer("   ", true)).toBe(true);
    expect(parseConfirmAnswer("   ", false)).toBe(false);
  });

  it("returns true for y/yes regardless of default", () => {
    expect(parseConfirmAnswer("y", false)).toBe(true);
    expect(parseConfirmAnswer("Y", false)).toBe(true);
    expect(parseConfirmAnswer("yes", false)).toBe(true);
    expect(parseConfirmAnswer("YES", true)).toBe(true);
  });

  it("returns false for n/no regardless of default", () => {
    expect(parseConfirmAnswer("n", true)).toBe(false);
    expect(parseConfirmAnswer("N", true)).toBe(false);
    expect(parseConfirmAnswer("no", true)).toBe(false);
    expect(parseConfirmAnswer("NO", false)).toBe(false);
  });

  it("returns defaultYes for typos", () => {
    expect(parseConfirmAnswer("yse", true)).toBe(true);
    expect(parseConfirmAnswer("yse", false)).toBe(false);
    expect(parseConfirmAnswer("maybe", true)).toBe(true);
  });
});
