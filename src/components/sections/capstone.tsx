"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { capstoneDeliverables, phases } from "@/lib/course-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BrandButton } from "@/components/shared/buttons";
import { cn } from "@/lib/utils";
import styles from "./capstone.module.css";
import { Trophy, CheckCircle as CheckCircle2, Circle, Lightbulb, Target, Package, ClipboardText as ClipboardList, CalendarBlank as Calendar, ChartBar as BarChart3, Presentation, Sparkle as Sparkles, ArrowRight, Rocket, Star, CaretDown as ChevronDown, CaretUp as ChevronUp, BookOpen, Wrench, MagnifyingGlass as Search } from "@phosphor-icons/react";

const DELIVERABLE_ICONS = [Package, ClipboardList, Calendar, BarChart3, Presentation];

const DELIVERABLE_ACCENT_COLORS = [
  "bg-violet-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
];

const phase4 = phases.find((p) => p.number === 4);

export function CapstoneSection() {
  const capstoneCompleted = useAppStore((s) => s.capstoneCompleted);
  const toggleCapstone = useAppStore((s) => s.toggleCapstone);
  const setSection = useAppStore((s) => s.setSection);

  const done = capstoneDeliverables.filter((d) => capstoneCompleted[d.id]).length;
  const total = capstoneDeliverables.length;
  const pct = Math.round((done / total) * 100);
  const allComplete = done === total;

  const [expandedTips, setExpandedTips] = useState<Record<string, boolean>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const prevDoneRef = useRef(done);

  const toggleTips = (id: string) => {
    setExpandedTips((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Celebration animation when all deliverables are completed
  useEffect(() => {
    if (allComplete && prevDoneRef.current < total) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(timer);
    }
    prevDoneRef.current = done;
  }, [done, allComplete, total]);

  return (
    <div className={styles.section}>
      {/* ── Page Header ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 shadow-md shadow-violet-500/20">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Final Project
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Capstone Project
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Your culminating project — pulls together everything you learned across all 4 phases into a
          complete, client-ready PPC strategy.
        </p>
      </div>

      {/* ── Hero / Mission Brief ── */}
      <section className="relative overflow-hidden rounded-2xl border border-violet-200/50 dark:border-violet-900/30 bg-violet-50 dark:bg-violet-950/20">
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500 shadow-lg shadow-violet-500/25">
              <Target className="h-7 w-7 text-white" />
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <Badge className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-0 text-[10px] sm:text-xs font-semibold px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  Mission Brief · 5 Deliverables
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-tight">
                Build a complete PPC strategy
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                You&apos;ll create a full PPC strategy for a real product — as if your instructor is the
                client. By the end of Phase 4, all 5 deliverables must be submitted and
                presentation-ready.
              </p>
            </div>
          </div>

          {/* Example product brief card */}
          <div className="mt-8 rounded-xl border border-violet-200/70 dark:border-violet-800/40 bg-card p-5 sm:p-6 max-w-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-violet-500" />
              <p className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-violet-700 dark:text-violet-400">
                Example Product Brief
              </p>
            </div>
            <blockquote className="text-sm sm:text-base leading-relaxed text-foreground/80 italic border-l-2 border-violet-300 dark:border-violet-700 pl-4">
              &ldquo;Stainless Steel Insulated Water Bottle, 32oz, $29.99, mid-high competition,
              target ACoS 30–35%, long-term TACoS under 15%.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── Progress Journey ── */}
      <section className="relative">
        <Card
          className={cn(
            "border-2 transition-all duration-500 overflow-hidden",
            allComplete
              ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20"
              : "border-border/50"
          )}
        >
          <CardContent className="p-6 sm:p-8">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-muted-foreground">
                  Your Progress
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight">{done}</span>
                  <span className="text-lg text-muted-foreground">/ {total} deliverables</span>
                </div>
              </div>
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all duration-500",
                  allComplete
                    ? "bg-emerald-500 shadow-emerald-500/25"
                    : "bg-violet-500 shadow-violet-500/25"
                )}
              >
                {allComplete ? (
                  <Trophy className="h-7 w-7 text-white" />
                ) : (
                  <Target className="h-7 w-7 text-white" />
                )}
              </div>
            </div>

            {/* Progress bar with milestone markers */}
            <div className="relative mb-2">
              <div className="absolute inset-0 flex items-center justify-between px-[10%] pointer-events-none">
                {[1, 2, 3, 4].map((milestone) => {
                  const milestonePct = (milestone / total) * 100;
                  const reached = pct >= milestonePct;
                  return (
                    <div
                      key={milestone}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-500 z-10",
                        reached
                          ? "border-emerald-500 bg-emerald-500 shadow-md shadow-emerald-500/30"
                          : "border-muted-foreground/30 bg-background"
                      )}
                      style={{ marginLeft: milestone === 1 ? "-10px" : undefined }}
                    >
                      {reached ? (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                  );
                })}
              </div>
              <Progress value={pct} className="h-3 bg-muted/50" />
            </div>

            {/* Milestone labels */}
            <div className="flex justify-between mt-2 px-1">
              {["Start", "20%", "40%", "60%", "100%"].map((label, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    (i === 0 && done > 0) ||
                      (i === 1 && done >= 2) ||
                      (i === 2 && done >= 3) ||
                      (i === 3 && done >= 4) ||
                      (i === 4 && allComplete)
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground/50"
                  )}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Celebration banner */}
            {allComplete && (
              <div
                className={cn(
                  "mt-6 rounded-xl bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-800/40 p-4 sm:p-5 transition-all duration-700",
                  showCelebration ? "opacity-100 scale-100" : "opacity-90 scale-[0.99]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 shadow-md shadow-amber-500/25">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm sm:text-base">
                      🎉 All 5 deliverables complete!
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">
                      You&apos;re ready to present. Book a slot with your instructor.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Deliverables ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-transparent" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            Deliverables
          </h2>
          <div className="h-px flex-1 bg-transparent" />
        </div>

        <div className="space-y-4">
          {capstoneDeliverables.map((d, i) => {
            const Icon = DELIVERABLE_ICONS[i] ?? Package;
            const isDone = !!capstoneCompleted[d.id];
            const accentGradient = DELIVERABLE_ACCENT_COLORS[i] ?? DELIVERABLE_ACCENT_COLORS[0];
            const tipsExpanded = expandedTips[d.id] ?? false;

            return (
              <Card
                key={d.id}
                className={cn(
                  "border-2 transition-all duration-300 overflow-hidden",
                  isDone
                    ? "border-emerald-300/70 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/5"
                    : "border-border/50 hover:border-violet-300/60 dark:hover:border-violet-700/50 hover:shadow-md"
                )}
              >
                <CardContent className="p-0">
                  {/* Card header area */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4 sm:gap-5">
                      {/* Toggle */}
                      <button
                        onClick={() => toggleCapstone(d.id)}
                        className="shrink-0 mt-0.5 transition-transform hover:scale-110 active:scale-95"
                        aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
                      >
                        {isDone ? (
                          <div className="relative">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500 drop-shadow-sm" />
                          </div>
                        ) : (
                          <Circle className="h-8 w-8 text-muted-foreground/30 hover:text-violet-500 transition-colors" />
                        )}
                      </button>

                      {/* Icon */}
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300",
                          isDone
                            ? "bg-emerald-500 shadow-emerald-500/20"
                            : `${accentGradient} shadow-lg`
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold tracking-wide border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400"
                          >
                            Deliverable {i + 1}
                          </Badge>
                          {isDone && (
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-0 text-[10px] font-semibold">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                        </div>
                        <h3
                          className={cn(
                            "font-bold text-lg sm:text-xl mt-2 leading-snug",
                            isDone && "text-emerald-800 dark:text-emerald-300"
                          )}
                        >
                          {d.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-xl">
                          {d.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tips section — collapsible */}
                  <div className="border-t border-border/40">
                    <button
                      onClick={() => toggleTips(d.id)}
                      className="flex w-full items-center justify-between px-5 sm:px-6 py-3.5 text-left hover:bg-muted/20 transition-colors"
                      aria-label={tipsExpanded ? "Hide tips" : "Show tips"}
                    >
                      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Pro Tips
                      </span>
                      {tipsExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {tipsExpanded && (
                      <div className="px-5 sm:px-6 pb-5">
                        <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/10 border border-blue-100/60 dark:border-blue-900/20 p-4 sm:p-5">
                          <ul className="space-y-2.5">
                            {d.tips.map((tip, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-3 text-sm text-muted-foreground"
                              >
                                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-500/5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                  {j + 1}
                                </span>
                                <span className="leading-relaxed">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Related tools — contextual links */}
                  {i === 0 && (
                    <div className="border-t border-border/40 px-5 sm:px-6 py-4">
                      <BrandButton
                        variant="outline"
                        size="sm"
                        onClick={() => setSection("reference")}
                        className="text-xs"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Open Glossary & Keyword Tiering Guide
                        <ArrowRight className="h-3.5 w-3.5" />
                      </BrandButton>
                    </div>
                  )}
                  {i === 1 && (
                    <div className="border-t border-border/40 px-5 sm:px-6 py-4">
                      <BrandButton
                        variant="outline"
                        size="sm"
                        onClick={() => setSection("tools")}
                        className="text-xs"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        Open Campaign Builder
                        <ArrowRight className="h-3.5 w-3.5" />
                      </BrandButton>
                    </div>
                  )}
                  {i === 3 && (
                    <div className="border-t border-border/40 px-5 sm:px-6 py-4">
                      <BrandButton
                        variant="outline"
                        size="sm"
                        onClick={() => setSection("tools")}
                        className="text-xs"
                      >
                        <Search className="h-3.5 w-3.5" />
                        Open Search Term Analyzer
                        <ArrowRight className="h-3.5 w-3.5" />
                      </BrandButton>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Phase 4 Goals ── */}
      {phase4 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-transparent" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              Readiness Checklist
            </h2>
            <div className="h-px flex-1 bg-transparent" />
          </div>

          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 shadow-md shadow-violet-500/20">
                  <Target className="h-4 w-4 text-white" />
                </div>
                Phase 4 Goals
              </CardTitle>
              <CardDescription className="text-sm">
                You should be able to do all of these before submitting your capstone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2">
                {phase4.goals.map((g, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/10 dark:bg-muted/5 p-3.5"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 dark:bg-violet-500/5 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-violet-500" />
                    </div>
                    <span className="text-sm leading-relaxed">{g}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
