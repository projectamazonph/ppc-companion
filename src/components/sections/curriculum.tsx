"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { phases, TRIAL_MODULE_IDS, type Module, type ModuleSection } from "@/lib/course-data";
import { BrandButton } from "@/components/shared/buttons";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  GraduationCap,
  Layers,
  Lightbulb,
  Lock,
  PenLine,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
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
const phaseColorMap: Record<number, { gradient: string; accent: string; ring: string; light: string; badge: string; iconBg: string; cardBorder: string }> = {
  1: {
    gradient: "from-orange-500 via-orange-600 to-amber-700",
    accent: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-200 dark:ring-blue-800",
    light: "bg-blue-50 dark:bg-blue-950/30",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    cardBorder: "hover:border-[var(--color-brand-orange)]/30",
  },
  2: {
    gradient: "from-violet-600 via-purple-700 to-amber-700",
    accent: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-200 dark:ring-violet-800",
    light: "bg-violet-50 dark:bg-violet-950/30",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    cardBorder: "hover:border-violet-500/30",
  },
  3: {
    gradient: "from-amber-500 via-orange-600 to-red-600",
    accent: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-200 dark:ring-amber-800",
    light: "bg-amber-50 dark:bg-amber-950/30",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    cardBorder: "hover:border-amber-500/30",
  },
  4: {
    gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    accent: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-200 dark:ring-emerald-800",
    light: "bg-emerald-50 dark:bg-emerald-950/30",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    cardBorder: "hover:border-emerald-500/30",
  },
  5: {
    gradient: "from-rose-500 via-pink-600 to-fuchsia-600",
    accent: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-200 dark:ring-rose-800",
    light: "bg-rose-50 dark:bg-rose-950/30",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    cardBorder: "hover:border-rose-500/30",
  },
};

function getPhaseColors(num: number) {
  return phaseColorMap[num] ?? phaseColorMap[1];
}

type FilterTab = "all" | "foundation" | "advanced" | "completed";

// ─── Main Export ─────────────────────────────────────────────────────────────

export function CurriculumSection() {
  const activeModuleId = useAppStore((s) => s.activeModuleId);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const setSection = useAppStore((s) => s.setSection);
  const user = useAppStore((s) => s.user);

  const isTrial = !user || user.role === "guest";
  const activeModule = findActiveModule(activeModuleId);

  // Derive pass status from user object
  const phasePassMap: Record<number, boolean> = {
    1: user?.phase1Pass ?? false,
    2: user?.phase2Pass ?? false,
    3: user?.phase3Pass ?? false,
    4: user?.phase4Pass ?? false,
  };

  function isPhaseUnlocked(phaseNum: number): boolean {
    if (phaseNum === 1) return true;
    return phasePassMap[phaseNum - 1] === true;
  }

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

  // ── Courses list view (matches stitch structure) ──
  return <CoursesListView isTrial={isTrial} phasePassMap={phasePassMap} isPhaseUnlocked={isPhaseUnlocked} setActiveModule={setActiveModule} />;
}

// ─── COURSES LIST VIEW ──────────────────────────────────────────────────────

