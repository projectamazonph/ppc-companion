"use client";

import { useAppStore } from "@/lib/store";
import { phases, TRIAL_MODULE_IDS, type Module, type ModuleSection } from "@/lib/course-data";
import { BrandButton } from "@/components/shared/buttons";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  Layers,
  Lightbulb,
  ListChecks,
  Lock,
  PenLine,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function findActiveModule(moduleId: string | null) {
  if (!moduleId) return null;
  for (const p of phases) {
    const m = p.modules.find((m) => m.id === moduleId);
    if (m) return { phase: p, module: m };
  }
  return null;
}

/** Map phase numbers to distinct gradient/color tokens */
const phaseColorMap: Record<number, { gradient: string; accent: string; ring: string; light: string; badge: string; iconBg: string }> = {
  1: {
    gradient: "from-blue-600 via-blue-700 to-indigo-700",
    accent: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-200 dark:ring-blue-800",
    light: "bg-blue-50 dark:bg-blue-950/30",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
  },
  2: {
    gradient: "from-violet-600 via-purple-700 to-indigo-700",
    accent: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-200 dark:ring-violet-800",
    light: "bg-violet-50 dark:bg-violet-950/30",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
  },
  3: {
    gradient: "from-amber-500 via-orange-600 to-red-600",
    accent: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-200 dark:ring-amber-800",
    light: "bg-amber-50 dark:bg-amber-950/30",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
  },
  4: {
    gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    accent: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-200 dark:ring-emerald-800",
    light: "bg-emerald-50 dark:bg-emerald-950/30",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  5: {
    gradient: "from-rose-500 via-pink-600 to-fuchsia-600",
    accent: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-200 dark:ring-rose-800",
    light: "bg-rose-50 dark:bg-rose-950/30",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
  },
};

function getPhaseColors(num: number) {
  return phaseColorMap[num] ?? phaseColorMap[1];
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function CurriculumSection() {
  const activeModuleId = useAppStore((s) => s.activeModuleId);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const setSection = useAppStore((s) => s.setSection);
  const user = useAppStore((s) => s.user);

  const isTrial = !user || user.role === "guest";

  const activeModule = findActiveModule(activeModuleId);

  if (activeModule) {
    return (
      <ModuleView
        phase={activeModule.phase}
        module={activeModule.module}
        isTrial={isTrial}
        onBack={() => setSection("curriculum")}
        onSelectExercise={() => setSection("exercises")}
        onSelectCheckpoint={() => setSection("quizzes")}
      />
    );
  }

  // Phase overview grid
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Curriculum
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Work through five structured phases to master Amazon PPC — from campaign
          fundamentals to enterprise-level strategy. Click any module to dive into
          the full lesson, exercises, and checkpoint.
        </p>
      </div>

      {/* Phase sections */}
      <div className="space-y-10 sm:space-y-12">
        {phases.map((phase) => {
          const colors = getPhaseColors(phase.number);
          return (
            <section key={phase.id} className="space-y-4 sm:space-y-5">
              {/* ── Phase header banner ── */}
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 sm:p-8 text-white shadow-lg",
                  colors.gradient
                )}
              >
                {/* Decorative circle */}
                <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-black/10 blur-xl" />

                <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-sm font-bold backdrop-blur-sm">
                        {phase.number}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                        {phase.weeks}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                      {phase.title}
                    </h2>
                    <p className="text-sm sm:text-base opacity-90 max-w-lg leading-relaxed">
                      {phase.subtitle}
                    </p>
                  </div>

                  {phase.checkpoint && (
                    <BrandButton
                      variant="ghost"
                      size="sm"
                      className="bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm self-start"
                      onClick={() => setSection("quizzes")}
                    >
                      <GraduationCap className="h-4 w-4" />
                      Checkpoint
                    </BrandButton>
                  )}
                </div>
              </div>

              {/* ── Phase goals ── */}
              <div className={cn("rounded-xl border p-5 sm:p-6", colors.light, "border-border/40")}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", colors.iconBg)}>
                    <Target className={cn("h-4 w-4", colors.accent)} />
                  </div>
                  <span className={cn("text-xs font-bold uppercase tracking-wider", colors.accent)}>
                    Phase Goals
                  </span>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {phase.goals.map((g, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className={cn("h-4 w-4 mt-0.5 shrink-0 opacity-70", colors.accent)} />
                      <span className="text-sm leading-relaxed">{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Module cards ── */}
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {phase.modules.map((m) => {
                  const colorsM = getPhaseColors(phase.number);
                  const isLocked = isTrial && !(TRIAL_MODULE_IDS as readonly string[]).includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={isLocked}
                      className={cn(
                        "group relative flex flex-col rounded-xl border bg-card p-5 sm:p-6 text-left transition-all duration-200",
                        isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-lg hover:-translate-y-0.5 hover:border-border",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        colorsM.ring
                      )}
                      onClick={isLocked ? undefined : () => setActiveModule(m.id, phase.id)}
                    >
                      {/* Top row: badge + lock/arrow */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            colorsM.badge
                          )}
                        >
                          <Layers className="h-3 w-3" />
                          Module {m.code}
                        </span>
                        {isLocked ? (
                          <Lock className="h-4 w-4 text-muted-foreground/50" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-base sm:text-lg leading-snug mb-3">
                        {m.title}
                      </h3>

                      {/* Content preview chips */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {isLocked ? (
                          <span className="text-xs text-muted-foreground italic">Enroll to access full content</span>
                        ) : (
                          <>
                            {m.content.slice(0, 3).map((c, i) => {
                              const label = c.heading.split(":")[0].split("(")[0].trim();
                              return (
                                <span
                                  key={i}
                                  className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground max-w-[180px]"
                                >
                                  <span className="truncate">{label}</span>
                                </span>
                              );
                            })}
                            {m.content.length > 3 && (
                              <span className="inline-flex items-center rounded-md bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                +{m.content.length - 3} more
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Footer: exercises + content count */}
                      <div className="mt-auto flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {m.content.length} sections
                        </span>
                        {m.exercises && m.exercises.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <PenLine className="h-3 w-3" />
                            {m.exercises.length} exercise{m.exercises.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ── Submission checklist ── */}
              {phase.submissionChecklist && (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Submission Checklist — {phase.weeks}
                    </span>
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {phase.submissionChecklist.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border text-[10px] text-muted-foreground font-medium">
                          {i + 1}
                        </span>
                        <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ─── MODULE DETAIL VIEW ──────────────────────────────────────────────────────

function ModuleView({
  phase,
  module,
  isTrial,
  onBack,
  onSelectExercise,
  onSelectCheckpoint,
}: {
  phase: (typeof phases)[number];
  module: Module;
  isTrial: boolean;
  onBack: () => void;
  onSelectExercise: () => void;
  onSelectCheckpoint: () => void;
}) {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const setActiveModule = useAppStore((s) => s.setActiveModule);

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
          Back to modules
        </button>
        <div className="rounded-xl border border-border/60 bg-muted/20 p-8 text-center">
          <Lock className="h-8 w-8 mx-auto text-muted-foreground/60 mb-4" />
          <h2 className="font-semibold text-lg mb-2">Module not available in trial</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Sign up for free to unlock all 11 modules, track progress, and submit exercises.
          </p>
          <button
            type="button"
            onClick={() => {
              logout();
              onBack();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
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

  const colors = getPhaseColors(phase.number);

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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        All curriculum
      </button>

      {/* ── Module header ── */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 sm:p-8 lg:p-10 text-white shadow-lg",
          colors.gradient
        )}
      >
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />

        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <PlayCircle className="h-3.5 w-3.5" />
              Phase {phase.number}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Layers className="h-3.5 w-3.5" />
              Module {module.code}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm opacity-80">
              <Clock className="h-3.5 w-3.5" />
              {phase.weeks}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight max-w-3xl">
            {module.title}
          </h1>

          <p className="text-sm sm:text-base opacity-80 max-w-2xl leading-relaxed">
            {phase.subtitle}
          </p>
        </div>
      </div>

      {/* ── Content sections ── */}
      <div className="space-y-5">
        {module.content.map((section, i) => (
          <ModuleSectionView key={i} section={section} phaseNumber={phase.number} />
        ))}
      </div>

      {/* ── Exercises callout ── */}
      {module.exercises && module.exercises.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-sky-50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-sky-950/30 p-6 sm:p-8">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-blue-200/30 dark:bg-blue-800/20 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                  className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-card/80 backdrop-blur-sm p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{ex.id}</span>
                      <span className="text-muted-foreground mx-1.5">—</span>
                      {ex.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
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

      {/* ── Phase checkpoint callout ── */}
      {phase.checkpoint && moduleIdx === phase.modules.length - 1 && (
        <div className="relative overflow-hidden rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-gradient-to-br from-rose-50 via-pink-50/50 to-red-50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-red-950/30 p-6 sm:p-8">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-rose-200/30 dark:bg-rose-800/20 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/50">
                <GraduationCap className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{phase.checkpoint.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Test your understanding of Phase {phase.number}. Auto-graded.
                </p>
              </div>
            </div>
            <BrandButton
              variant="danger"
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

      {/* ── Prev / Next navigation ── */}
      <div className="grid gap-3 sm:grid-cols-2 pt-2">
        {prev ? (
          <button
            type="button"
            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:border-border hover:shadow-sm"
            onClick={() => setActiveModule(prev.module.id, prev.phase.id)}
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:-translate-x-0.5 transition-transform shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Previous
              </p>
              <p className="font-semibold text-sm mt-0.5 truncate">
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
            className="group flex items-center justify-end gap-3 rounded-xl border border-border/60 bg-card p-4 text-right transition-all hover:border-border hover:shadow-sm sm:col-start-2"
            onClick={() => setActiveModule(next.module.id, next.phase.id)}
          >
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Next
              </p>
              <p className="font-semibold text-sm mt-0.5 truncate">
                {next.module.code} · {next.module.title}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        )}
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
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      {/* Section header */}
      <div className={cn("border-b border-border/40 px-5 sm:px-6 py-4", colors.light)}>
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
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", `bg-current opacity-40 ${colors.accent}`)} />
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
                        <span className={cn("mt-1.5 h-1 w-1 shrink-0 rounded-full opacity-50", `bg-current ${colors.accent}`)} />
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
                  "rounded-xl border border-border/40 p-4 sm:p-5",
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
            {/* Connecting line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-border via-border/60 to-transparent" />

            <ol className="space-y-5">
              {section.steps.map((step, i) => (
                <li key={i} className="relative flex gap-4">
                  {/* Number badge */}
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-4 ring-background",
                      `bg-gradient-to-br ${colors.gradient} text-white`
                    )}
                  >
                    {i + 1}
                  </div>

                  {/* Content */}
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
          <div className="overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-sm">
              <thead>
                <tr className={cn("border-b border-border/60", colors.light)}>
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
                      "border-b border-border/30 last:border-0 transition-colors hover:bg-muted/30",
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
