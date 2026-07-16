"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { phases } from "@/lib/course-data";
import { BrandButton } from "@/components/shared/buttons";
import { cn } from "@/lib/utils";
import { CourseView, getPhaseColors, findActiveModule } from "@/components/sections/course-view";
import {
  ArrowLeft, ArrowRight, Medal as Award, BookOpen, CheckCircle as CheckCircle2, CaretDown as ChevronDown, Clock, Download, Eye, FileText, GraduationCap, Question as HelpCircle, Stack as Layers, Lightbulb, Lock, Pen as PenLine, Play, PlayCircle, MagnifyingGlass as Search, ShieldCheck, Sparkle as Sparkles, User } from "@phosphor-icons/react";

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
    return <CourseView isTrial={isTrial} />;
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
    const prerequisitePhase = phase.number > 1 ? phases.find((p) => p.number === phase.number - 1) : undefined;

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
                  ? "bg-foreground text-background dark:bg-primary dark:text-white"
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
            className="block w-full pl-10 pr-3 py-2.5 rounded-lg bg-white dark:bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
          className="block w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-muted border-none text-foreground placeholder:text-muted-foreground text-sm shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-primary outline-none"
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
        <div className="absolute inset-0 bg-background/90 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
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
        <div className={cn("absolute inset-0 ", phase.color)} />
        {/* Decorative elements */}
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-black/10 blur-xl" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/60 px-2.5 py-1 rounded text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded text-xs font-bold text-gray-500 uppercase tracking-wide shadow-sm">
              <Lock className="h-3.5 w-3.5" />
              Locked
            </span>
          ) : (
              <span className="inline-flex items-center gap-1 bg-card px-2.5 py-1 rounded text-xs font-bold text-primary uppercase tracking-wide shadow-sm">
              In Progress
            </span>
          )}
        </div>

        {/* Phase number */}
        <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/30 text-white text-lg font-black">
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
                  className={cn("h-2 rounded-full bg-primary")}
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
                    : "bg-primary hover:bg-primary/90 text-white"
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

