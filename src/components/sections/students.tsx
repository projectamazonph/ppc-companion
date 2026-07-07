"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BrandButton } from "@/components/shared/buttons";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  Filter,
  GraduationCap,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity,
  Clock,
  FileText,
  Trophy,
  Tag as TagIcon,
  LogIn,
  Bell,
  UserCheck,
  UserX,
  BarChart3,
  X,
  ChevronDown,
} from "lucide-react";

// =============================================================
// Types — mirror the Prisma schema
// =============================================================

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";
type Status = "ACTIVE" | "PAUSED" | "GRADUATED" | "WITHDRAWN";

type ProgressEntry = {
  id: string;
  studentId: string;
  phaseNumber: number;
  exercisesDone: number;
  exercisesTotal: number;
  quizScore: number | null;
  quizTotal: number;
  capstoneDone: boolean;
  notes: string | null;
  updatedAt: string;
};

type Student = {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: Status;
  cohort: string | null;
  currentPhase: number;
  targetAcos: number;
  notes: string | null;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
  progress?: ProgressEntry[];
};

// =============================================================
// Helpers
// =============================================================

const ROLE_STYLES: Record<Role, string> = {
  STUDENT: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  INSTRUCTOR: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  ADMIN: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
};

const STATUS_STYLES: Record<Status, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  PAUSED: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  GRADUATED: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  WITHDRAWN: "bg-muted text-muted-foreground border-border",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function computeOverallProgress(progress: ProgressEntry[] | undefined): number {
  if (!progress || progress.length === 0) return 0;
  let total = 0;
  let done = 0;
  for (const p of progress) {
    if (p.exercisesTotal > 0) {
      total += p.exercisesTotal;
      done += p.exercisesDone;
    }
    total += 1;
    if (p.quizScore !== null && p.quizScore / Math.max(1, p.quizTotal) >= 0.6) done += 1;
    if (p.phaseNumber === 4) {
      total += 1;
      if (p.capstoneDone) done += 1;
    }
  }
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

function getInitials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function getAvatarGradient(role: Role): string {
  switch (role) {
    case "STUDENT": return "from-orange-500 to-orange-600";
    case "INSTRUCTOR": return "from-violet-500 to-purple-600";
    case "ADMIN": return "from-rose-500 to-pink-600";
  }
}

// =============================================================
// Stat Card Component
// =============================================================

function StatCard({
  label,
  value,
  icon: Icon,
  accentColor,
  iconBg,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  iconBg: string;
}) {
  return (
    <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className={cn("absolute top-0 left-0 right-0 h-1", accentColor)} />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{label}</p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================
// Main section
// =============================================================

export function StudentsSection() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cohortFilter, setCohortFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (cohortFilter !== "all") params.set("cohort", cohortFilter);
      if (search.trim()) params.set("q", search.trim());
      params.set("progress", "true");

      const res = await fetch(`/api/students?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load students");
      const data = await res.json();
      setStudents(data.students ?? []);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, cohortFilter, search]);

  const fetchStudentsRef = useRef(fetchStudents);
  const refetch = useCallback(() => fetchStudentsRef.current(), []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchStudentsRef.current = fetchStudents;
  });
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (roleFilter !== "all") params.set("role", roleFilter);
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (cohortFilter !== "all") params.set("cohort", cohortFilter);
        if (search.trim()) params.set("q", search.trim());
        params.set("progress", "true");

        const res = await fetch(`/api/students?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load students");
        const data = await res.json();
        if (!cancelled) setStudents(data.students ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const t = setTimeout(run, search ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const cohorts = Array.from(new Set(students.map((s) => s.cohort).filter(Boolean))) as string[];

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/students/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      toast({
        title: "Student deleted",
        description: `${deleteTarget.name} has been removed.`,
      });
      setDeleteTarget(null);
      refetch();
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const totalStudents = students.filter((s) => s.role === "STUDENT").length;
  const activeStudents = students.filter((s) => s.role === "STUDENT" && s.status === "ACTIVE").length;
  const graduated = students.filter((s) => s.status === "GRADUATED").length;
  const avgProgress =
    totalStudents > 0
      ? Math.round(
          students
            .filter((s) => s.role === "STUDENT")
            .reduce((sum, s) => sum + computeOverallProgress(s.progress), 0) / totalStudents
        )
      : 0;

  const hasActiveFilters = roleFilter !== "all" || statusFilter !== "all" || cohortFilter !== "all" || search.trim() !== "";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Students</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage students, instructors, and admins — full CRUD backed by SQLite via Prisma.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="h-9 gap-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <BrandButton onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            <span>Add student</span>
          </BrandButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={totalStudents}
          icon={Users}
          accentColor="bg-gradient-to-r from-orange-500 to-orange-600"
          iconBg="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Active Now"
          value={activeStudents}
          icon={UserCheck}
          accentColor="bg-gradient-to-r from-emerald-500 to-teal-500"
          iconBg="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Graduated"
          value={graduated}
          icon={GraduationCap}
          accentColor="bg-gradient-to-r from-sky-500 to-cyan-500"
          iconBg="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
        <StatCard
          label="Avg Progress"
          value={`${avgProgress}%`}
          icon={BarChart3}
          accentColor="bg-gradient-to-r from-violet-500 to-purple-500"
          iconBg="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
      </div>

      {/* Filter Bar */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or notes..."
                className="pl-9 h-9 bg-muted/30 border-border/50 focus:bg-background transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[130px] h-9 bg-muted/30 border-border/50">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="STUDENT">Students</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructors</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-9 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="GRADUATED">Graduated</SelectItem>
                  <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
              {cohorts.length > 0 && (
                <Select value={cohortFilter} onValueChange={setCohortFilter}>
                  <SelectTrigger className="w-[150px] h-9 bg-muted/30 border-border/50">
                    <SelectValue placeholder="Cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cohorts</SelectItem>
                    {cohorts.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); setCohortFilter("all"); }}
                  className="h-9 text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
              <div className="hidden sm:flex items-center ml-auto">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {loading ? "Loading…" : `${students.length} result${students.length === 1 ? "" : "s"}`}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
              <AlertCircle className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</p>
              <p className="text-xs text-rose-600/70 dark:text-rose-500/70 mt-0.5">Something went wrong while loading students.</p>
            </div>
            <Button size="sm" variant="outline" onClick={refetch} className="shrink-0 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/30">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && students.length === 0 && !error && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading students…</p>
              <p className="text-xs text-muted-foreground mt-1">Fetching the latest data</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && students.length === 0 && (
        <Card className="border-border/50 border-dashed shadow-sm">
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="text-center max-w-sm">
              <p className="text-base font-semibold text-foreground">
                {hasActiveFilters ? "No students match your filters" : "No students yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {hasActiveFilters
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "Get started by adding your first student. You can also add instructors and admins."}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {hasActiveFilters ? (
                <BrandButton size="sm" onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); setCohortFilter("all"); }}>
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Clear all filters
                </BrandButton>
              ) : (
                <BrandButton size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add your first student
                </BrandButton>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {!loading && !error && students.length > 0 && (
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  <th className="text-left font-medium py-3 px-4 text-[11px] uppercase tracking-wider text-muted-foreground/70">Student</th>
                  <th className="text-left font-medium py-3 px-4 text-[11px] uppercase tracking-wider text-muted-foreground/70">Role</th>
                  <th className="text-left font-medium py-3 px-4 text-[11px] uppercase tracking-wider text-muted-foreground/70">Status</th>
                  <th className="text-left font-medium py-3 px-4 text-[11px] uppercase tracking-wider text-muted-foreground/70">Cohort</th>
                  <th className="text-left font-medium py-3 px-4 text-[11px] uppercase tracking-wider text-muted-foreground/70">Phase</th>
                  <th className="text-left font-medium py-3 px-4 text-[11px] uppercase tracking-wider text-muted-foreground/70 min-w-[130px]">Progress</th>
                  <th className="text-left font-medium py-3 px-4 text-[11px] uppercase tracking-wider text-muted-foreground/70">Enrolled</th>
                  <th className="py-3 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {students.map((s) => {
                  const progress = computeOverallProgress(s.progress);
                  return (
                    <tr
                      key={s.id}
                      className="group hover:bg-muted/30 transition-colors duration-150"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-[11px] font-bold bg-gradient-to-br shadow-sm",
                            getAvatarGradient(s.role)
                          )}>
                            {getInitials(s.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate text-foreground/90">{s.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge className={cn("font-medium text-[11px] capitalize", ROLE_STYLES[s.role])} variant="secondary">
                          {s.role.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge className={cn("font-medium text-[11px] capitalize", STATUS_STYLES[s.status])} variant="secondary">
                          {s.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {s.cohort ? (
                          <span className="text-sm text-foreground/80">{s.cohort}</span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground border-border/60">
                          Phase {s.currentPhase}/4
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {s.role === "STUDENT" ? (
                          <div className="flex items-center gap-2.5">
                            <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-300",
                                  progress >= 75 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                                  progress >= 40 ? "bg-gradient-to-r from-orange-500 to-orange-600" :
                                  progress > 0 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                                  "bg-muted"
                                )}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs tabular-nums font-semibold text-foreground/70 w-9 text-right">{progress}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {formatDate(s.enrolledAt)}
                      </td>
                      <td className="py-3.5 px-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-muted"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setViewing(s)} className="text-sm cursor-pointer py-2">
                              <Eye className="h-4 w-4 mr-2.5 text-muted-foreground" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditing(s)} className="text-sm cursor-pointer py-2">
                              <Pencil className="h-4 w-4 mr-2.5 text-muted-foreground" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(s)}
                              className="text-sm cursor-pointer py-2 text-rose-600 dark:text-rose-400 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                            >
                              <Trash2 className="h-4 w-4 mr-2.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create dialog */}
      <StudentFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={() => {
          setCreateOpen(false);
          refetch();
        }}
      />

      {/* Edit dialog */}
      <StudentFormDialog
        open={!!editing}
        onOpenChange={(o) => { if (!o) setEditing(null); }}
        student={editing}
        onSaved={() => {
          setEditing(null);
          refetch();
        }}
      />

      {/* View dialog */}
      <StudentDetailDialog
        student={viewing}
        onOpenChange={(o) => { if (!o) setViewing(null); }}
        onEdit={(s) => { setViewing(null); setEditing(s); }}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.name} ({deleteTarget?.email}) and all
              associated progress entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// =============================================================
// Create / Edit dialog
// =============================================================

function StudentFormDialog({
  open,
  onOpenChange,
  student,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  student?: Student | null;
  onSaved: () => void;
}) {
  const isEdit = !!student;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "STUDENT" as Role,
    status: "ACTIVE" as Status,
    cohort: "",
    currentPhase: 1,
    targetAcos: 30,
    notes: "",
  });
  const { toast } = useToast();

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (student) {
      setForm({
        name: student.name,
        email: student.email,
        role: student.role,
        status: student.status,
        cohort: student.cohort ?? "",
        currentPhase: student.currentPhase,
        targetAcos: student.targetAcos,
        notes: student.notes ?? "",
      });
    } else if (open) {
      setForm({
        name: "",
        email: "",
        role: "STUDENT",
        status: "ACTIVE",
        cohort: "",
        currentPhase: 1,
        targetAcos: 30,
        notes: "",
      });
    }
  }, [student, open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({
        title: "Missing fields",
        description: "Name and email are required.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        status: form.status,
        cohort: form.cohort.trim() || null,
        currentPhase: form.currentPhase,
        targetAcos: form.targetAcos,
        notes: form.notes.trim() || null,
      };
      const res = isEdit
        ? await fetch(`/api/students/${student!.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      toast({
        title: isEdit ? "Student updated" : "Student created",
        description: `${payload.name} has been ${isEdit ? "updated" : "added"} successfully.`,
      });
      onSaved();
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit student" : "Add new student"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isEdit
              ? "Update the student's information below."
              : "Fill in the form to add a new student, instructor, or admin."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Identity Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                <Users className="h-3.5 w-3.5 text-primary" />
              </div>
              Identity
            </div>
            <div className="grid gap-3 sm:grid-cols-2 pl-0.5">
              <div className="space-y-1.5">
                <Label htmlFor="sf-name" className="text-sm font-medium">
                  Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="sf-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sf-email" className="text-sm font-medium">
                  Email <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="sf-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane.doe@example.com"
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Role & Status Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10">
                <GraduationCap className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              Role & Status
            </div>
            <div className="grid gap-3 sm:grid-cols-2 pl-0.5">
              <div className="space-y-1.5">
                <Label htmlFor="sf-role" className="text-sm font-medium">Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                  <SelectTrigger id="sf-role" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sf-status" className="text-sm font-medium">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                  <SelectTrigger id="sf-status" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                    <SelectItem value="GRADUATED">Graduated</SelectItem>
                    <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Program Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Program Details
            </div>
            <div className="grid gap-3 sm:grid-cols-3 pl-0.5">
              <div className="space-y-1.5">
                <Label htmlFor="sf-cohort" className="text-sm font-medium">Cohort</Label>
                <Input
                  id="sf-cohort"
                  value={form.cohort}
                  onChange={(e) => setForm({ ...form, cohort: e.target.value })}
                  placeholder="Spring 2026"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sf-phase" className="text-sm font-medium">Current phase</Label>
                <Select
                  value={String(form.currentPhase)}
                  onValueChange={(v) => setForm({ ...form, currentPhase: parseInt(v, 10) })}
                >
                  <SelectTrigger id="sf-phase" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Phase 1 — Foundations</SelectItem>
                    <SelectItem value="2">Phase 2 — Ads Deep Dive</SelectItem>
                    <SelectItem value="3">Phase 3 — Simulated Practice</SelectItem>
                    <SelectItem value="4">Phase 4 — Reporting & Capstone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sf-acos" className="text-sm font-medium">Target ACoS (%)</Label>
                <Input
                  id="sf-acos"
                  type="number"
                  min={1}
                  max={100}
                  value={form.targetAcos}
                  onChange={(e) => setForm({ ...form, targetAcos: parseFloat(e.target.value) || 30 })}
                  className="h-9 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10">
                <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              Notes
            </div>
            <div className="pl-0.5">
              <Textarea
                id="sf-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes about this student…"
                className="min-h-[80px] text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="h-9">
            Cancel
          </Button>
          <BrandButton onClick={submit} disabled={saving} size="sm">
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Saving…
              </>
            ) : isEdit ? "Save changes" : "Create student"}
          </BrandButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================
// Detail / view dialog
// =============================================================

function StudentDetailDialog({
  student,
  onOpenChange,
  onEdit,
}: {
  student: Student | null;
  onOpenChange: (o: boolean) => void;
  onEdit: (s: Student) => void;
}) {
  const [activity, setActivity] = useState<any>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const studentId = student?.id;

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    const run = async () => {
      try {
        if (!cancelled) {
          setLoadingActivity(true);
          setActivityError(null);
        }
        const r = await fetch(`/api/students/${studentId}/activity`);
        if (!r.ok) throw new Error("Failed to load activity");
        const data = await r.json();
        if (!cancelled) {
          setActivity(data);
          setLoadingActivity(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setActivityError(e.message);
          setLoadingActivity(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (!student) return null;

  const progress = activity?.progress ?? student.progress ?? [];
  const overall = activity?.stats?.overallProgress ?? computeOverallProgress(progress);
  const totalExercises = progress.reduce((s: number, p: any) => s + p.exercisesDone, 0);
  const totalExercisesOutOf = progress.reduce((s: number, p: any) => s + p.exercisesTotal, 0);
  const quizzesTaken = progress.filter((p: any) => p.quizScore !== null).length;
  const avgQuiz = activity?.stats?.avgQuizPercentage ?? 0;

  const tags = activity?.tags ?? [];
  const submissions = activity?.submissions ?? [];
  const attempts = activity?.attempts ?? [];
  const timeline = activity?.timeline ?? [];
  const sessions = activity?.sessions ?? [];

  return (
    <Dialog open={!!student} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold bg-gradient-to-br shadow-md",
              getAvatarGradient(student.role)
            )}>
              {getInitials(student.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold truncate">{student.name}</h2>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge className={cn("font-medium capitalize", ROLE_STYLES[student.role])} variant="secondary">
                {student.role.toLowerCase()}
              </Badge>
              <Badge className={cn("font-medium capitalize", STATUS_STYLES[student.status])} variant="secondary">
                {student.status.toLowerCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <div className="shrink-0 px-6 pt-3 border-b border-border/50">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/30 rounded-lg gap-0.5">
              <TabsTrigger value="overview" className="flex items-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Activity className="h-3.5 w-3.5" />
                <span>Activity</span>
              </TabsTrigger>
              <TabsTrigger value="submissions" className="flex items-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <FileText className="h-3.5 w-3.5" />
                <span>Submissions</span>
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="flex items-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Trophy className="h-3.5 w-3.5" />
                <span>Quizzes</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="px-6 py-4">
              {/* ============================================================ */}
              {/* OVERVIEW TAB                                                 */}
              {/* ============================================================ */}
              <TabsContent value="overview" className="mt-0 space-y-5">
                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <TagIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {tags.map((t: any) => (
                      <Badge key={t.id} variant="secondary" className="text-[10px] capitalize font-medium"
                        style={{ backgroundColor: `var(--color-${t.color}, var(--color-blue))` }}
                      >
                        {t.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Quick facts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                      <Target className="h-3 w-3" /> Target ACoS
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{student.targetAcos}%</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                      <TrendingUp className="h-3 w-3" /> Current phase
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{student.currentPhase}/4</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                      <FileText className="h-3 w-3" /> Submissions
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{activity?.stats?.submissionsCount ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                      <GraduationCap className="h-3 w-3" /> Overall
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{overall}%</p>
                  </div>
                </div>

                {/* Per-phase progress */}
                {progress.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
                      Progress by phase
                    </p>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((pNum) => {
                        const entry = progress.find((p: any) => p.phaseNumber === pNum);
                        return (
                          <div key={pNum} className="rounded-xl border border-border/50 bg-muted/10 p-3.5">
                            <div className="flex items-center justify-between mb-2.5">
                              <p className="text-sm font-semibold">Phase {pNum}</p>
                              {entry ? (
                                <Badge variant="outline" className="text-[10px] font-medium border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                                  Tracked
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] font-medium text-muted-foreground">
                                  Not started
                                </Badge>
                              )}
                            </div>
                            {entry && (
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div>
                                  <p className="text-muted-foreground/70 font-medium">Exercises</p>
                                  <p className="font-semibold tabular-nums mt-0.5">{entry.exercisesDone}/{entry.exercisesTotal}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground/70 font-medium">Quiz score</p>
                                  <p className="font-semibold tabular-nums mt-0.5">
                                    {entry.quizScore !== null ? `${entry.quizScore}/${entry.quizTotal}` : "Not taken"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground/70 font-medium">Capstone</p>
                                  <p className="font-semibold mt-0.5">
                                    {entry.capstoneDone ? (
                                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Done
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">Pending</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Capstone status */}
                {activity?.capstone && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
                      Capstone project
                    </p>
                    <div className="rounded-xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/40 dark:bg-violet-950/10 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold">{activity.capstone.title ?? "Untitled capstone"}</p>
                        <Badge className={cn(
                          "text-[10px] font-medium",
                          activity.capstone.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" :
                          activity.capstone.status === "SUBMITTED" ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" :
                          activity.capstone.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20" :
                          "bg-muted text-muted-foreground border-border"
                        )}>
                          {activity.capstone.status.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                      </div>
                      {activity.capstone.productBrief && (
                        <p className="text-xs text-muted-foreground italic line-clamp-2">{activity.capstone.productBrief}</p>
                      )}
                      {activity.capstone.grade && (
                        <p className="text-xs mt-2 font-medium">Grade: <span className="font-bold">{activity.capstone.grade}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {student.notes && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
                      Instructor notes
                    </p>
                    <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/10 p-4">
                      <p className="text-sm leading-relaxed">{student.notes}</p>
                    </div>
                  </div>
                )}

                {/* Recent sessions */}
                {sessions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
                      Recent sign-ins
                    </p>
                    <div className="space-y-1.5">
                      {sessions.slice(0, 5).map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between text-xs bg-muted/20 border border-border/40 rounded-lg px-3.5 py-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <LogIn className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                            <span className="text-muted-foreground">
                              {new Date(s.loginAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                            </span>
                          </div>
                          {s.durationSec && (
                            <span className="text-muted-foreground font-medium tabular-nums shrink-0">
                              {Math.round(s.durationSec / 60)}m
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ============================================================ */}
              {/* ACTIVITY TAB                                                 */}
              {/* ============================================================ */}
              <TabsContent value="activity" className="mt-0">
                {loadingActivity ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Loading activity…</p>
                      <p className="text-xs text-muted-foreground mt-1">Fetching the latest updates</p>
                    </div>
                  </div>
                ) : activityError ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
                      <AlertCircle className="h-6 w-6 text-rose-500" />
                    </div>
                    <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{activityError}</p>
                  </div>
                ) : timeline.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                      <Activity className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">No activity yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Activity will appear here as the student progresses.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {timeline.map((item: any) => (
                      <ActivityItem key={`${item.type}-${item.id}`} item={item} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ============================================================ */}
              {/* SUBMISSIONS TAB                                              */}
              {/* ============================================================ */}
              <TabsContent value="submissions" className="mt-0">
                {submissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                      <FileText className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">No submissions yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Exercise submissions will appear here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {submissions.map((s: any) => (
                      <div key={s.id} className="rounded-xl border border-border/50 bg-muted/10 p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {s.exercise.code} · {s.exercise.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Phase {s.exercise.module?.phaseNumber} · {s.exercise.type.toLowerCase()} · updated {formatDate(s.updatedAt)}
                            </p>
                          </div>
                          <Badge className={cn(
                            "text-[10px] font-medium shrink-0",
                            s.status === "GRADED" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" :
                            s.status === "RETURNED" ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20" :
                            s.status === "SUBMITTED" ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" :
                            "bg-muted text-muted-foreground border-border"
                          )}>
                            {s.status.toLowerCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{s.answer}</p>
                        {s.feedback && (
                          <div className="mt-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1">Instructor feedback</p>
                            <p className="text-xs text-foreground/90 leading-relaxed">{s.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ============================================================ */}
              {/* QUIZZES TAB                                                  */}
              {/* ============================================================ */}
              <TabsContent value="quizzes" className="mt-0">
                {attempts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                      <Trophy className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">No quiz attempts yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Quiz results will appear here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 text-center">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Attempts</p>
                        <p className="text-xl font-bold tabular-nums mt-1">{attempts.length}</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 text-center">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Passed</p>
                        <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
                          {attempts.filter((a: any) => a.passed).length}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 text-center">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Avg score</p>
                        <p className="text-xl font-bold tabular-nums mt-1">
                          {avgQuiz !== null ? `${avgQuiz}%` : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Attempt list */}
                    <div className="space-y-2">
                      {attempts.map((a: any) => (
                        <div key={a.id} className="rounded-xl border border-border/50 bg-muted/10 p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{a.quiz.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Phase {a.quiz.module?.phaseNumber} · {new Date(a.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                                {a.durationSec && ` · ${Math.round(a.durationSec / 60)}m ${a.durationSec % 60}s`}
                              </p>
                            </div>
                            <Badge className={cn(
                              "text-[10px] font-medium shrink-0",
                              a.passed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                            )}>
                              {a.passed ? "PASSED" : "FAILED"}
                            </Badge>
                          </div>
                          <div className="flex items-baseline gap-3 text-xs">
                            <span className="font-semibold tabular-nums">{a.score}/{a.total}</span>
                            <span className="text-muted-foreground tabular-nums">{a.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="shrink-0 px-6 py-4 border-t border-border/50 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9">
            Close
          </Button>
          <BrandButton onClick={() => onEdit(student)} size="sm">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </BrandButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================
// Activity timeline item
// =============================================================

function ActivityItem({ item }: { item: any }) {
  const iconMap = {
    submission: FileText,
    quiz_attempt: Trophy,
    capstone: GraduationCap,
    login: LogIn,
    notification: Bell,
  };
  const colorMap = {
    submission: "from-orange-500 to-orange-600",
    quiz_attempt: "from-rose-500 to-pink-600",
    capstone: "from-violet-500 to-purple-600",
    login: "from-emerald-500 to-teal-600",
    notification: "from-amber-500 to-orange-600",
  };
  const Icon = iconMap[item.type as keyof typeof iconMap] ?? Activity;
  const color = colorMap[item.type as keyof typeof colorMap] ?? "from-stone-500 to-stone-700";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/10 p-3.5 hover:bg-muted/20 transition-colors">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold truncate">{item.title}</p>
          <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
            {new Date(item.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">{item.description}</p>
        {item.metadata?.passed !== undefined && (
          <Badge className={cn(
            "text-[10px] font-medium mt-2",
            item.metadata.passed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
          )}>
            {item.metadata.passed ? "Passed" : "Did not pass"}
          </Badge>
        )}
        {item.metadata?.status && item.type === "submission" && (
          <Badge className="text-[10px] font-medium mt-2 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20">
            {item.metadata.status.toLowerCase()}
          </Badge>
        )}
      </div>
    </div>
  );
}
