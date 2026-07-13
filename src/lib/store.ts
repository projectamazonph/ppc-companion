"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  syncExerciseSubmission,
  syncQuizAttempt,
  syncCapstoneToggle,
  shouldSync,
} from "@/lib/sync";

// =============================================================
// Types
// =============================================================

export type Section =
  | "dashboard"
  | "curriculum"
  | "exercises"
  | "quizzes"
  | "tools"
  | "reference"
  | "capstone"
  | "students"
  | "myprofile"
  | "mystudents"
  | "cohorts"
  | "audit"
  | "notifications"
  | "admin-dashboard"
  | "downloads" | "pricing";

export type QuizResult = {
  quizId: string;
  score: number;
  total: number;
  answers: Record<string, string>;
  completedAt: number;
};

// Role identifiers — lowercase canonical, kept consistent across UI and store.
// The Prisma schema (DB) and JWT payloads may use uppercase; we normalize on
// hydration via `normalizeRole()`.
export type UserRole = "student" | "instructor" | "admin" | "guest";

/**
 * Normalize role strings from any source (DB, JWT, legacy localStorage) into
 * the canonical lowercase form. Tolerates "GUEST", "guest", " Guest ", etc.
 */
export function normalizeRole(raw: unknown): UserRole {
  if (typeof raw !== "string") return "guest";
  const v = raw.trim().toLowerCase();
  if (v === "admin") return "admin";
  if (v === "instructor") return "instructor";
  if (v === "student") return "student";
  return "guest";
}

export type User = {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  status?: "ACTIVE" | "PAUSED" | "GRADUATED" | "WITHDRAWN";
  cohort?: string | null;
  currentPhase?: number;
  targetAcos?: number;
  loggedInAt: number;
  phase1Pass?: boolean;
  phase2Pass?: boolean;
  phase3Pass?: boolean;
  phase4Pass?: boolean;
  capstoneDone?: boolean;
  serverProgress?: {
    phaseNumber: number;
    exercisesDone: number;
    exercisesTotal: number;
    quizScore: number | null;
    quizTotal: number;
    capstoneDone: boolean;
  }[];
};

export type AppState = {
  // Auth
  user: User | null;
  login: (user: User) => void;
  logout: () => void;

  // Navigation
  activeSection: Section;
  activeModuleId: string | null;
  activePhaseId: string | null;
  setSection: (s: Section) => void;
  setUser: (user: Partial<User>) => void;
  setActiveModule: (moduleId: string, phaseId: string) => void;

  // Exercise answers (free text)
  exerciseAnswers: Record<string, string>;
  setExerciseAnswer: (id: string, answer: string) => void;

  // Exercise decision selections (3.3A etc)
  decisionSelections: Record<string, string>;
  setDecisionSelection: (decisionId: string, optionId: string) => void;

  // Calculation exercise attempts
  calculationAnswers: Record<string, string>;
  setCalculationAnswer: (questionId: string, answer: string) => void;

  // Quiz results
  quizResults: Record<string, QuizResult>;
  setQuizResult: (result: QuizResult) => void;

  // Capstone deliverable completion
  capstoneCompleted: Record<string, boolean>;
  toggleCapstone: (id: string) => void;

  // Weekly checklist completion
  checklistCompleted: Record<string, boolean>;
  toggleChecklist: (id: string) => void;

  // Reset everything
  resetProgress: () => void;
};