function CoursesListView({
  isTrial,
  phasePassMap,
  isPhaseUnlocked,
  setActiveModule,
}: {
  isTrial: boolean;
  phasePassMap: Record<number, boolean>;
  isPhaseUnlocked: (n: number) => boolean;
  setActiveModule: (moduleId: string, phaseId: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Build course cards from phases
  const courseCards = phases.map((phase) => {
    const unlocked = isPhaseUnlocked(phase.number);
    const passed = phasePassMap[phase.number] ?? false;
    const totalLessons = phase.modules.length;
    const totalExercises = phase.modules.reduce((sum, m) => sum + (m.exercises?.length ?? 0), 0);

    // Determine status
    let status: "in_progress" | "locked" | "completed";
    if (passed) {
      status = "completed";
    } else if (!unlocked) {
      status = "locked";
    } else {
      status = "in_progress";
    }

    // Compute progress percentage from server data or trial hint
    let progressPct = 0;
    if (passed) {
      progressPct = 100;
    } else if (unlocked) {
      // Approximate: if user has done any exercises, show some progress
      progressPct = 10; // placeholder — real progress comes from serverProgress
    }

    // Determine prerequisite text for locked phases
    const prerequisitePhase = phase.number > 1 ? phases.find((p) => p.number === phase.number - 1) : null;

    // Category tag
    const category: "foundation" | "advanced" = phase.number <= 2 ? "foundation" : "advanced";

    return {
      phase,
      status,
      progressPct,
      totalLessons,
      totalExercises,
      prerequisitePhase,
      category,
    };
  });

  // Filter
  const filtered = courseCards.filter((card) => {
    if (activeFilter === "completed") return card.status === "completed";
    if (activeFilter === "foundation") return card.category === "foundation";
    if (activeFilter === "advanced") return card.category === "advanced";
    return true; // "all"
  }).filter((card) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      card.phase.title.toLowerCase().includes(q) ||
      card.phase.subtitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
          Your Learning Path
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Master Amazon PPC step-by-step to accelerate your VA career.
        </p>
      </div>

      {/* Filter bar + search (matches stitch) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Filter tabs */}
        <div className="flex gap-2 w-full overflow-x-auto pb-2 sm:pb-0 flex-nowrap sm:flex-wrap">
          {([
            { key: "all", label: "All" },
            { key: "foundation", label: "Foundation" },
            { key: "advanced", label: "Advanced" },
            { key: "completed", label: "Completed" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "whitespace-nowrap h-9 px-5 rounded-lg text-sm font-medium transition-all flex-shrink-0",
                activeFilter === tab.key
                  ? "bg-foreground text-background dark:bg-[var(--color-brand-orange)] dark:text-white"
                  : "bg-white dark:bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="hidden md:block relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 rounded-lg bg-white dark:bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-[var(--color-brand-orange)] focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-muted border-none text-foreground placeholder:text-muted-foreground text-sm shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none"
        />
      </div>

      {/* Course card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filtered.map((card) => (
          <CourseCard
            key={card.phase.id}
            card={card}
            isTrial={isTrial}
            setActiveModule={setActiveModule}
            setSection={() => {}}
          />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No courses match your filter.</p>
        </div>
      )}

      {/* Footer count */}
      <div className="text-center pb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {phases.length} phases
        </p>
      </div>
    </div>
  );
}

// ─── COURSE CARD ────────────────────────────────────────────────────────────

function CourseCard({
  card,
  isTrial,
  setActiveModule,
  setSection,
}: {
  card: {
    phase: (typeof phases)[number];
    status: "in_progress" | "locked" | "completed";
    progressPct: number;
    totalLessons: number;
    totalExercises: number;
    prerequisitePhase: (typeof phases)[number] | undefined;
  };
  isTrial: boolean;
  setActiveModule: (moduleId: string, phaseId: string) => void;
  setSection: () => void;
}) {
  const { phase, status, progressPct, totalLessons, prerequisitePhase } = card;
  const colors = getPhaseColors(phase.number);
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  // For locked: clicking first unlocked module goes nowhere — show lock
  // For in_progress/completed: click opens first module of the phase
  const firstModule = phase.modules[0];

  function handleCardClick() {
    if (isLocked || isTrial) return;
    if (firstModule) {
      setActiveModule(firstModule.id, phase.id);
    }
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl shadow-sm border overflow-hidden transition-all duration-300 flex-col h-full",
        isLocked
          ? "opacity-80 hover:opacity-100 bg-card border-border"
          : isCompleted
            ? "bg-card border-border hover:shadow-lg hover:border-green-500/30"
            : cn("bg-card border-border hover:shadow-lg", colors.cardBorder),
        !isLocked && !isCompleted && "hover:shadow-lg"
      )}
    >
      {/* Hover lock overlay for locked cards */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/50 dark:bg-black/40 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm rounded-xl">
          <div className="bg-card p-3 rounded-full shadow-lg mb-2 text-muted-foreground">
            <Lock className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-foreground px-6 text-center">
            {prerequisitePhase
              ? `Complete "${prerequisitePhase.title}" to unlock`
              : "Complete the previous phase to unlock"}
          </p>
        </div>
      )}

      {/* Header area with gradient */}
      <div
        className={cn(
          "relative h-32 sm:h-40 w-full overflow-hidden",
          isLocked && "grayscale group-hover:grayscale-0 transition-all"
        )}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br", phase.color)} />
        {/* Decorative elements */}
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-black/10 blur-xl" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/60 backdrop-blur px-2.5 py-1 rounded text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded text-xs font-bold text-gray-500 uppercase tracking-wide shadow-sm">
              <Lock className="h-3.5 w-3.5" />
              Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2.5 py-1 rounded text-xs font-bold text-[var(--color-brand-orange)] uppercase tracking-wide shadow-sm">
              In Progress
            </span>
          )}
        </div>

        {/* Phase number */}
        <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white text-lg font-black backdrop-blur-sm">
          {phase.number}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* Meta: duration + lessons */}
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {phase.duration}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5" />
            {totalLessons} Lesson{totalLessons !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Title */}
        <h3 className={cn(
          "text-lg sm:text-xl font-bold mb-2 line-clamp-2",
          isLocked ? "text-muted-foreground" : "text-foreground"
        )}>
          {phase.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 sm:mb-5 line-clamp-2">
          {phase.subtitle}
        </p>

        {/* Bottom section */}
        <div className="mt-auto">
          {isCompleted ? (
            <>
              {/* Certificate available */}
              <div className="flex items-center gap-2 mb-4 text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <ShieldCheck className="h-4 w-4" />
                Certificate Available
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCardClick}
                  className="flex-1 py-2 px-3 bg-card border border-border text-foreground hover:bg-muted rounded-lg text-sm font-bold transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 inline mr-1" />
                  Review
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  Cert
                </button>
              </div>
            </>
          ) : isLocked ? (
            <div className="pt-4 border-t border-dashed border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Lightbulb className="h-4 w-4" />
                <span>
                  Prerequisite: {prerequisitePhase?.title ?? "Previous phase"}
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-foreground">
                  {progressPct}% Completed
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div
                  className={cn("h-2 rounded-full bg-[var(--color-brand-orange)]")}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <button
                type="button"
                onClick={handleCardClick}
                className={cn(
                  "w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2",
                  progressPct > 0
                    ? "bg-card border border-border text-foreground hover:bg-muted"
                    : "bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/90 text-white"
                )}
              >
                {progressPct > 0 ? "Resume Course" : "Start Learning"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
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
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-orange)] text-white px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
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
        All courses
      </button>

      {/* ── Module header ── */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 sm:8 lg:p-10 text-white shadow-lg",
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
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4"
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
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-border hover:shadow-sm"
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
            className="group flex items-center justify-end gap-3 rounded-xl border border-border bg-card p-4 text-right transition-all hover:border-border hover:shadow-sm sm:col-start-2"
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
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-border via-border/60 to-transparent" />

            <ol className="space-y-5">
              {section.steps.map((step, i) => (
                <li key={i} className="relative flex gap-4">
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-4 ring-background text-white bg-gradient-to-br",
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
