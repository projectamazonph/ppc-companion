"use client";

import { useAppStore } from "@/lib/store";
import { phases, TRIAL_MODULE_IDS, type Module, type ModuleSection } from "@/lib/course-data";
import { BrandButton } from "@/components/shared/buttons";
import { cn } from "@/lib/utils";
import styles from "./course-view.module.css";
import {
  ArrowLeft, ArrowRight, Medal as Award, BookOpen, CheckCircle as CheckCircle2, CaretDown as ChevronDown, Clock, FileText, GraduationCap, Question as HelpCircle, Stack as Layers, Lightbulb, Lock, Pen as PenLine, Play, PlayCircle, Sparkle as Sparkles, User } from "@phosphor-icons/react";

// ─── Helpers (shared with curriculum's courses-list view) ─────────────────────

/** Map phase numbers to distinct gradient/color tokens */
export const phaseColorMap: Record<
  number,
  {
    gradient: string;
    accent: string;
    ring: string;
    light: string;
    badge: string;
    iconBg: string;
    cardBorder: string;
  }
> = {
  1: {
    gradient: "bg-orange-500",
    accent: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-200 dark:ring-blue-800",
    light: "bg-blue-50 dark:bg-blue-950/30",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    cardBorder: "hover:border-primary/30",
  },
  2: {
    gradient: "bg-violet-600",
    accent: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-200 dark:ring-violet-800",
    light: "bg-violet-50 dark:bg-violet-950/30",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    cardBorder: "hover:border-violet-500/30",
  },
  3: {
    gradient: "bg-amber-500",
    accent: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-200 dark:ring-amber-800",
    light: "bg-amber-50 dark:bg-amber-950/30",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    cardBorder: "hover:border-amber-500/30",
  },
  4: {
    gradient: "bg-emerald-500",
    accent: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-200 dark:ring-emerald-800",
    light: "bg-emerald-50 dark:bg-emerald-950/30",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    cardBorder: "hover:border-emerald-500/30",
  },
  5: {
    gradient: "bg-rose-500",
    accent: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-200 dark:ring-rose-800",
    light: "bg-rose-50 dark:bg-rose-950/30",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    cardBorder: "hover:border-rose-500/30",
  },
};

export function getPhaseColors(num: number) {
  return phaseColorMap[num] ?? phaseColorMap[1];
}

export function findActiveModule(moduleId: string | null) {
  if (!moduleId) return null;
  for (const p of phases) {
    const m = p.modules.find((m) => m.id === moduleId);
    if (m) return { phase: p, module: m };
  }
  return null;
}

// ─── Top-level export ─────────────────────────────────────────────────────────

export function CourseView({ isTrial }: { isTrial: boolean }) {
  const activeModuleId = useAppStore((s) => s.activeModuleId);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const setSection = useAppStore((s) => s.setSection);

  const activeModule = findActiveModule(activeModuleId);

  if (!activeModule) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/60 mb-4" />
        <h2 className="font-semibold text-lg mb-2">No module selected</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Choose a module from the curriculum to start learning.
        </p>
        <BrandButton onClick={() => setSection("curriculum")}>
          Browse curriculum
          <ArrowRight className="h-4 w-4" />
        </BrandButton>
      </div>
    );
  }

  return (
    <ModuleView
      phase={activeModule.phase}
      module={activeModule.module}
      isTrial={isTrial}
      onBack={() => setSection("curriculum")}
      onSelectExercise={() => setSection("exercises")}
      onSelectCheckpoint={() => setSection("quizzes")}
      setActiveModule={setActiveModule}
    />
  );
}

// ─── Module (lesson) view — matches course-view.html stitch ──────────────────