// Helper to make a stable checklist item id
export const checklistItemId = (category: string, item: string) =>
  `${category}::${item.slice(0, 40)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => {
        // M3 FIX: Clear sensitive persisted data on logout
        set({ user: null, activeSection: "dashboard" });
        // Clear localStorage of persisted store data
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("ppc-companion-store");
        }
      },

      activeSection: "dashboard",
      activeModuleId: null,
      activePhaseId: null,
      setSection: (s) => set({ activeSection: s }),
      setUser: (u) => set((s) => ({ user: s.user ? { ...s.user, ...u } : (u as User) })),
      setActiveModule: (moduleId, phaseId) =>
        set({ activeModuleId: moduleId, activePhaseId: phaseId, activeSection: "curriculum" }),

      exerciseAnswers: {},
      setExerciseAnswer: (id, answer) => {
        set((state) => ({
          exerciseAnswers: { ...state.exerciseAnswers, [id]: answer },
        }));
        // M4 FIX: Add error logging for failed sync
        const user = get().user;
        if (user?.id && shouldSync()) {
          syncExerciseSubmission({
            studentId: user.id,
            exerciseCode: id,
            answer,
          }).catch((err) => console.error("[sync] exercise submission failed:", err));
        }
      },

      decisionSelections: {},
      setDecisionSelection: (decisionId, optionId) =>
        set((state) => ({
          decisionSelections: { ...state.decisionSelections, [decisionId]: optionId },
        })),

      calculationAnswers: {},
      setCalculationAnswer: (questionId, answer) =>
        set((state) => ({
          calculationAnswers: { ...state.calculationAnswers, [questionId]: answer },
        })),

      quizResults: {},
      setQuizResult: (result) => {
        set((state) => ({
          quizResults: { ...state.quizResults, [result.quizId]: result },
        }));
        const user = get().user;
        if (user?.id && shouldSync()) {
          syncQuizAttempt({
            studentId: user.id,
            quizLocalId: result.quizId,
            result,
          }).catch((err) => console.error("[sync] quiz attempt failed:", err));
        }
      },

      capstoneCompleted: {},
      toggleCapstone: (id) => {
        set((state) => ({
          capstoneCompleted: {
            ...state.capstoneCompleted,
            [id]: !state.capstoneCompleted[id],
          },
        }));
        const user = get().user;
        if (user?.id && shouldSync()) {
          syncCapstoneToggle({
            studentId: user.id,
            capstoneId: id,
            completed: !get().capstoneCompleted[id],
          }).catch((err) => console.error("[sync] capstone toggle failed:", err));
        }
      },

      checklistCompleted: {},
      toggleChecklist: (id) =>
        set((state) => ({
          checklistCompleted: {
            ...state.checklistCompleted,
            [id]: !state.checklistCompleted[id],
          },
        })),

      resetProgress: () =>
        set({
          exerciseAnswers: {},
          decisionSelections: {},
          calculationAnswers: {},
          quizResults: {},
          capstoneCompleted: {},
          checklistCompleted: {},
        }),
    }),
    {
      name: "ppc-companion-store",
      partialize: (state) => ({
        user: state.user,
        activeSection: state.activeSection,
        activeModuleId: state.activeModuleId,
        activePhaseId: state.activePhaseId,
        exerciseAnswers: state.exerciseAnswers,
        decisionSelections: state.decisionSelections,
        calculationAnswers: state.calculationAnswers,
        quizResults: state.quizResults,
        capstoneCompleted: state.capstoneCompleted,
        checklistCompleted: state.checklistCompleted,
      }),
    }
  )
);


// =============================================================
// Path ↔ Section mapping (URL routing)
// =============================================================

/** Map a URL path (e.g. "/curriculum") to the Section enum. */
export function pathToSection(path: string | null | undefined): Section {
  if (!path) return "dashboard";
  const cleaned = path.replace(/^\/+/, "").toLowerCase();
  // my-profile URL ↔ myprofile enum
  if (cleaned === "my-profile") return "myprofile";
  const allowed: Section[] = [
    "dashboard",
    "curriculum",
    "exercises",
    "quizzes",
    "tools",
    "reference",
    "capstone",
    "students",
    "myprofile",
    "mystudents",
    "cohorts",
    "audit",
    "notifications",
    "admin-dashboard",
    "downloads",
    "pricing",
  ];
  return (allowed as string[]).includes(cleaned)
    ? (cleaned as Section)
    : "dashboard";
}

/** Map a Section enum to a URL path. */
export function sectionToPath(s: Section): string {
  if (s === "myprofile") return "/my-profile";
  return `/${s}`;
}

// =============================================================
// Derived helpers
// =============================================================
export function useProgressStats() {
  const {
    exerciseAnswers,
    decisionSelections,
    calculationAnswers,
    quizResults,
    capstoneCompleted,
    checklistCompleted,
  } = useAppStore();
  const exercisesAttempted = Object.values(exerciseAnswers).filter(
    (a) => a && a.trim().length > 0
  ).length;
  const capstoneDone = Object.values(capstoneCompleted).filter(Boolean).length;
  const checklistDone = Object.values(checklistCompleted).filter(Boolean).length;
  const quizScores = Object.values(quizResults);
  const totalCorrect = quizScores.reduce((s, r) => s + r.score, 0);
  const totalQuestions = quizScores.reduce((s, r) => s + r.total, 0);
  return {
    exercisesAttempted,
    decisionSelections: Object.keys(decisionSelections).length,
    calculationAnswers: Object.keys(calculationAnswers).length,
    capstoneDone,
    capstoneTotal: 5,
    checklistDone,
    totalCorrect,
    totalQuestions,
    quizzesTaken: quizScores.length,
    quizzesTotal: 4,
  };
}
