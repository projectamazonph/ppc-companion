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
  | "students"        // admin-only: full CRUD student management
  | "myprofile"      // student: their own profile + activity
  | "mystudents"     // instructor: their cohort students + grading
  | "cohorts"        // instructor+admin: cohort management
  | "audit"          // admin-only: audit log
  | "notifications"  // everyone: notification center
  | "admin-dashboard" // admin-only: aggregate overview
  | "downloads" | "pricing";     // everyone: downloadable templates and resources

export type QuizResult = {
  quizId: string;
  score: number; // number correct
  total: number;
  answers: Record<string, string>; // questionId -> answer
  completedAt: number;
};

export type User = {
  id?: string; // present when backed by a DB record
  name: string;
  email: string;
  role: "student" | "instructor" | "admin" | "guest";
  status?: "ACTIVE" | "PAUSED" | "GRADUATED" | "WITHDRAWN";
  cohort?: string | null;
  currentPhase?: number;
  targetAcos?: number;
  loggedInAt: number;
  // Phase checkpoint pass flags (set by quiz submission)
  phase1Pass?: boolean;
  phase2Pass?: boolean;
  phase3Pass?: boolean;
  phase4Pass?: boolean;
  capstoneDone?: boolean;
  // Server-fetched progress (per phase) — distinct from local progress
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
  exerciseAnswers: Record<string, string>; // exerciseId -> answer
  setExerciseAnswer: (id: string, answer: string) => void;

  // Exercise decision selections (3.3A etc)
  decisionSelections: Record<string, string>; // decisionId -> optionId
  setDecisionSelection: (decisionId: string, optionId: string) => void;

  // Calculation exercise attempts
  calculationAnswers: Record<string, string>; // questionId -> user answer
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
      logout: () => set({ user: null, activeSection: "dashboard" }),

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
        // Fire-and-forget sync to backend
        const user = get().user;
        if (shouldSync(user) && answer && answer.trim().length > 0) {
          syncExerciseSubmission({
            studentId: user.id,
            exerciseCode: id,
            answer,
            status: "SUBMITTED",
          });
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
        // Fire-and-forget sync to backend
        const user = get().user;
        if (shouldSync(user)) {
          syncQuizAttempt({
            studentId: user.id,
            quizLocalId: result.quizId,
            result,
          });
        }
      },

      capstoneCompleted: {},
      toggleCapstone: (id) => {
        const state = get();
        const newCompleted = !state.capstoneCompleted[id];
        set((state) => ({
          capstoneCompleted: {
            ...state.capstoneCompleted,
            [id]: newCompleted,
          },
        }));
        // Fire-and-forget sync to backend
        const user = get().user;
        if (shouldSync(user)) {
          syncCapstoneToggle({
            studentId: user.id,
            deliverableId: id,
            completed: newCompleted,
          });
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
      name: "ppc-training-progress",
    }
  )
);

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

  // Count completed exercises (any answer length > 0 counts as attempted)
  const exercisesAttempted = Object.values(exerciseAnswers).filter(
    (a) => a && a.trim().length > 0
  ).length;

  // Count capstone deliverables
  const capstoneDone = Object.values(capstoneCompleted).filter(Boolean).length;

  // Count checklist items
  const checklistDone = Object.values(checklistCompleted).filter(Boolean).length;

  // Quiz scores
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
