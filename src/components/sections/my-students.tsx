"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn, getInitials } from "@/lib/utils";
import { BrandButton } from "@/components/shared/buttons";
import { MagnifyingGlass as Search, CircleNotch as Loader2, WarningCircle as AlertCircle, Users, UserCheck, TrendUp as TrendingUp, BookOpen, Pencil, CheckCircle as CheckCircle2, ArrowsCounterClockwise as RotateCcw, GraduationCap, CaretDown as ChevronDown, CaretUp as ChevronUp, Clock, Target, Medal as Award, ChartBar as BarChart3, X } from "@phosphor-icons/react";
import styles from "./my-students.module.css";

type Student = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  cohort: string | null;
  currentPhase: number;
  targetAcos: number;
  enrolledAt: string;
  progress?: any[];
};

// =============================================================
// Helpers
// =============================================================

function getPhaseLabel(phase: number) {
  const labels: Record<number, string> = {
    1: "Foundation",
    2: "Campaign Build",
    3: "Optimization",
    4: "Scale & Automate",
  };
  return labels[phase] ?? `Phase ${phase}`;
}

function getPhaseColor(phase: number) {
  const colors: Record<number, string> = {
    1: "bg-sky-500",
    2: "bg-violet-500",
    3: "bg-amber-500",
    4: "bg-emerald-500",
  };
  return colors[phase] ?? "bg-gray-500";
}

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "INACTIVE":
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    case "COMPLETED":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function getAvatarGradient(id: string) {
  const gradients = [
    "bg-orange-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-cyan-500",
    "bg-fuchsia-500",
    "bg-lime-500",
  ];
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

// =============================================================
// Progress bar component
// =============================================================

function ProgressBar({ value, max = 4, className }: { value: number; max?: number; className?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  // Match the threshold-based color scheme used in students.tsx so progress
  // reads the same way across both pages.
  const barColor =
    pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-orange-500";
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          Phase {value} of {max}
        </span>
        <span className="text-[11px] font-bold tabular-nums text-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// =============================================================
// Stat card component
// =============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  accentColor,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accentColor: string;
  iconBg: string;
}) {
  return (
    <Card className="relative overflow-hidden border-border/50 hover:border-border transition-colors">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl sm:text-3xl font-bold tabular-nums mt-1.5">{value}</p>
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
            <Icon className={cn("h-5 w-5", accentColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================
// Main section
// =============================================================

export function MyStudentsSection() {
  const user = useAppStore((s) => s.user);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("role", "STUDENT");
      params.set("progress", "true");
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/students?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load students");
      const data = await res.json();
      setStudents(data.students ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const searchRef = useRef(search);
  const fetchRef = useRef(fetchStudents);
  const refetch = useCallback(() => fetchRef.current(), []);

  useEffect(() => {
    searchRef.current = search;
    fetchRef.current = fetchStudents;
  });

  useEffect(() => {
    const t = setTimeout(() => fetchRef.current(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search]);

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "ACTIVE").length;
  const avgPhase =
    totalStudents > 0
      ? Math.round((students.reduce((sum, s) => sum + s.currentPhase, 0) / totalStudents) * 10) / 10
      : 0;
  const completedStudents = students.filter((s) => s.currentPhase >= 4).length;

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Students</h1>
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-0.5 text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-primary/20 dark:border-primary/40"
            >
              {totalStudents}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track progress, review submissions, and guide your students.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          accentColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
        />
        <StatCard
          icon={UserCheck}
          label="Active"
          value={activeStudents}
          accentColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Phase"
          value={avgPhase}
          accentColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-50 dark:bg-violet-950/40"
        />
        <StatCard
          icon={Award}
          label="Completed"
          value={completedStudents}
          accentColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or cohort…"
          className="pl-10 h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>
              <p className="text-xs text-rose-600/70 dark:text-rose-400/70">Could not load student data</p>
            </div>
            <BrandButton size="sm" variant="danger" onClick={refetch}>
              Retry
            </BrandButton>
          </CardContent>
        </Card>
      )}

      {/* Students list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 h-14 w-14 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Loading students</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fetching the latest progress data…</p>
          </div>
        </div>
      ) : students.length === 0 ? (
        <Card className="border-dashed border-border/50">
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <GraduationCap className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                {search ? "No matching students" : "No students yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {search
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Students assigned to your cohorts will appear here. Share the enrollment link to get started."}
              </p>
            </div>
            {search && (
              <BrandButton variant="outline" size="sm" onClick={() => setSearch("")}>
                Clear search
              </BrandButton>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {students.map((s) => (
            <StudentCard
              key={s.id}
              student={s}
              instructorId={user?.id ?? ""}
              onGrade={(sub) => setGradingSubmission(sub)}
            />
          ))}
        </div>
      )}

      {/* Grading dialog */}
      {gradingSubmission && (
        <GradingDialog
          submission={gradingSubmission}
          instructorId={user?.id ?? ""}
          onClose={() => setGradingSubmission(null)}
          onGraded={() => {
            setGradingSubmission(null);
            refetch();
            toast({ title: "Submission graded", description: "Student has been notified." });
          }}
        />
      )}
    </div>
  );
}

// =============================================================
// Student card
// =============================================================

function StudentCard({
  student,
  instructorId,
  onGrade,
}: {
  student: Student;
  instructorId: string;
  onGrade: (submission: any) => void;
}) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(`/api/exercises/submissions?studentId=${student.id}&latest=true`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled) {
          setSubmissions(data.submissions ?? []);
          setLoadingSubs(false);
        }
      } catch {
        if (!cancelled) setLoadingSubs(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [student.id, expanded]);

  const progress = student.progress ?? [];
  const ungradedCount = submissions.filter((s) => s.status === "SUBMITTED").length;
  const quizCount = progress.filter((p: any) => p.quizScore !== null).length;
  const avatarGradient = getAvatarGradient(student.id);
  const phaseColor = getPhaseColor(student.currentPhase);

  return (
    <Card className="group border-border/50 hover:border-border hover:shadow-sm transition-all duration-200">
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold shadow-sm",
              avatarGradient
            )}
          >
            {getInitials(student.name)}
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{student.name}</p>
            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
          </div>

          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border shrink-0",
              getStatusColor(student.status)
            )}
          >
            {student.status === "ACTIVE" && (
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
            {student.status.toLowerCase()}
          </span>
        </div>

        {/* Phase indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full ",
                  phaseColor
                )}
              />
              <span className="text-xs font-medium text-foreground">
                {getPhaseLabel(student.currentPhase)}
              </span>
            </div>
            <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
              {student.currentPhase}/4
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                phaseColor
              )}
              style={{ width: `${Math.min(100, (student.currentPhase / 4) * 100)}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="flex flex-col items-center rounded-lg bg-muted/30 py-2.5 px-2">
            <Target className="h-3.5 w-3.5 text-muted-foreground/60 mb-1" />
            <p className="text-sm font-bold tabular-nums">{student.targetAcos}%</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">Target ACoS</p>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-muted/30 py-2.5 px-2">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/60 mb-1" />
            <p className="text-sm font-bold tabular-nums">{progress.length}/4</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">Phases</p>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-muted/30 py-2.5 px-2">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground/60 mb-1" />
            <p className="text-sm font-bold tabular-nums">{quizCount}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">Quizzes</p>
          </div>
        </div>

        {/* Cohort tag */}
        {student.cohort && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{student.cohort}</span>
            <span className="text-muted-foreground/40">·</span>
            <Clock className="h-3 w-3" />
            <span>
              Enrolled{" "}
              {new Date(student.enrolledAt).toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border transition-all"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Hide submissions
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              View submissions
              {ungradedCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                  {ungradedCount}
                </span>
              )}
            </>
          )}
        </button>

        {/* Submissions list */}
        {expanded && (
          <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
            {loadingSubs ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No submissions yet.</p>
              </div>
            ) : (
              submissions.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "rounded-xl border p-3 transition-colors",
                    s.status === "SUBMITTED"
                      ? "border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/10"
                      : "border-border/50 bg-card"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {s.exercise.code} · {s.exercise.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(s.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold border shrink-0",
                        s.status === "GRADED"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          : s.status === "RETURNED"
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                          : s.status === "SUBMITTED"
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {s.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {s.answer}
                  </p>
                  {s.status === "SUBMITTED" && (
                    <BrandButton
                      size="sm"
                      variant="outline"
                      className="w-full mt-2.5 h-7 text-[11px]"
                      onClick={() => onGrade(s)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Grade
                    </BrandButton>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================
// Grading dialog
// =============================================================

function GradingDialog({
  submission,
  instructorId,
  onClose,
  onGraded,
}: {
  submission: any;
  instructorId: string;
  onClose: () => void;
  onGraded: () => void;
}) {
  const [status, setStatus] = useState<"GRADED" | "RETURNED">("GRADED");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/exercises/submissions/${submission.id}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradedBy: instructorId,
          status,
          score: score ? parseFloat(score) : undefined,
          feedback: feedback.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to grade");
      }
      onGraded();
    } catch (e: any) {
      toast({
        title: "Grading failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Grade submission</DialogTitle>
          <DialogDescription className="text-sm">
            {submission.exercise.code} · {submission.exercise.title} (
            {submission.exercise.type.toLowerCase()})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Student's answer */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Student&apos;s answer
            </Label>
            <div className="mt-2 rounded-xl border border-border/50 bg-muted/20 p-4 max-h-48 overflow-y-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{submission.answer}</p>
            </div>
          </div>

          {/* Model answer if available */}
          {submission.exercise.modelAnswer && (
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Model answer (for reference)
              </Label>
              <div className="mt-2 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/10 p-4 max-h-32 overflow-y-auto">
                <p className="text-xs leading-relaxed whitespace-pre-wrap">
                  {submission.exercise.modelAnswer}
                </p>
              </div>
            </div>
          )}

          {/* Grade form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Status</Label>
              <div className="flex gap-2">
                <BrandButton
                  size="sm"
                  variant={status === "GRADED" ? "success" : "outline"}
                  onClick={() => setStatus("GRADED")}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Grade
                </BrandButton>
                <BrandButton
                  size="sm"
                  variant={status === "RETURNED" ? "danger" : "outline"}
                  onClick={() => setStatus("RETURNED")}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Return
                </BrandButton>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Score (optional)</Label>
              <Input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 0.95"
                step="0.05"
                min="0"
                max="1"
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave feedback for the student…"
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <BrandButton variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </BrandButton>
          <BrandButton
            variant={status === "GRADED" ? "success" : "danger"}
            onClick={submit}
            loading={saving}
          >
            {status === "GRADED" ? "Submit grade" : "Return for revision"}
          </BrandButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
