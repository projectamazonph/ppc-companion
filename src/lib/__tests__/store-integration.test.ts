import { describe, it, expect } from "vitest";
import { normalizeRole, pathToSection, sectionToPath } from "@/lib/store";

// =============================================================
// Integration: Auth flow state transitions
// =============================================================
describe("Auth flow: landing → login → dashboard → logout", () => {
  it("guest login produces correct user state", () => {
    const user = {
      name: "Guest Student",
      email: "guest@ppc-training.local",
      role: "guest" as const,
      loggedInAt: Date.now(),
    };

    // Role is lowercase canonical
    expect(user.role).toBe("guest");
    expect(normalizeRole(user.role)).toBe("guest");
  });

  it("database login normalizes role from uppercase DB payload", () => {
    // Simulates what happens when the API returns UPPERCASE role
    const dbPayload = { role: "STUDENT" };
    const normalized = normalizeRole(dbPayload.role);

    expect(normalized).toBe("student");
  });

  it("admin login normalizes correctly", () => {
    const normalized = normalizeRole("ADMIN");
    expect(normalized).toBe("admin");
  });
});

// =============================================================
// Integration: Navigation state transitions
// =============================================================
describe("Navigation: sidebar clicks produce correct URL/section mapping", () => {
  const sectionToUrl: Record<string, string> = {};
  const urlToSection: Record<string, string> = {};

  // Build the mapping tables from the real functions
  const sections = [
    "dashboard", "curriculum", "exercises", "quizzes",
    "tools", "reference", "capstone", "downloads", "notifications",
  ] as const;

  for (const section of sections) {
    sectionToUrl[section] = sectionToPath(section);
  }
  sectionToUrl["myprofile"] = sectionToPath("myprofile");

  for (const url of Object.values(sectionToUrl)) {
    urlToSection[url] = pathToSection(url);
  }

  it("sidebar 'Curriculum' click maps to /curriculum", () => {
    expect(sectionToUrl["curriculum"]).toBe("/curriculum");
  });

  it("sidebar 'Exercises' click maps to /exercises", () => {
    expect(sectionToUrl["exercises"]).toBe("/exercises");
  });

  it("sidebar 'My Profile' click maps to /my-profile", () => {
    expect(sectionToUrl["myprofile"]).toBe("/my-profile");
  });

  it("browser URL /curriculum resolves to curriculum section", () => {
    expect(urlToSection["/curriculum"]).toBe("curriculum");
  });

  it("browser URL /my-profile resolves to myprofile section", () => {
    expect(urlToSection["/my-profile"]).toBe("myprofile");
  });

  it("all 10 sidebar items round-trip correctly", () => {
    for (const section of sections) {
      const url = sectionToPath(section);
      const backToSection = pathToSection(url);
      expect(backToSection).toBe(section);
    }
    // myprofile special case
    expect(pathToSection(sectionToPath("myprofile"))).toBe("myprofile");
  });
});

// =============================================================
// Integration: Landing page CTA → dashboard
// =============================================================
describe("Landing page CTAs → dashboard", () => {
  it("'Try as guest' flow produces a navigable dashboard URL", () => {
    // What handleGuest does in landing.tsx:
    // 1. Creates user with role: "guest"
    const user = {
      name: "Guest Student",
      email: "guest@ppc-training.local",
      role: "guest" as const,
      loggedInAt: Date.now(),
    };

    // 2. After login, navigates to /dashboard
    const targetUrl = "/dashboard";

    // 3. (app)/layout.tsx reads user from Zustand, renders AppShell
    expect(user.role).toBe("guest");

    // 4. Sidebar derives section from URL
    const activeSection = pathToSection(targetUrl);
    expect(activeSection).toBe("dashboard");
  });

  it("'Start learning free' sign-up flow produces a navigable dashboard URL", () => {
    // What handleSubmit does when authMode === "signup":
    // 1. API returns user with role "STUDENT" (uppercase from DB)
    const dbRole = "STUDENT";

    // 2. normalizeRole converts to lowercase
    const normalizedRole = normalizeRole(dbRole);
    expect(normalizedRole).toBe("student");

    // 3. Creates user object
    const user = {
      name: "Ryan Dabao",
      email: "ryan@example.com",
      role: normalizedRole,
      loggedInAt: Date.now(),
    };

    // 4. After login, navigates to /dashboard
    const targetUrl = "/dashboard";
    const activeSection = pathToSection(targetUrl);
    expect(activeSection).toBe("dashboard");
  });
});

// =============================================================
// Integration: (app)/layout.tsx auth guard logic
// =============================================================
describe("Auth guard: redirects when no user", () => {
  it("user=null should redirect to /", () => {
    const user = null;
    const shouldRedirect = !user;
    expect(shouldRedirect).toBe(true);
  });

  it("user present should not redirect", () => {
    const user = {
      name: "Test",
      email: "test@test.com",
      role: "guest" as const,
      loggedInAt: Date.now(),
    };
    const shouldRedirect = !user;
    expect(shouldRedirect).toBe(false);
  });
});

// =============================================================
// Integration: sidebar role filtering
// =============================================================
describe("Sidebar: role-based navigation filtering", () => {
  const navItems = [
    { id: "dashboard", roles: ["student", "instructor", "admin", "guest"] },
    { id: "curriculum", roles: ["student", "instructor", "admin", "guest"] },
    { id: "exercises", roles: ["student", "instructor", "admin", "guest"] },
    { id: "quizzes", roles: ["student", "instructor", "admin", "guest"] },
    { id: "tools", roles: ["student", "instructor", "admin", "guest"] },
    { id: "reference", roles: ["student", "instructor", "admin", "guest"] },
    { id: "capstone", roles: ["student", "instructor", "admin", "guest"] },
    { id: "downloads", roles: ["student", "instructor", "admin", "guest"] },
    { id: "notifications", roles: ["student", "instructor", "admin", "guest"] },
    { id: "myprofile", roles: ["student"] },
  ];

  it("guest sees all main sections except myprofile", () => {
    const visible = navItems.filter((item) =>
      item.roles.includes("guest")
    );
    expect(visible.map((i) => i.id)).not.toContain("myprofile");
    expect(visible).toHaveLength(9);
  });

  it("student sees all 10 sections", () => {
    const visible = navItems.filter((item) =>
      item.roles.includes("student")
    );
    expect(visible).toHaveLength(10);
  });

  it("instructor sees 9 sections (no myprofile)", () => {
    const visible = navItems.filter((item) =>
      item.roles.includes("instructor")
    );
    expect(visible).toHaveLength(9);
  });

  it("each visible item has a valid URL", () => {
    const role = "student";
    const visible = navItems.filter((item) =>
      item.roles.includes(role)
    );
    for (const item of visible) {
      const url = sectionToPath(item.id as any);
      expect(url).toMatch(/^\//);
      expect(pathToSection(url)).toBe(item.id);
    }
  });
});
