"use client";

import { useState, useEffect, useMemo } from "react";
import { clsx } from "clsx";
import { useAppStore, useProgressStats } from "@/lib/store";
import { phases } from "@/lib/course-data";
import { Button } from "@/components/ui/button";
import { BookOpen, Flame, TrendUp as TrendingUp, Lightning as Zap, Rocket, CheckCircle as CheckCircle2, Lock, CaretRight as ChevronRight, MagnifyingGlass as Search, Medal as Award, Star, CalendarBlank as Calendar, Target } from "@phosphor-icons/react";
import styles from "./dashboard.module.css";

const statCards = [
  { key: "progress", label: "Course Progress", icon: Target, color: "var(--primary, #FF6B35)", bg: "color-mix(in srgb, var(--primary) 10%, transparent)" },
  { key: "streak", label: "Day Streak", icon: Flame, color: "#F97316", bg: "color-mix(in srgb, #F97316 10%, transparent)" },
  { key: "badges", label: "Badges Earned", icon: Award, color: "#8B5CF6", bg: "color-mix(in srgb, #8B5CF6 10%, transparent)" },
  { key: "points", label: "Total Points", icon: Star, color: "#F59E0B", bg: "color-mix(in srgb, #F59E0B 10%, transparent)" },
] as const;

function getStreakInfo(pct: number): { text: string; icon: typeof Flame; value: string } {
  if (pct >= 75) return { text: "On fire", icon: Flame, value: "12 Days" };
  if (pct >= 50) return { text: "Building momentum", icon: TrendingUp, value: "7 Days" };
  if (pct >= 25) return { text: "Making progress", icon: Zap, value: "5 Days" };
  return { text: "Ready to start", icon: Rocket, value: "1 Day" };
}

function getMotivation(pct: number): string {
  if (pct >= 100) return "Program complete \u2014 you\u2019re an Amazon PPC pro!";
  if (pct >= 75) return "Final stretch \u2014 you\u2019ve got this!";
  if (pct >= 50) return "Halfway there \u2014 momentum is building!";
  if (pct >= 25) return "Great start \u2014 you\u2019re building real skills!";
  return "Every expert was once a beginner. Let\u2019s go!";
}

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
        iconBg: "#ECFDF5",
        iconColor: "#059669",
        title: `Completed Quiz: ${q.quizId.replace(/-/g, " ")}`,
        detail: `${pct}% score`,
      });
    });

  const exerciseCount = Object.values(exerciseAnswers).filter((a) => a?.trim()).length;
  if (exerciseCount > 0) {
    activities.push({
      icon: BookOpen,
      iconBg: "#DBEAFE",
      iconColor: "#2563EB",
      title: `Practiced ${exerciseCount} exercise${exerciseCount > 1 ? "s" : ""}`,
      detail: "Keep practicing!",
    });
  }

  while (activities.length < 3) {
    activities.push({
      icon: Calendar,
      iconBg: "var(--muted, #F4F3EE)",
      iconColor: "var(--muted-foreground, #737373)",
      title: "No recent activity yet",
      detail: "Start learning to see your progress here",
    });
  }

  return activities.slice(0, 3);
}

