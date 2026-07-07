"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore, useProgressStats } from "@/lib/store";
import { programOverview, phases, submissionChecklist } from "@/lib/course-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BrandButton } from "@/components/shared/buttons";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  PenLine,
  GraduationCap,
  Calculator,
  Trophy,
  CheckCircle2,
  Circle,
  Flame,
  Clock,
  Target,
  Sparkles,
  ListChecks,
  Zap,
  TrendingUp,
  Award,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Star,
  Rocket,
  BarChart3,
  Users,
} from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
// ─── Stat card configuration ────────────────────────────────────────────────
const statsCards = [
  { key: "exercises", label: "Exercises", icon: PenLine, total: 11, accent: "from-blue-500 to-blue-600", ring: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { key: "quizzes", label: "Quizzes", icon: GraduationCap, total: 4, accent: "from-rose-500 to-pink-600", ring: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
  { key: "capstone", label: "Capstone", icon: Trophy, total: 5, accent: "from-emerald-500 to-teal-600", ring: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { key: "checklist", label: "Checklist", icon: ListChecks, total: 9, accent: "from-violet-500 to-purple-600", ring: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
] as const;

// ─── Mini circular progress ring ─────────────────────────────────────────────
function MiniRing({ pct, color, size = 36 }: { pct: number; color: string; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className={cn("shrink-0", color)}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-15"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// ─── Motivational milestone messages ─────────────────────────────────────────
function getMilestoneMessage(pct: number): string {
  if (pct >= 100) return "Program complete — you're an Amazon PPC pro! 🎉";
  if (pct >= 75) return "Final stretch — you've got this! 🔥";
  if (pct >= 50) return "Halfway there — momentum is building! 💪";
  if (pct >= 25) return "Great start — you're building real skills! 🚀";
  return "Every expert was once a beginner. Let's go! ✨";
}

// ─── Streak / motivation helper ─────────────────────────────────────────────
function getStreakMessage(pct: number): { text: string; icon: typeof Flame } {
  if (pct >= 75) return { text: "On fire", icon: Flame };
  if (pct >= 50) return { text: "Building momentum", icon: TrendingUp };
  if (pct >= 25) return { text: "Making progress", icon: Zap };
  return { text: "Ready to start", icon: Rocket };
}

// ─── Main component ──────────────────────────────────────────────────────────
export function DashboardSection() {
  const setSection = useAppStore((s) => s.setSection);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const stats = useProgressStats();
  const quizResults = useAppStore((s) => s.quizResults);
  const user = useAppStore((s) => s.user);

  // Animate overall progress on mount
  const [animatedOverall, setAnimatedOverall] = useState(0);
  const overall = useMemo(
    () =>
      Math.min(
        100,
        Math.round(
          (stats.exercisesAttempted / 11) * 25 +
            (stats.quizzesTaken / 4) * 30 +
            (stats.capstoneDone / 5) * 30 +
            (stats.checklistDone / 9) * 15
        )
      ),
    [stats]
  );

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedOverall(overall), 150);
    return () => clearTimeout(timer);
  }, [overall]);

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const isAdminOrInstructor = user?.role === "admin" || user?.role === "instructor";

  const milestoneMsg = getMilestoneMessage(animatedOverall);
  const streak = getStreakMessage(animatedOverall);
  const StreakIcon = streak.icon;

  // Milestone markers for the progress bar
  const milestones = [25, 50, 75];

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* ═══════════════════════════════════════════════════════════════════════
          1. HERO GREETING
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl surface-card">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-violet-400/8 blur-2xl" />

        <div className="relative px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          {/* Top badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 dark:border-blue-800/40 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              <Sparkles className="h-3 w-3" />
              Version 2026
            </span>
            {user?.cohort && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                <Users className="h-3 w-3" />
                {user.cohort}
              </span>
            )}
            {user?.status && user.status !== "ACTIVE" && (
              <span className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-medium capitalize text-muted-foreground">
                {user.status.toLowerCase()}
              </span>
            )}
            {/* Streak badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 dark:border-amber-800/40 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              <StreakIcon className="h-3 w-3" />
              {streak.text}
            </span>
          </div>

          {/* Greeting + name */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
            {greeting},{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              {firstName}
            </span>
            .
          </h1>

          {/* Subtitle */}
          <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {isAdminOrInstructor
              ? "Welcome to the training program admin dashboard. Manage your students and review their progress below."
              : user?.currentPhase
              ? `You're currently on Phase ${user.currentPhase} of 4${
                  user.targetAcos ? ` · target ACoS ${user.targetAcos}%` : ""
                }. Pick up where you left off or jump to a new module.`
              : "An 8–12 week journey from Amazon marketplace fundamentals to a complete PPC strategy you can present to a real client."}
          </p>

          {/* CTA buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            {isAdminOrInstructor ? (
              <BrandButton onClick={() => setSection("students")} size="lg" className="w-full sm:w-auto">
                <GraduationCap className="h-4 w-4 mr-2" />
                Manage students
              </BrandButton>
            ) : (
              <BrandButton onClick={() => setSection("curriculum")} size="lg" className="w-full sm:w-auto">
                <BookOpen className="h-4 w-4 mr-2" />
                {user?.currentPhase && user.currentPhase > 1 ? "Continue learning" : "Start learning"}
              </BrandButton>
            )}
            <Button onClick={() => setSection("tools")} size="lg" variant="outline" className="w-full sm:w-auto">
              <Calculator className="h-4 w-4 mr-2" />
              Open the tools
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. STATS CARDS — unified bar with rings
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          let value = 0;
          if (card.key === "exercises") value = stats.exercisesAttempted;
          if (card.key === "quizzes") value = stats.quizzesTaken;
          if (card.key === "capstone") value = stats.capstoneDone;
          if (card.key === "checklist") value = stats.checklistDone;
          const pct = Math.round((value / card.total) * 100);

          return (
            <Card
              key={card.key}
              className={cn(
                "group relative overflow-hidden border-border/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              )}
            >
              {/* Top accent line */}
              <div className={cn("absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r", card.accent)} />

              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-muted-foreground truncate">
                      {card.label}
                    </p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-extrabold tabular-nums leading-none">{value}</span>
                      <span className="text-xs text-muted-foreground font-medium">/ {card.total}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MiniRing pct={pct} color={card.ring} size={32} />
                    <div className={cn("hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white opacity-80 group-hover:opacity-100 transition-opacity", card.accent)}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <Progress value={pct} className="h-1.5" />
                </div>
                <p className="mt-1.5 text-[10px] sm:text-[11px] text-muted-foreground font-medium">{pct}% complete</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. OVERALL PROGRESS BAR — with milestones & animation
          ═══════════════════════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold">Overall program progress</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{milestoneMsg}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-3xl sm:text-4xl font-extrabold tabular-nums">{animatedOverall}%</span>
              <Flame className={cn("h-7 w-7 sm:h-8 sm:w-8 transition-colors duration-500", animatedOverall >= 50 ? "text-orange-500" : "text-muted-foreground/40")} />
            </div>
          </div>

          {/* Progress bar with milestone markers */}
          <div className="relative">
            <Progress value={animatedOverall} className="h-3 sm:h-3.5 transition-all duration-700 ease-out" />
            {/* Milestone markers */}
            {milestones.map((m) => (
              <div
                key={m}
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${m}%`, transform: `translateX(-50%) translateY(-50%)` }}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border-2 transition-all duration-500",
                    animatedOverall >= m
                      ? "bg-blue-500 border-blue-500 shadow-sm shadow-blue-500/30"
                      : "bg-background border-muted-foreground/30"
                  )}
                />
                <span
                  className={cn(
                    "absolute top-5 text-[9px] font-semibold whitespace-nowrap transition-colors duration-500",
                    animatedOverall >= m ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/50"
                  )}
                >
                  {m}%
                </span>
              </div>
            ))}
          </div>

          {/* Weight legend */}
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Exercises 25%</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Quizzes 30%</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Capstone 30%</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> Checklist 15%</span>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. SERVER-BACKED PROGRESS (instructor-tracked)
          ═══════════════════════════════════════════════════════════════════════ */}
      {user?.serverProgress && user.serverProgress.length > 0 && (
        <Card className="overflow-hidden border-violet-200/50 dark:border-violet-900/30">
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-500" />
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              Instructor-tracked progress
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Recorded progress for {user.name}
              {user.cohort ? ` · ${user.cohort}` : ""} · Currently on Phase {user.currentPhase}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {user.serverProgress.map((p) => {
                const exPct = p.exercisesTotal > 0 ? Math.round((p.exercisesDone / p.exercisesTotal) * 100) : 0;
                const quizPct = p.quizScore !== null && p.quizTotal > 0 ? Math.round((p.quizScore / p.quizTotal) * 100) : null;
                return (
                  <div
                    key={p.phaseNumber}
                    className="rounded-xl border border-violet-200/50 dark:border-violet-900/30 bg-violet-50/50 dark:bg-violet-950/10 p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold">
                          {p.phaseNumber}
                        </div>
                        <p className="text-xs font-bold">Phase {p.phaseNumber}</p>
                      </div>
                      {p.capstoneDone && (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-[9px] font-semibold">
                          <Trophy className="h-2.5 w-2.5 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Exercises</span>
                          <span className="font-bold tabular-nums">{p.exercisesDone}/{p.exercisesTotal}</span>
                        </div>
                        <Progress value={exPct} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Quiz</span>
                          <span className="font-bold tabular-nums">
                            {p.quizScore !== null ? `${p.quizScore}/${p.quizTotal}` : "Not taken"}
                          </span>
                        </div>
                        {quizPct !== null && <Progress value={quizPct} className="h-1.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          5. PROGRESS CHARTS — Recharts visualization
          ═══════════════════════════════════════════════════════════════════════ */}
      {user?.serverProgress && user.serverProgress.length > 0 && (
        <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Phase completion bar chart */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BarChart3 className="h-4 w-4" />
                </div>
                Phase completion
              </CardTitle>
              <CardDescription className="text-xs">Exercises and quiz scores per phase</CardDescription>
            </CardHeader>
            <CardContent>
              {typeof window !== "undefined" && (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={user.serverProgress.map((p) => ({
                    name: `Phase ${p.phaseNumber}`,
                    Exercises: Math.round((p.exercisesDone / Math.max(p.exercisesTotal, 1)) * 100),
                    Quiz: p.quizScore !== null ? Math.round((p.quizScore / Math.max(p.quizTotal, 1)) * 100) : 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Exercises" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Quiz" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Quiz score comparison */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Award className="h-4 w-4" />
                </div>
                Quiz scores
              </CardTitle>
              <CardDescription className="text-xs">Correct answers out of total questions</CardDescription>
            </CardHeader>
            <CardContent>
              {typeof window !== "undefined" && (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={user.serverProgress.filter(p => p.quizScore !== null).map((p) => ({
                    name: `Phase ${p.phaseNumber}`,
                    Correct: p.quizScore ?? 0,
                    Total: p.quizTotal,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis domain={[0, "dataMax + 1"]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Correct" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} stackId="a" />
                    <Bar dataKey="Total" fill="#22c55e20" radius={[4, 4, 0, 0]} maxBarSize={40} stackId="a" opacity={0.25} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          6. WHAT YOU'LL LEARN + WHAT YOU NEED — two-column layout
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        {/* What you'll learn */}
        <Card className="lg:col-span-3 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Target className="h-4 w-4" />
              </div>
              What you will learn
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">By the end of this program, you will be able to:</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
              {programOverview.learningOutcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm group">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                  <span className="leading-relaxed">{outcome}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* What you need */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
              What you need
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Before you start</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {programOverview.whatYouNeed.map((need, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                  <Circle className="h-2 w-2 mt-1.5 fill-blue-500 text-blue-500 shrink-0" />
                  <span className="leading-relaxed">{need}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. HOW THE PROGRAM WORKS — connected step cards
          ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Rocket className="h-4 w-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold">How the program works</h3>
        </div>
        <div className="grid gap-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {programOverview.howItWorks.map((step, i) => (
            <div key={i} className="relative group">
              {/* Connector line (hidden on last item and mobile) */}
              {i < programOverview.howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[calc(50%+24px)] w-[calc(100%-48px)] h-px bg-gradient-to-r from-border to-border/50 z-0" />
              )}
              <Card className="relative z-10 border-border/50 bg-card/80 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-bold shadow-sm">
                      {i + 1}
                    </div>
                    <span className="font-bold text-sm">{step.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          7. 12-WEEK ROADMAP — redesigned phase cards
          ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Star className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold">Your 12-week roadmap</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSection("curriculum")} className="shrink-0 text-xs font-semibold">
            <span className="hidden sm:inline">Open curriculum</span>
            <span className="sm:hidden">View all</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>

        <div className="grid gap-3 sm:gap-4">
          {phases.map((phase) => {
            const phaseQuiz = quizResults[phase.checkpoint?.id ?? ""];
            return (
              <Card
                key={phase.id}
                className="group border-border/50 hover:border-blue-300/60 dark:hover:border-blue-700/60 transition-all duration-200 cursor-pointer hover:shadow-md"
                onClick={() => {
                  if (phase.modules[0]) setActiveModule(phase.modules[0].id, phase.id);
                }}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4 sm:gap-5">
                    {/* Phase number badge */}
                    <div className={cn("flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", phase.color)}>
                      <span className="font-extrabold text-lg sm:text-xl">{phase.number}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <h4 className="font-bold text-sm sm:text-base">Phase {phase.number}: {phase.title}</h4>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          <Calendar className="h-2.5 w-2.5" />
                          {phase.weeks} · {phase.duration}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{phase.subtitle}</p>

                      {/* Module chips */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {phase.modules.map((m) => (
                          <span
                            key={m.id}
                            className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {m.code} · {m.title}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quiz score + arrow */}
                    <div className="hidden sm:flex shrink-0 flex-col items-end gap-2">
                      {phaseQuiz && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          <Award className="h-3 w-3" />
                          {phaseQuiz.score}/{phaseQuiz.total}
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8. SUBMISSION DEADLINES — cleaner grid with urgency
          ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold">Submission deadlines</h3>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {submissionChecklist.map((item, i) => (
            <Card key={i} className="group border-border/50 transition-all duration-200 hover:shadow-sm">
              <CardContent className="p-4 sm:p-5">
                {/* Phase label */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400">
                    {item.phase}
                  </p>
                </div>

                {/* Deadline */}
                <p className="text-sm sm:text-base font-bold">{item.deadline}</p>

                {/* Items list */}
                <ul className="mt-3 space-y-1.5">
                  {item.items.map((it, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-blue-500/60 shrink-0" />
                      <span className="leading-relaxed">{it}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