function ModuleView({
  phase,
  module,
  isTrial,
  onBack,
  onSelectExercise,
  onSelectCheckpoint,
  setActiveModule,
}: {
  phase: (typeof phases)[number];
  module: Module;
  isTrial: boolean;
  onBack: () => void;
  onSelectExercise: () => void;
  onSelectCheckpoint: () => void;
  setActiveModule: (moduleId: string, phaseId: string) => void;
}) {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);

  // Trial gate: redirect locked modules to upgrade screen
  if (isTrial && !(TRIAL_MODULE_IDS as readonly string[]).includes(module.id)) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to courses
        </button>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Lock className="h-8 w-8 mx-auto text-muted-foreground/60 mb-4" />
          <h2 className="font-semibold text-lg mb-2">Module not available in trial</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Sign up for free to unlock all modules, track progress, and submit exercises.
          </p>
          <button
            type="button"
            onClick={() => {
              logout();
              onBack();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Sign up to unlock
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const phaseIdx = phases.findIndex((p) => p.id === phase.id);
  const moduleIdx = phase.modules.findIndex((m) => m.id === module.id);

  const getNext = () => {
    if (moduleIdx < phase.modules.length - 1) {
      return { phase, module: phase.modules[moduleIdx + 1] };
    }
    if (phaseIdx < phases.length - 1) {
      const nextPhase = phases[phaseIdx + 1];
      return { phase: nextPhase, module: nextPhase.modules[0] };
    }
    return null;
  };
  const getPrev = () => {
    if (moduleIdx > 0) {
      return { phase, module: phase.modules[moduleIdx - 1] };
    }
    if (phaseIdx > 0) {
      const prevPhase = phases[phaseIdx - 1];
      return { phase: prevPhase, module: prevPhase.modules[prevPhase.modules.length - 1] };
    }
    return null;
  };
  const prev = getPrev();
  const next = getNext();

  // Progress + unlock context for the course-view sidebar & syllabus
  const phasePassMap: Record<number, boolean> = {
    1: user?.phase1Pass ?? false,
    2: user?.phase2Pass ?? false,
    3: user?.phase3Pass ?? false,
    4: user?.phase4Pass ?? false,
  };
  const isPhaseUnlocked = (n: number): boolean =>
    n === 1 ? true : phasePassMap[n - 1] === true;
  const phasePassed = phasePassMap[phase.number] ?? false;
  const totalModules = phase.modules.length;
  const progressPct = Math.round(((moduleIdx + 1) / totalModules) * 100);

  return (
    <div className={styles.section}>
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        All courses
      </button>

      {/* ── Two-column course view ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Main column */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <PlayCircle className="h-3.5 w-3.5" />
                Phase {phase.number}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Layers className="h-3.5 w-3.5" />
                Module {module.code}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {phase.weeks}
              </span>
            </div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              {module.title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {phase.subtitle}
            </p>
          </div>

          {/* Lesson player card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Phase {phase.number} • Module {module.code}
                </span>
                <h2 className="mt-1 text-lg font-bold leading-snug sm:text-xl">{module.title}</h2>
              </div>
              <span className="inline-flex w-fit items-center gap-1 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:self-auto">
                {phasePassed ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completed
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-3.5 w-3.5" />
                    In Progress
                  </>
                )}
              </span>
            </div>

            <div className="relative flex aspect-video items-center justify-center bg-muted">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/20 transition-transform duration-300 group-hover:scale-110 sm:size-16">
                <Play className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-border">
                <div className="h-full w-1/3 bg-primary" />
              </div>
            </div>

            <div className="flex flex-col gap-4 bg-muted/40 p-4 sm:p-6">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Attached Resources</p>
                <div className="flex flex-wrap gap-2">
                  {module.exercises && module.exercises.length > 0 ? (
                    module.exercises.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={onSelectExercise}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm"
                      >
                        <FileText className="h-4 w-4 text-primary" />
                        {ex.id} — {ex.title}
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No resources attached.</span>
                  )}
                </div>
              </div>
              <BrandButton
                onClick={next ? () => setActiveModule(next.module.id, next.phase.id) : onBack}
                className="w-full self-start sm:w-auto"
              >
                {next ? "Complete & Continue" : "Finish Module"}
                <ArrowRight className="h-4 w-4" />
              </BrandButton>
            </div>
          </div>

          {/* Lesson content sections */}
          <div className="space-y-5">
            {module.content.map((section, i) => (
              <ModuleSectionView key={i} section={section} phaseNumber={phase.number} />
            ))}
          </div>

          {/* Course Syllabus */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Course Syllabus</h3>
            <div className="space-y-3">
              {phases.map((p) => {
                const unlocked = isPhaseUnlocked(p.number);
                const passed = phasePassMap[p.number] ?? false;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "overflow-hidden rounded-xl border bg-card",
                      passed ? "border-primary/30" : "border-border",
                      !unlocked && "opacity-75"
                    )}
                  >
                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => unlocked && p.modules[0] && setActiveModule(p.modules[0].id, p.id)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                            passed
                              ? "bg-primary text-primary-foreground"
                              : unlocked
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {passed ? <CheckCircle2 className="h-4 w-4" /> : p.number}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold sm:text-base">{p.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {p.modules.length} Modules • {p.duration}
                          </p>
                        </div>
                      </div>
                      {!unlocked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-primary" />
                      )}
                    </button>

                    {unlocked && (
                      <div className="divide-y divide-border">
                        {p.modules.map((m) => {
                          const isCurrent = m.id === module.id;
                          const isDone =
                            passed ||
                            (p.id === phase.id &&
                              p.modules.findIndex((x) => x.id === m.id) < moduleIdx);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setActiveModule(m.id, p.id)}
                              className={cn(
                                "flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                                isCurrent && "border-l-4 border-primary bg-primary/5"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {isDone ? (
                                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                                ) : isCurrent ? (
                                  <PlayCircle className="h-5 w-5 shrink-0 text-primary" />
                                ) : (
                                  <span className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/40" />
                                )}
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    isCurrent ? "font-bold text-primary" : "text-foreground"
                                  )}
                                >
                                  {m.code} {m.title}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exercises callout */}
          {module.exercises && module.exercises.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
              <div className="relative">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Exercises</h3>
                    <p className="text-xs text-muted-foreground">
                      Apply what you learned. Answers save automatically.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {module.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/80 p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm">
                          <span className="font-bold text-primary">{ex.id}</span>
                          <span className="mx-1.5 text-muted-foreground">—</span>
                          {ex.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {ex.prompt}
                        </p>
                      </div>
                      <BrandButton
                        size="sm"
                        variant="default"
                        onClick={onSelectExercise}
                        className="shrink-0"
                      >
                        <PenLine className="h-3.5 w-3.5" />
                        Open
                      </BrandButton>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Phase checkpoint callout */}
          {phase.checkpoint && moduleIdx === phase.modules.length - 1 && (
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
              <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{phase.checkpoint.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Test your understanding of Phase {phase.number}. Auto-graded.
                    </p>
                  </div>
                </div>
                <BrandButton
                  variant="default"
                  size="default"
                  onClick={onSelectCheckpoint}
                  className="self-start sm:self-auto"
                >
                  <Sparkles className="h-4 w-4" />
                  Take checkpoint
                </BrandButton>
              </div>
            </div>
          )}

          {/* Prev / Next navigation */}
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            {prev ? (
              <button
                type="button"
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm"
                onClick={() => setActiveModule(prev.module.id, prev.phase.id)}
              >
                <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Previous
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold">
                    {prev.module.code} · {prev.module.title}
                  </p>
                </div>
              </button>
            ) : (
              <div />
            )}
            {next && (
              <button
                type="button"
                className="group flex items-center justify-end gap-3 rounded-xl border border-border bg-card p-4 text-right transition-all hover:border-primary/50 hover:shadow-sm sm:col-start-2"
                onClick={() => setActiveModule(next.module.id, next.phase.id)}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Next
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold">
                    {next.module.code} · {next.module.title}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Your Progress */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold">Your Progress</h3>
                <span className="font-bold text-primary">{progressPct}%</span>
              </div>
              <div className="mb-2 h-2.5 w-full rounded-full bg-muted">
                <div className="h-2.5 rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">
                Module {moduleIdx + 1} of {totalModules} in Phase {phase.number}.
                {phasePassed ? " Phase complete!" : " Keep it up!"}
              </p>
            </div>

            {/* Instructor */}
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Instructor
                </p>
                <h4 className="font-bold">Ryan Dabao</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Amazon PPC Lead Manager with 10+ years of experience.
                </p>
                <button className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Ask a Question
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* AI Study Tip */}
            <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
              <div className="absolute right-0 top-0 p-3 opacity-10">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold uppercase text-primary">AI Study Tip</span>
                </div>
                <p className="text-sm font-medium text-foreground/80">
                  Focus on the {module.title} concepts — they build directly into your Phase {phase.number} checkpoint.
                </p>
              </div>
            </div>

            {/* Certificate */}
            <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Award className="h-6 w-6" />
              </div>
              <h4 className="font-bold">Certificate {phasePassed ? "Earned" : "Locked"}</h4>
              <p className="mb-4 mt-1 text-xs text-muted-foreground">
                {phasePassed
                  ? "You completed this phase. Download your certificate anytime."
                  : "Complete all modules in this phase to earn your certificate."}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── MODULE SECTION RENDERER ─────────────────────────────────────────────────

function ModuleSectionView({
  section,
  phaseNumber,
}: {
  section: ModuleSection;
  phaseNumber: number;
}) {
  const colors = getPhaseColors(phaseNumber);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Section header */}
      <div className={cn("border-b border-border px-5 sm:px-6 py-4", colors.light)}>
        <h3 className="flex items-center gap-2.5 text-base sm:text-lg font-semibold">
          <BookOpen className={cn("h-4.5 w-4.5 shrink-0", colors.accent)} />
          {section.heading}
        </h3>
      </div>

      {/* Section body */}
      <div className="px-5 sm:px-6 py-5">
        {/* ── Text ── */}
        {section.type === "text" && section.body && (
          <p className="text-sm sm:text-[15px] text-foreground/85 leading-[1.7]">
            {section.body}
          </p>
        )}

        {/* ── List ── */}
        {section.type === "list" && section.items && (
          <ul className="space-y-3">
            {section.items.map((item, i) => (
              <li key={i} className="text-sm sm:text-[15px]">
                <div className="flex items-start gap-2.5">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40", colors.accent)} />
                  <span className="leading-relaxed">
                    {item.term && <span className="font-semibold">{item.term}</span>}
                    {item.term && item.description && (
                      <span className="text-muted-foreground"> — </span>
                    )}
                    {item.description && (
                      <span className="text-foreground/80">{item.description}</span>
                    )}
                  </span>
                </div>
                {item.subItems && item.subItems.length > 0 && (
                  <ul className="mt-2 ml-5 space-y-1.5">
                    {item.subItems.map((sub, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className={cn("mt-1.5 h-1 w-1 shrink-0 rounded-full opacity-50 bg-current", colors.accent)} />
                        <span className="leading-relaxed">{sub}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* ── Definition ── */}
        {section.type === "definition" && section.items && (
          <div className="space-y-3">
            {section.items.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl border border-border p-4 sm:p-5",
                  colors.light
                )}
              >
                <dt className="font-bold text-sm sm:text-base flex items-start gap-2">
                  <span className={cn("mt-0.5", colors.accent)}>▸</span>
                  <span>{item.term}</span>
                </dt>
                {item.description && (
                  <dd className="text-sm text-foreground/80 mt-2 ml-5 leading-relaxed">
                    {item.description}
                  </dd>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Flow ── */}
        {section.type === "flow" && section.steps && (
          <div className="relative">
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border" />

            <ol className="space-y-5">
              {section.steps.map((step, i) => (
                <li key={i} className="relative flex gap-4">
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-4 ring-background text-white ",
                      colors.gradient
                    )}
                  >
                    {i + 1}
                  </div>
                  <div className="pt-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base">{step.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Table ── */}
        {section.type === "table" && section.columns && section.rows && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className={cn("border-b border-border", colors.light)}>
                  {section.columns.map((col, i) => (
                    <th
                      key={i}
                      className={cn(
                        "text-left font-bold py-3 px-4 text-xs uppercase tracking-wider",
                        colors.accent
                      )}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors hover:bg-muted/30",
                      i % 2 === 1 && "bg-muted/20"
                    )}
                  >
                    {row.map((cell, j) => (
                      <td key={j} className="py-3 px-4 text-foreground/80">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