export function DashboardSection() {
  const setSection = useAppStore((s) => s.setSection);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const stats = useProgressStats();
  const quizResults = useAppStore((s) => s.quizResults);
  const exerciseAnswers = useAppStore((s) => s.exerciseAnswers);
  const user = useAppStore((s) => s.user);

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

  const recentActivity = useMemo(
    () => generateRecentActivity(quizResults, exerciseAnswers),
    [quizResults, exerciseAnswers]
  );

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

  const phaseBg = (n: number) => {
    const map: Record<number, string> = { 1: styles.bgPhase1, 2: styles.bgPhase2, 3: styles.bgPhase3, 4: styles.bgPhase4 };
    return map[n] || styles.bgPhase1;
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.greeting}>Mabuhay, {firstName}!</h1>
          <p className={styles.subtitle}>
            {isAdminOrInstructor
              ? "Manage your students and review their progress below."
              : getMotivation(animatedOverall)}
          </p>
        </div>
        <div className={styles.heroActions}>
          <div className={styles.searchWrap}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--muted-foreground, #737373)" }} />
            <input type="text" placeholder="Search lessons..." className={styles.searchInput} />
          </div>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Course Progress</span>
            <div className={styles.statIconBox} style={{ background: statCards[0].bg }}>
              <Target className="h-5 w-5" style={{ color: statCards[0].color }} />
            </div>
          </div>
          <div>
            <p className={styles.statValue}>{animatedOverall}%</p>
            {animatedOverall > 0 && (
              <p className={styles.statTrend}><TrendingUp className="h-3 w-3" /> keep going</p>
            )}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Day Streak</span>
            <div className={styles.statIconBox} style={{ background: statCards[1].bg }}>
              <Flame className="h-5 w-5" style={{ color: statCards[1].color }} />
            </div>
          </div>
          <div>
            <p className={styles.statValue}>{streak.value}</p>
            <p className={styles.statExtra}>{streak.text}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Badges Earned</span>
            <div className={styles.statIconBox} style={{ background: statCards[2].bg }}>
              <Award className="h-5 w-5" style={{ color: statCards[2].color }} />
            </div>
          </div>
          <div>
            <p className={styles.statValue}>{badges}</p>
            <p className={styles.statExtra}>
              {badges > 0 ? `${4 - badges} more to unlock` : "Complete quizzes to earn badges"}
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Points</span>
            <div className={styles.statIconBox} style={{ background: statCards[3].bg }}>
              <Star className="h-5 w-5" style={{ color: statCards[3].color }} />
            </div>
          </div>
          <div>
            <p className={styles.statValue}>{points.toLocaleString()} XP</p>
            <p className={styles.statExtra}>
              {points > 0 ? "Keep earning" : "Complete activities to earn points"}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Continue Learning</h2>
          <Button variant="ghost" size="sm" onClick={() => setSection("curriculum")}
            className="text-sm font-medium text-primary hover:text-primary/80">
            View all
          </Button>
        </div>
        <div className={clsx(styles.continueGrid, "mt-4")}>
          {continueModules.map(({ module: mod, phase }, i) => {
            const modulePct = i === 0 ? animatedOverall : i === 1 ? Math.max(0, animatedOverall - 15) : 0;
            const isStarted = modulePct > 0;
            const isLocked = !user?.currentPhase && i > 0;

            return (
              <div key={mod.id} className={clsx(styles.moduleCard, isLocked && styles.moduleCardLocked)}>
                <div className={styles.moduleBanner}>
                  <div className={clsx(styles.moduleBannerBg, phaseBg(phase.number))} />
                  <div className={styles.moduleBannerIcon}>
                    <div className={clsx(styles.moduleCodeBox, phaseBg(phase.number))}>
                      {mod.code}
                    </div>
                  </div>
                  {isLocked && <div className={styles.lockedBadge}>Locked</div>}
                </div>
                <div className={styles.moduleBody}>
                  <div>
                    <h3 className={styles.moduleTitle}>{mod.title}</h3>
                    <p className={styles.moduleDesc}>{phase.title} — {phase.subtitle}</p>
                  </div>
                  <div className={styles.moduleFooter}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${modulePct}%` }} />
                    </div>
                    <div className={styles.moduleActions}>
                      <span className={styles.moduleStatus}>
                        {isStarted ? `${modulePct}% Complete` : "Not Started"}
                      </span>
                      {isLocked ? (
                        <span className={styles.lockIcon}>
                          <Lock className="h-3 w-3" /> Prerequisite
                        </span>
                      ) : (
                        <Button size="sm" variant={isStarted ? "default" : "outline"}
                          className="text-xs h-8"
                          onClick={() => { setActiveModule(mod.id, phase.id); }}>
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

      <section className={styles.bottomGrid}>
        <div className={styles.activitySection}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <div className={styles.activityCard}>
            {recentActivity.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <div key={i} className={clsx(styles.activityItem, i < recentActivity.length - 1 && styles.activityItemBordered)}>
                  <div className={styles.activityIconBox} style={{ background: activity.iconBg }}>
                    <Icon className="h-5 w-5" style={{ color: activity.iconColor }} />
                  </div>
                  <div className={styles.activityInfo}>
                    <p className={styles.activityTitle}>{activity.title}</p>
                    <p className={styles.activityDetail}>{activity.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.journeySection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Journey</h2>
          </div>
          <div className={styles.journeyCard}>
            {[1, 2, 3, 4].map((n) => {
              const passed = [user?.phase1Pass, user?.phase2Pass, user?.phase3Pass, user?.phase4Pass][n - 1];
              const phaseTitle = phases[n - 1]?.title ?? `Phase ${n}`;
              return (
                <div key={n} className={clsx(
                  styles.phaseRow,
                  n < 4 && styles.phaseRowBordered,
                  user?.currentPhase === n && styles.phaseRowActive
                )}>
                  <div className={clsx(styles.phaseNumber, phaseBg(n))}>{n}</div>
                  <div className={styles.phaseInfo}>
                    <p className={styles.phaseTitle}>{phaseTitle}</p>
                    <p className={styles.phaseStatus}>
                      {passed ? "Completed" : user?.currentPhase === n ? "In progress" : "Not started"}
                    </p>
                  </div>
                  {passed ? (
                    <CheckCircle2 className={clsx("h-4 w-4", styles.phaseIconComplete)} />
                  ) : user?.currentPhase === n ? (
                    <ChevronRight className={clsx("h-4 w-4", styles.phaseIconActive)} />
                  ) : (
                    <Lock className={clsx("h-4 w-4", styles.phaseIconLocked)} />
                  )}
                </div>
              );
            })}
            <div className={styles.userHighlight}>
              <div className={styles.userAvatarSmall}>
                {user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() ?? "?"}
              </div>
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user?.name ?? "Student"}</p>
                <p className={styles.userXp}>{points.toLocaleString()} XP</p>
              </div>
              {user?.currentPhase && (
                <span className={styles.phaseBadge}>Phase {user.currentPhase}</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
