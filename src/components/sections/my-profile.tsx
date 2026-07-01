"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BrandButton } from "@/components/shared/buttons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  Trophy,
  Bell,
  FileText,
  Activity,
  Tag as TagIcon,
  CheckCircle2,
  Clock,
  GraduationCap,
  BookOpen,
  Award,
  Zap,
  Star,
  Inbox,
  CheckCheck,
  AlertCircle,
  Info,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  Timer,
  Sparkles,
  Lock,
} from "lucide-react";

type ActivityData = {
  student: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    enrolledAt: string;
    currentPhase: number;
    targetAcos: number;
    cohort: string | null;
  };
  stats: {
    submissionsCount: number;
    gradedSubmissions: number;
    quizAttemptsCount: number;
    quizzesPassedCount: number;
    avgQuizPercentage: number | null;
    capstoneStatus: string;
    overallProgress: number;
    currentPhase: number;
  };
  timeline: Array<{
    id: string;
    type: "submission" | "quiz_attempt" | "capstone" | "login" | "notification";
    timestamp: string;
    title: string;
    description: string;
    metadata?: any;
  }>;
  submissions: any[];
  attempts: any[];
  capstone: any;
  progress: any[];
  enrollments: any[];
  tags: any[];
  sessions: any[];
  notifications: any[];
};

export function MyProfileSection() {
  const user = useAppStore((s) => s.user);
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(`/api/students/${user.id}/activity`);
        if (!res.ok) throw new Error("Failed to load profile");
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!user) return null;

  if (loading) {
    return <LoadingState />;
  }

  if (error || !data) {
    return <ErrorState message={error ?? "Profile not found"} />;
  }

  const { student, stats, timeline, submissions, attempts, capstone, progress, tags, notifications, sessions } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <UserCircle className="h-4.5 w-4.5 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My Profile
          </h1>
        </div>
        <p className="text-sm text-muted-foreground pl-[42px]">
          Your training progress, submissions, and activity — all in one place.
        </p>
      </header>

      {/* Profile hero card */}
      <ProfileHeroCard student={student} tags={tags} />

      {/* Quick stats */}
      <QuickStatsGrid student={student} stats={stats} />

      {/* Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabBar />
        <div className="mt-5">
          {/* Activity tab */}
          <TabsContent value="activity" className="mt-0">
            <ActivityTimeline timeline={timeline} />
          </TabsContent>

          {/* Submissions tab */}
          <TabsContent value="submissions" className="mt-0">
            <SubmissionsList submissions={submissions} />
          </TabsContent>

          {/* Quizzes tab */}
          <TabsContent value="quizzes" className="mt-0">
            <QuizzesList attempts={attempts} avgScore={stats.avgQuizPercentage} />
          </TabsContent>

          {/* Notifications tab */}
          <TabsContent value="notifications" className="mt-0">
            <NotificationsTab studentId={user.id!} initialNotifications={notifications} />
          </TabsContent>
        </div>
      </Tabs>

      {/* ── Password Change ── */}
      <div className="rounded-xl border border-border/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Change password</h3>
            <p className="text-[11px] text-muted-foreground">Update your account password</p>
          </div>
        </div>
        <form className="space-y-3 max-w-sm" onSubmit={async (e) => {
          e.preventDefault();
          const f = e.target as HTMLFormElement;
          const cur = (f.querySelector("#cur-pw") as HTMLInputElement).value;
          const np = (f.querySelector("#new-pw") as HTMLInputElement).value;
          const cp = (f.querySelector("#con-pw") as HTMLInputElement).value;
          if (np !== cp) { alert("Passwords don\u2019t match"); return; }
          if (np.length < 6) { alert("Password must be at least 6 characters"); return; }
          try {
            const res = await fetch("/api/auth/change-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ studentId: user.id, currentPassword: cur, newPassword: np }),
            });
            const data = await res.json();
            if (res.ok) { alert("Password updated!"); f.reset(); }
            else { alert(data.error || "Failed"); }
          } catch { alert("Network error"); }
        }}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground/80" htmlFor="cur-pw">Current password</label>
            <Input id="cur-pw" type="password" className="h-9 text-sm" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground/80" htmlFor="new-pw">New password</label>
            <Input id="new-pw" type="password" className="h-9 text-sm" placeholder="At least 6 characters" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground/80" htmlFor="con-pw">Confirm new password</label>
            <Input id="con-pw" type="password" className="h-9 text-sm" placeholder="Repeat new password" required />
          </div>
          <Button type="submit" size="sm" className="w-full gap-2 mt-2">
            <Lock className="h-3.5 w-3.5" />
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}

