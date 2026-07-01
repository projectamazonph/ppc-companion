"use client";

// ============================================================================
// Backend sync helpers
// ----------------------------------------------------------------------------
// These fire-and-forget helpers write to the API when a logged-in student
// does something (saves an exercise answer, submits a quiz, toggles a
// capstone deliverable). They fail silently so the UI never blocks on
// network issues — the localStorage state remains the source of truth
// for the student's own view, and the backend gets a copy for instructors.
// ============================================================================

import type { QuizResult } from "@/lib/store";

// Resolve an exercise code (e.g. "1.1A") to a DB exercise ID by hitting the API.
// Cached in-memory after first lookup.
const exerciseIdCache = new Map<string, string>();

async function resolveExerciseId(code: string): Promise<string | null> {
  if (exerciseIdCache.has(code)) return exerciseIdCache.get(code)!;
  try {
    const res = await fetch(`/api/exercises?moduleCode=&q=${encodeURIComponent(code)}`);
    if (!res.ok) return null;
    // The /api/exercises endpoint doesn't have a `q` filter, so let's filter client-side
    const data = await res.json();
    const match = data.exercises?.find((e: any) => e.code === code);
    if (match) {
      exerciseIdCache.set(code, match.id);
      return match.id;
    }
  } catch {
    // silent fail
  }
  return null;
}

// Resolve a quiz by module code (we use module codes like "2.3" as quiz IDs in
// the localStorage layer via `phase.checkpoint.id` which is "phase1-checkpoint" etc.)
const quizIdCache = new Map<string, { quizId: string; moduleId: string }>();

async function resolveQuizId(quizLocalId: string): Promise<{ quizId: string; moduleId: string } | null> {
  if (quizIdCache.has(quizLocalId)) return quizIdCache.get(quizLocalId)!;
  try {
    const res = await fetch(`/api/quizzes?withQuestions=false`);
    if (!res.ok) return null;
    const data = await res.json();
    // Map by phase number — the local quiz IDs are "phase1-checkpoint" ... "phase4-checkpoint"
    const phaseMatch = quizLocalId.match(/^phase(\d+)-checkpoint$/);
    if (!phaseMatch) return null;
    const phaseNum = parseInt(phaseMatch[1], 10);
    const match = data.quizzes?.find((q: any) => q.module?.phaseNumber === phaseNum);
    if (match) {
      const result = { quizId: match.id, moduleId: match.moduleId };
      quizIdCache.set(quizLocalId, result);
      return result;
    }
  } catch {
    // silent fail
  }
  return null;
}

// ============================================================================
// Public sync functions
// ============================================================================

export async function syncExerciseSubmission(opts: {
  studentId: string;
  exerciseCode: string;
  answer: string;
  status?: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED";
  score?: number;
}) {
  try {
    const exerciseId = await resolveExerciseId(opts.exerciseCode);
    if (!exerciseId) return; // exercise not in DB (probably an old one)
    await fetch("/api/exercises/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: opts.studentId,
        exerciseId,
        answer: opts.answer,
        status: opts.status ?? "SUBMITTED",
        score: opts.score,
      }),
    });
  } catch {
    // silent fail — localStorage still has the answer
  }
}

export async function syncQuizAttempt(opts: {
  studentId: string;
  quizLocalId: string;
  result: QuizResult;
  durationSec?: number;
}) {
  try {
    const resolved = await resolveQuizId(opts.quizLocalId);
    if (!resolved) return;
    await fetch("/api/quizzes/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: opts.studentId,
        quizId: resolved.quizId,
        score: opts.result.score,
        total: opts.result.total,
        answers: opts.result.answers,
        durationSec: opts.durationSec,
      }),
    });
  } catch {
    // silent fail
  }
}

export async function syncCapstoneToggle(opts: {
  studentId: string;
  deliverableId: string;
  completed: boolean;
}) {
  try {
    // Map deliverable IDs to capstone fields
    const fieldMap: Record<string, string> = {
      "cap-1": "keywordResearch",
      "cap-2": "campaignBlueprint",
      "cap-3": "launchPlan",
      "cap-4": "optimizationReport",
      "cap-5": "presentationUrl",
    };
    const field = fieldMap[opts.deliverableId];
    if (!field) return;

    // If completing, set the field to a marker. If uncompleting, set to null.
    // Status transitions: NOT_STARTED → IN_PROGRESS → SUBMITTED (when all 5 done)
    await fetch("/api/capstones", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: opts.studentId,
        status: opts.completed ? "IN_PROGRESS" : "NOT_STARTED",
        [field]: opts.completed ? `__completed_${new Date().toISOString()}__` : null,
      }),
    });
  } catch {
    // silent fail
  }
}

// Helper used by the store: returns true if we should sync to backend
// (only for logged-in non-guest users with a real DB student ID)
export function shouldSync(user: { id?: string; role: string } | null): user is { id: string; role: string } {
  return !!user?.id && user.role !== "guest";
}
