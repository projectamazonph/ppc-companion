"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore, useProgressStats } from "@/lib/store";
import { phases } from "@/lib/course-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen, Flame, TrendUp as TrendingUp, Lightning as Zap, Rocket, CheckCircle as CheckCircle2, Lock, CaretRight as ChevronRight, MagnifyingGlass as Search, Medal as Award, Star, CalendarBlank as Calendar, Target } from "@phosphor-icons/react";

// ─── Stat card configuration ────────────────────────────────────────────────
const statCards = [
  {
    key: "progress",
    label: "Course Progress",
    icon: Target,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "streak",
    label: "Day Streak",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    key: "badges",
    label: "Badges Earned",
    icon: Award,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    key: "points",
    label: "Total Points",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
] as const;

// ─── Streak / motivation helper ─────────────────────────────────────────────
function getStreakInfo(pct: number): { text: string; icon: typeof Flame; value: string } {
  if (pct >= 75) return { text: "On fire", icon: Flame, value: "12 Days" };
  if (pct >= 50) return { text: "Building momentum", icon: TrendingUp, value: "7 Days" };
  if (pct >= 25) return { text: "Making progress", icon: Zap, value: "5 Days" };
  return { text: "Ready to start", icon: Rocket, value: "1 Day" };
}

// ─── Motivational messages ──────────────────────────────────────────────────
function getMotivation(pct: number): string {
  if (pct >= 100) return "Program complete \u2014 you\u2019re an Amazon PPC pro!";
  if (pct >= 75) return "Final stretch \u2014 you\u2019ve got this!";
  if (pct >= 50) return "Halfway there \u2014 momentum is building!";
  if (pct >= 25) return "Great start \u2014 you\u2019re building real skills!";
  return "Every expert was once a beginner. Let\u2019s go!";
}

// ─── Recent activity generator ──────────────────────────────────────────────
function generateRecentActivity(
  quizResults: Record<string, { quizId: string; score: number; total: number; completedAt: number }>,
  exerciseAnswers: Record<string, string>
) {
  const activities: { icon: typeof CheckCircle2; iconBg: string; iconColor: string; title: string; detail: string }[] = [];

  Object.values(quizResults)
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, 3)
    .forEach((q) => {
      const pct = Math.round((q.score / q.total) * 100);
      activities.push({
        icon: CheckCircle2,
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        title: `Completed Quiz: ${q.quizId.replace(/-/g, " ")}`,
        detail: `${pct}% score`,
      });
    });

  const exerciseCount = Object.values(exerciseAnswers).filter((a) => a?.trim()).length;
  if (exerciseCount > 0) {
    activities.push({
      icon: BookOpen,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: `Practiced ${exerciseCount} exercise${exerciseCount > 1 ? "s" : ""}`,
      detail: "Keep practicing!",
    });
  }

  while (activities.length < 3) {
    activities.push({
      icon: Calendar,
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
      title: "No recent activity yet",
      detail: "Start learning to see your progress here",
    });
  }

  return activities.slice(0, 3);
}

