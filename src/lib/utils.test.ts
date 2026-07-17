import { describe, it, expect } from "vitest";
import { getInitials, normalizeAnswer } from "@/lib/utils";

// =============================================================
// getInitials — defensive name → uppercase initials
// =============================================================

describe("getInitials", () => {
  it("returns '??' for null / undefined / empty / whitespace", () => {
    expect(getInitials(null)).toBe("??");
    expect(getInitials(undefined)).toBe("??");
    expect(getInitials("")).toBe("??");
    expect(getInitials("   ")).toBe("??");
  });

  it("takes the first two characters of a single-word name", () => {
    expect(getInitials("cher")).toBe("CH");
    expect(getInitials("Maria")).toBe("MA");
    expect(getInitials("  cher  ")).toBe("CH");
  });

  it("uses first letter of first and last word for multi-word names", () => {
    expect(getInitials("Maria Santos")).toBe("MS");
    expect(getInitials("Ryan Roland Dabao")).toBe("RD");
    expect(getInitials("  anna   r.   smith  ")).toBe("AS");
  });
});

// =============================================================
// normalizeAnswer — quiz/exercise answer comparison
// =============================================================

describe("normalizeAnswer", () => {
  it("returns empty string for null / undefined", () => {
    expect(normalizeAnswer(null)).toBe("");
    expect(normalizeAnswer(undefined)).toBe("");
  });

  it("lowercases input", () => {
    expect(normalizeAnswer("HELLO")).toBe("");
    // (only digits, dots, percent survive the strip pass)
    expect(normalizeAnswer("ABC123")).toBe("123");
  });

  it("keeps digits, dot, and percent — strips everything else", () => {
    expect(normalizeAnswer("15%")).toBe("15%");
    expect(normalizeAnswer("2.5")).toBe("2.5");
    expect(normalizeAnswer("$3.50")).toBe("3.50");
    expect(normalizeAnswer("12.34%")).toBe("12.34%");
  });

  it("strips letters, spaces, and punctuation", () => {
    expect(normalizeAnswer("twelve")).toBe("");
    expect(normalizeAnswer("1,000")).toBe("1000");
    expect(normalizeAnswer("~50%")).toBe("50%");
    expect(normalizeAnswer(" 10 ")).toBe("10");
  });
});