// =============================================================
// Loading state
// =============================================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-muted-foreground/10" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">Loading your profile…</p>
        <p className="text-xs text-muted-foreground">Gathering your progress data</p>
      </div>
    </div>
  );
}

// =============================================================
// Error state
// =============================================================

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/10">
      <CardContent className="p-8 flex flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
          <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
        </div>
        <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{message}</p>
        <p className="text-xs text-muted-foreground">Try refreshing the page or contact support.</p>
      </CardContent>
    </Card>
  );
}

// =============================================================
// Profile hero card
// =============================================================

function ProfileHeroCard({ student, tags }: { student: ActivityData["student"]; tags: any[] }) {
  const initials = student.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600" />

      <CardContent className="p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white text-2xl sm:text-3xl font-bold shadow-lg shadow-primary-600/20 ring-4 ring-white dark:ring-gray-900">
              {initials}
            </div>
            {/* Online / status dot */}
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 ring-[3px] ring-white dark:ring-gray-900" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 w-full space-y-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {student.name}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{student.email}</span>
              </p>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary-500/10 text-primary-700 dark:text-primary-300 border-0 font-medium capitalize px-2.5 py-0.5">
                {student.role.toLowerCase()}
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-0 font-medium capitalize px-2.5 py-0.5">
                {student.status.toLowerCase()}
              </Badge>
              {student.cohort && (
                <Badge variant="outline" className="border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 font-medium px-2.5 py-0.5">
                  <Star className="h-3 w-3 mr-1" />
                  {student.cohort}
                </Badge>
              )}
              <Badge variant="outline" className="border-border text-muted-foreground font-medium px-2.5 py-0.5">
                <Calendar className="h-3 w-3 mr-1" />
                Enrolled {new Date(student.enrolledAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </Badge>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <TagIcon className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                {tags.map((t) => (
                  <Badge key={t.id} variant="secondary" className="text-[10px] capitalize font-medium px-2 py-0">
                    {t.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================
// Quick stats grid
// =============================================================

function QuickStatsGrid({ student, stats }: { student: ActivityData["student"]; stats: ActivityData["stats"] }) {
  const statCards = [
    {
      label: "Target ACoS",
      value: `${student.targetAcos}%`,
      icon: Target,
      accentColor: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/15",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Overall Progress",
      value: `${stats.overallProgress}%`,
      icon: TrendingUp,
      accentColor: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Submissions",
      value: stats.submissionsCount.toString(),
      icon: FileText,
      accentColor: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500/10 dark:bg-violet-500/15",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Quizzes Passed",
      value: stats.quizzesPassedCount.toString(),
      icon: Trophy,
      accentColor: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((card) => (
        <Card
          key={card.label}
          className="relative overflow-hidden border-border/50 bg-card hover:border-border transition-colors group"
        >
          {/* Colored top accent */}
          <div className={cn("absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r", card.accentColor)} />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </span>
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", card.iconBg)}>
                <card.icon className={cn("h-4 w-4", card.iconColor)} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =============================================================
// Tab bar
// =============================================================

function TabBar() {
  const tabs = [
    { value: "activity", label: "Activity", icon: Activity },
    { value: "submissions", label: "Submissions", icon: ClipboardList },
    { value: "quizzes", label: "Quizzes", icon: BarChart3 },
    { value: "notifications", label: "Inbox", icon: Inbox },
  ];

  return (
    <div className="border-b border-border/60">
      <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all",
              "hover:text-foreground hover:bg-muted/30",
              "data-[state=active]:border-primary-500 data-[state=active]:text-foreground data-[state=active]:bg-transparent",
              "data-[state=active]:shadow-none"
            )}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}

// =============================================================
// Empty state
// =============================================================

function EmptyState({ icon: Icon, message, subtext }: { icon: typeof Activity; message: string; subtext?: string }) {
  return (
    <Card className="border-dashed border-border/50 bg-muted/20">
      <CardContent className="p-10 sm:p-14 flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground/80 max-w-xs mx-auto">{message}</p>
          {subtext && (
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">{subtext}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================
// Activity timeline
// =============================================================

function ActivityTimeline({ timeline }: { timeline: ActivityData["timeline"] }) {
  if (timeline.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        message="No activity yet"
        subtext="Start by reading a module or submitting an exercise to see your activity here."
      />
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border/60 hidden sm:block" />

      {timeline.slice(0, 30).map((item, index) => (
        <ActivityItem key={`${item.type}-${item.id}`} item={item} isLast={index === Math.min(timeline.length, 30) - 1} />
      ))}
    </div>
  );
}

function ActivityItem({ item, isLast }: { item: any; isLast: boolean }) {
  const iconMap = {
    submission: FileText,
    quiz_attempt: Trophy,
    capstone: GraduationCap,
    login: Clock,
    notification: Bell,
  };
  const colorMap = {
    submission: {
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
      icon: "text-blue-600 dark:text-blue-400",
      dot: "bg-blue-500",
    },
    quiz_attempt: {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      icon: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    capstone: {
      bg: "bg-violet-500/10 dark:bg-violet-500/15",
      icon: "text-violet-600 dark:text-violet-400",
      dot: "bg-violet-500",
    },
    login: {
      bg: "bg-sky-500/10 dark:bg-sky-500/15",
      icon: "text-sky-600 dark:text-sky-400",
      dot: "bg-sky-500",
    },
    notification: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      icon: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
  };

  const Icon = iconMap[item.type as keyof typeof iconMap] ?? Activity;
  const colors = colorMap[item.type as keyof typeof colorMap] ?? {
    bg: "bg-muted",
    icon: "text-muted-foreground",
    dot: "bg-muted-foreground",
  };

  return (
    <div className={cn("flex gap-4 sm:gap-5", !isLast && "pb-5")}>
      {/* Timeline dot / icon */}
      <div className="relative z-10 shrink-0 hidden sm:block">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", colors.bg)}>
          <Icon className={cn("h-4.5 w-4.5", colors.icon)} />
        </div>
      </div>

      {/* Card */}
      <Card className="flex-1 border-border/50 bg-card hover:border-border transition-colors">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {/* Mobile icon */}
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg sm:hidden", colors.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", colors.icon)} />
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                {item.description}
              </p>
              {item.metadata?.passed !== undefined && (
                <Badge
                  className={cn(
                    "text-[10px] mt-2 font-medium",
                    item.metadata.passed
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-0"
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-0"
                  )}
                >
                  {item.metadata.passed ? "✓ Passed" : "✗ Did not pass"}
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground/70 shrink-0 font-medium whitespace-nowrap">
              {new Date(item.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================
// Submissions list
// =============================================================

function SubmissionsList({ submissions }: { submissions: any[] }) {
  if (submissions.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        message="No exercise submissions yet"
        subtext="Visit the Exercises section to start working on your assignments."
      />
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((s) => (
        <Card key={s.id} className="border-border/50 bg-card hover:border-border transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">
                    {s.exercise.code}
                  </p>
                  <span className="text-muted-foreground/40">·</span>
                  <p className="text-sm text-foreground/80 truncate">{s.exercise.title}</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Phase {s.exercise.module?.phaseNumber}
                  </span>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="capitalize">{s.exercise.type.toLowerCase()}</span>
                  <span className="text-muted-foreground/30">•</span>
                  <span>
                    {new Date(s.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
              <StatusBadge status={s.status} />
            </div>

            <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-3 bg-muted/30 rounded-lg p-3">
              {s.answer}
            </p>

            {s.feedback && (
              <div className="mt-3 rounded-xl bg-primary-50/50 dark:bg-primary-950/10 border border-primary-200/60 dark:border-primary-900/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary-500/10">
                    <Sparkles className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-400">
                    Instructor feedback
                  </p>
                </div>
                <p className="text-xs text-foreground/85 leading-relaxed">{s.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string }> = {
    GRADED: {
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-0",
      label: "graded",
    },
    RETURNED: {
      className: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-0",
      label: "returned",
    },
    SUBMITTED: {
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-0",
      label: "submitted",
    },
  };
  const c = config[status] ?? {
    className: "bg-muted text-muted-foreground border-0",
    label: status.toLowerCase(),
  };

  return (
    <Badge className={cn("text-[10px] font-medium capitalize shrink-0 px-2.5 py-0.5", c.className)}>
      {c.label}
    </Badge>
  );
}

// =============================================================
// Quizzes list
// =============================================================

function QuizzesList({ attempts, avgScore }: { attempts: any[]; avgScore: number | null }) {
  if (attempts.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        message="No quiz attempts yet"
        subtext="Visit the Quizzes section to take a checkpoint quiz."
      />
    );
  }

  const passedCount = attempts.filter((a) => a.passed).length;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <Zap className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Attempts
              </p>
            </div>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-foreground">{attempts.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <Award className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Passed
              </p>
            </div>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {passedCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Avg score
              </p>
            </div>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-foreground">
              {avgScore !== null ? `${avgScore}%` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attempt cards */}
      <div className="space-y-3">
        {attempts.map((a) => (
          <Card key={a.id} className="border-border/50 bg-card hover:border-border transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{a.quiz.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Phase {a.quiz.module?.phaseNumber}
                    </span>
                    <span className="text-muted-foreground/30">•</span>
                    <span>
                      {new Date(a.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    {a.durationSec && (
                      <>
                        <span className="text-muted-foreground/30">•</span>
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {Math.round(a.durationSec / 60)}m {a.durationSec % 60}s
                        </span>
                      </>
                    )}
                  </div>

                  {/* Score bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          a.passed
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : "bg-gradient-to-r from-rose-500 to-red-500"
                        )}
                        style={{ width: `${Math.min(a.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {a.percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-2 text-xs">
                    <span className="font-semibold tabular-nums text-foreground">
                      {a.score}/{a.total}
                    </span>
                    <span className="text-muted-foreground tabular-nums">correct</span>
                  </div>
                </div>

                <QuizResultBadge passed={a.passed} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuizResultBadge({ passed }: { passed: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 shrink-0 rounded-xl px-3 py-2.5 min-w-[72px]",
        passed
          ? "bg-emerald-500/10 dark:bg-emerald-500/15"
          : "bg-rose-500/10 dark:bg-rose-500/15"
      )}
    >
      {passed ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
      )}
      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          passed
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-rose-700 dark:text-rose-300"
        )}
      >
        {passed ? "Passed" : "Failed"}
      </span>
    </div>
  );
}

// =============================================================
// Notifications tab with mark-as-read
// =============================================================

function NotificationsTab({
  studentId,
  initialNotifications,
}: {
  studentId: string;
  initialNotifications: any[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, markAllRead: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
      );
    } catch {
      // silent
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    } catch {
      // silent
    }
  };

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        message="Your inbox is empty"
        subtext="You'll see welcome messages, grade updates, and announcements here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with mark-all-read */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className="bg-primary-500/10 text-primary-700 dark:text-primary-300 border-0 font-medium text-[11px] px-2.5 py-0.5">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <BrandButton variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
            Mark all read
          </BrandButton>
        )}
      </div>

      {/* Notification cards */}
      <div className="space-y-2">
        {notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} onMarkRead={markOneRead} />
        ))}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: any;
  onMarkRead: (id: string) => void;
}) {
  const n = notification;
  const isUnread = !n.readAt;

  const typeConfig: Record<string, { bg: string; icon: string; Icon: typeof Bell }> = {
    SUCCESS: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      icon: "text-emerald-600 dark:text-emerald-400",
      Icon: CheckCircle2,
    },
    WARNING: {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      icon: "text-amber-600 dark:text-amber-400",
      Icon: AlertTriangle,
    },
    ERROR: {
      bg: "bg-rose-500/10 dark:bg-rose-500/15",
      icon: "text-rose-600 dark:text-rose-400",
      Icon: AlertCircle,
    },
    GRADE: {
      bg: "bg-violet-500/10 dark:bg-violet-500/15",
      icon: "text-violet-600 dark:text-violet-400",
      Icon: Award,
    },
    ASSIGNMENT: {
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
      icon: "text-blue-600 dark:text-blue-400",
      Icon: ClipboardList,
    },
  };

  const config = typeConfig[n.type] ?? {
    bg: "bg-muted",
    icon: "text-muted-foreground",
    Icon: Info,
  };

  return (
    <Card
      className={cn(
        "border-border/50 cursor-pointer transition-all hover:border-border",
        isUnread && "bg-primary-50/30 dark:bg-primary-950/5 border-primary-200/60 dark:border-primary-900/30"
      )}
      onClick={() => isUnread && onMarkRead(n.id)}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              config.bg
            )}
          >
            <config.Icon className={cn("h-4.5 w-4.5", config.icon)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                className={cn(
                  "text-sm truncate pr-2",
                  isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                )}
              >
                {n.title}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted-foreground/70 font-medium whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                {isUnread && (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-500 shrink-0 ring-4 ring-primary-500/20" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">{n.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