// ─── Main component ──────────────────────────────────────────────────────────
export function DashboardSection() {
  const setSection = useAppStore((s) => s.setSection);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const stats = useProgressStats();
  const quizResults = useAppStore((s) => s.quizResults);
  const exerciseAnswers = useAppStore((s) => s.exerciseAnswers);
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

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const isAdminOrInstructor = user?.role === "admin" || user?.role === "instructor";
  const streak = getStreakInfo(animatedOverall);
  const badges = stats.quizzesTaken;
  const points =
    stats.exercisesAttempted * 50 +
    stats.quizzesTaken * 100 +
    stats.capstoneDone * 200 +
    stats.checklistDone * 30;

  // Get recent activity
  const recentActivity = useMemo(
    () => generateRecentActivity(quizResults, exerciseAnswers),
    [quizResults, exerciseAnswers]
  );

  // Get continue learning modules \u2014 first incomplete module per phase
  const continueModules = useMemo(() => {
    const items: { module: (typeof phases)[0]["modules"][0]; phase: (typeof phases)[0] }[] = [];
    for (const phase of phases) {
      for (const mod of phase.modules) {
        if (!user?.currentPhase || phase.number <= (user.currentPhase ?? 1) + 1) {
          items.push({ module: mod, phase });
          if (items.length >= 3) break;
        }
      }
      if (items.length >= 3) break;
    }
    return items;
  }, [user]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
          1. HERO GREETING + SEARCH
          \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Mabuhay, {firstName}!
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground">
            {isAdminOrInstructor
              ? "Manage your students and review their progress below."
              : getMotivation(animatedOverall)}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search lessons..."
              className="pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
            />
          </div>
        </div>
      </section>

      {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
          2. STAT CARDS \u2014 Course Progress, Day Streak, Badges, Points
          \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Course Progress */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Course Progress</span>
            <div className={cn("p-1.5 rounded-lg", statCards[0].bg)}>
              <Target className={cn("h-5 w-5", statCards[0].color)} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{animatedOverall}%</p>
            {animatedOverall > 0 && (
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> keep going
              </p>
            )}
          </div>
        </div>

        {/* Day Streak */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Day Streak</span>
            <div className={cn("p-1.5 rounded-lg", statCards[1].bg)}>
              <Flame className={cn("h-5 w-5", statCards[1].color)} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{streak.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{streak.text}</p>
          </div>
        </div>

        {/* Badges Earned */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Badges Earned</span>
            <div className={cn("p-1.5 rounded-lg", statCards[2].bg)}>
              <Award className={cn("h-5 w-5", statCards[2].color)} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{badges}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {badges > 0 ? `${4 - badges} more to unlock` : "Complete quizzes to earn badges"}
            </p>
          </div>
        </div>

        {/* Total Points */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Points</span>
            <div className={cn("p-1.5 rounded-lg", statCards[3].bg)}>
              <Star className={cn("h-5 w-5", statCards[3].color)} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {points.toLocaleString()} XP
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {points > 0 ? "Keep earning" : "Complete activities to earn points"}
            </p>
          </div>
        </div>
      </section>

      {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
          3. CONTINUE LEARNING \u2014 course cards with progress
          \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-foreground">Continue Learning</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSection("curriculum")}
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            View all
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {continueModules.map(({ module: mod, phase }, i) => {
            const modulePct =
              i === 0 ? animatedOverall : i === 1 ? Math.max(0, animatedOverall - 15) : 0;
            const isStarted = modulePct > 0;
            const isLocked = !user?.currentPhase && i > 0;

            return (
              <div
                key={mod.id}
                className={cn(
                  "bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col h-full group transition-shadow hover:shadow-md",
                  isLocked && "opacity-75"
                )}
              >
                {/* Module header with phase color accent */}
                <div className="h-32 sm:h-40 relative overflow-hidden">
                  <div
                    className={cn(
                      "absolute inset-0 opacity-15",
                      phase.number === 1
                        ? "bg-emerald-500"
                        : phase.number === 2
                        ? "bg-rose-500"
                        : phase.number === 3
                        ? "bg-amber-500"
                        : "bg-violet-500"
                    )}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-2xl text-white text-xl font-bold shadow-lg ",
                        phase.number === 1
                          ? "bg-emerald-500"
                          : phase.number === 2
                          ? "bg-rose-500"
                          : phase.number === 3
                          ? "bg-amber-500"
                          : "bg-violet-500"
                      )}
                    >
                      {mod.code}
                    </div>
                  </div>
                  {isLocked && (
                    <div className="absolute top-3 left-3 bg-muted text-xs font-bold px-2 py-1 rounded text-muted-foreground">
                      Locked
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-1 gap-4">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-foreground leading-tight mb-1">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {phase.title} \u2014 {phase.subtitle}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-col gap-3">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${modulePct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">
                        {isStarted ? `${modulePct}% Complete` : "Not Started"}
                      </span>
                      {isLocked ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Prerequisite
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant={isStarted ? "default" : "outline"}
                          className="text-xs h-8"
                          onClick={() => {
                            setActiveModule(mod.id, phase.id);
                          }}
                        >
                          {isStarted ? "Resume" : "Start"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
          4. RECENT ACTIVITY + YOUR JOURNEY (two-column on desktop)
          \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4 md:pb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-lg md:text-xl font-bold text-foreground">Recent Activity</h2>
          <div className="bg-card rounded-xl border border-border p-1">
            <div className="flex flex-col">
              {recentActivity.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-4 p-4 hover:bg-muted/30 transition-colors rounded-lg",
                      i < recentActivity.length - 1 && "border-b border-border/50"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-full size-10 flex items-center justify-center shrink-0",
                        activity.iconBg
                      )}
                    >
                      <Icon className={cn("h-5 w-5", activity.iconColor)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Your Journey \u2014 Phase Status */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-foreground">Your Journey</h2>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col h-full">
            {[1, 2, 3, 4].map((n) => {
              const passed = [user?.phase1Pass, user?.phase2Pass, user?.phase3Pass, user?.phase4Pass][
                n - 1
              ];
              const phaseColor =
                n === 1
                  ? "bg-emerald-500"
                  : n === 2
                  ? "bg-rose-500"
                  : n === 3
                  ? "bg-amber-500"
                  : "bg-violet-500";
              const phaseTitle = phases[n - 1]?.title ?? `Phase ${n}`;

              return (
                <div
                  key={n}
                  className={cn(
                    "flex items-center gap-3 p-4 transition-colors hover:bg-muted/30",
                    n < 4 && "border-b border-border/50",
                    user?.currentPhase === n && "bg-primary/5"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold shadow-sm shrink-0",
                      phaseColor
                    )}
                  >
                    {n}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{phaseTitle}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {passed
                        ? "Completed"
                        : user?.currentPhase === n
                        ? "In progress"
                        : "Not started"}
                    </p>
                  </div>
                  {passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : user?.currentPhase === n ? (
                    <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  )}
                </div>
              );
            })}
            {/* Current user highlight */}
            <div className="mt-auto bg-primary/5 p-4 flex items-center gap-3 border-t border-primary/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shrink-0">
                {user?.name
                  ?.split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() ?? "?"}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name ?? "Student"}
                </p>
                <p className="text-xs text-muted-foreground">{points.toLocaleString()} XP</p>
              </div>
              {user?.currentPhase && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                  Phase {user.currentPhase}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}