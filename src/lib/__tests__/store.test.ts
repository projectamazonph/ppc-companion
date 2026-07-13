import { describe, it, expect } from "vitest";
import { normalizeRole, pathToSection, sectionToPath } from "@/lib/store";

// =============================================================
// normalizeRole
// =============================================================
describe("normalizeRole", () => {
  it("normalizes uppercase GUEST to lowercase guest", () => {
    expect(normalizeRole("GUEST")).toBe("guest");
  });

  it("normalizes mixed-case Student to lowercase student", () => {
    expect(normalizeRole("Student")).toBe("student");
  });

  it("normalizes UPPERCASE ADMIN to lowercase admin", () => {
    expect(normalizeRole("ADMIN")).toBe("admin");
  });

  it("normalizes INSTRUCTOR to instructor", () => {
    expect(normalizeRole("INSTRUCTOR")).toBe("instructor");
  });

  it("returns guest for unknown role strings", () => {
    expect(normalizeRole("unknown")).toBe("guest");
  });

  it("returns guest for null/undefined input", () => {
    expect(normalizeRole(null)).toBe("guest");
    expect(normalizeRole(undefined)).toBe("guest");
  });

  it("trims whitespace", () => {
    expect(normalizeRole("  GUEST  ")).toBe("guest");
  });
});

// =============================================================
// pathToSection
// =============================================================
describe("pathToSection", () => {
  it("maps /dashboard to dashboard", () => {
    expect(pathToSection("/dashboard")).toBe("dashboard");
  });

  it("maps /curriculum to curriculum", () => {
    expect(pathToSection("/curriculum")).toBe("curriculum");
  });

  it("maps /exercises to exercises", () => {
    expect(pathToSection("/exercises")).toBe("exercises");
  });

  it("maps /my-profile to myprofile enum", () => {
    expect(pathToSection("/my-profile")).toBe("myprofile");
  });

  it("maps root / to dashboard", () => {
    expect(pathToSection("/")).toBe("dashboard");
  });

  it("maps null to dashboard", () => {
    expect(pathToSection(null)).toBe("dashboard");
  });

  it("maps undefined to dashboard", () => {
    expect(pathToSection(undefined)).toBe("dashboard");
  });

  it("maps unknown paths to dashboard", () => {
    expect(pathToSection("/nonexistent")).toBe("dashboard");
  });

  it("is case insensitive", () => {
    expect(pathToSection("/Curriculum")).toBe("curriculum");
  });

  it("handles paths without leading slash", () => {
    expect(pathToSection("dashboard")).toBe("dashboard");
  });
});

// =============================================================
// sectionToPath
// =============================================================
describe("sectionToPath", () => {
  it("maps dashboard to /dashboard", () => {
    expect(sectionToPath("dashboard")).toBe("/dashboard");
  });

  it("maps curriculum to /curriculum", () => {
    expect(sectionToPath("curriculum")).toBe("/curriculum");
  });

  it("maps exercises to /exercises", () => {
    expect(sectionToPath("exercises")).toBe("/exercises");
  });

  it("maps myprofile to /my-profile", () => {
    expect(sectionToPath("myprofile")).toBe("/my-profile");
  });

  it("maps capstone to /capstone", () => {
    expect(sectionToPath("capstone")).toBe("/capstone");
  });

  it("maps downloads to /downloads", () => {
    expect(sectionToPath("downloads")).toBe("/downloads");
  });

  it("maps notifications to /notifications", () => {
    expect(sectionToPath("notifications")).toBe("/notifications");
  });

  it("maps tools to /tools", () => {
    expect(sectionToPath("tools")).toBe("/tools");
  });

  it("maps reference to /reference", () => {
    expect(sectionToPath("reference")).toBe("/reference");
  });

  it("maps quizzes to /quizzes", () => {
    expect(sectionToPath("quizzes")).toBe("/quizzes");
  });
});

// =============================================================
// Round-trip: sectionToPath → pathToSection
// =============================================================
describe("round-trip mapping", () => {
  const sections = [
    "dashboard",
    "curriculum",
    "exercises",
    "quizzes",
    "tools",
    "reference",
    "capstone",
    "downloads",
    "notifications",
  ] as const;

  for (const section of sections) {
    it(`round-trips ${section} through pathToSection(sectionToPath(...))`, () => {
      const path = sectionToPath(section);
      expect(pathToSection(path)).toBe(section);
    });
  }

  it("round-trips myprofile through the my-profile special case", () => {
    const path = sectionToPath("myprofile");
    expect(path).toBe("/my-profile");
    expect(pathToSection(path)).toBe("myprofile");
  });
});
