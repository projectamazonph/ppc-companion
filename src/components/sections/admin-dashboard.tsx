"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Student as School, Users, TrendUp as TrendingUp, Medal as Award, UserPlus, BookOpen, GraduationCap, ChartBar as BarChart3, ArrowUpRight, DotsThree as MoreHorizontal, CircleNotch as Loader2, WarningCircle as AlertCircle, FileText as FileCheck, ArrowsClockwise as RefreshCw, MagnifyingGlass as Search } from "@phosphor-icons/react";
import styles from "./admin-dashboard.module.css";

// =============================================================
// Types
// =============================================================

type AdminStats = {
  totalStudents: number;
  activeStudents: number;
  avgCompletion: number;
  totalCohorts: number;
  totalSubmissions: number;
};

type RecentStudent = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

type StatsResponse = {
  stats: AdminStats;
  recentRegistrations: RecentStudent[];
};

// =============================================================
// Status Badge
// =============================================================

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50",
    INACTIVE: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    PENDING: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
    SUSPENDED: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50",
    GRADUATED: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50",
  };

  const labels: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    PENDING: "Pending",
    SUSPENDED: "Suspended",
    GRADUATED: "Graduated",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status] ?? "bg-gray-100 text-gray-600 border-gray-200"
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

// =============================================================
// Admin Dashboard Section
// =============================================================

export function AdminDashboardSection() {
  const setSection = useAppStore((s) => s.setSection);
  const { toast } = useToast();

  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/stats");
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const json = (await res.json()) as StatsResponse;
        if (!cancelled) setData(json);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm font-medium">Failed to load dashboard</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  const statCards = [
    { title: "Total Students", value: stats?.totalStudents ?? 0, subtitle: "All registered users", icon: School, trend: "Live" },
    { title: "Active Students", value: stats?.activeStudents ?? 0, subtitle: "Currently enrolled", icon: Users, trend: "Active" },
    { title: "Completion Rate", value: stats ? `${stats.avgCompletion}%` : "0%", subtitle: "Avg across all phases", icon: Award },
    { title: "Submissions", value: stats?.totalSubmissions ?? 0, subtitle: "Exercise submissions", icon: FileCheck },
  ];

  const quickActions = [
    { icon: UserPlus, label: "Manage Users", section: "students" as const },
    { icon: BookOpen, label: "View Curriculum", section: "curriculum" as const },
    { icon: GraduationCap, label: "View Cohorts", section: "cohorts" as const },
    { icon: BarChart3, label: "Audit Log", section: "audit" as const },
  ];

  const registrations = data?.recentRegistrations ?? [];
  const query = search.trim().toLowerCase();
  const filtered = query
    ? registrations.filter((s) =>
        `${s.name} ${s.email} ${s.role}`.toLowerCase().includes(query)
      )
    : registrations;

  const handleRowAction = (student: RecentStudent) => {
    toast({
      title: "Manage student",
      description: `Options for ${student.name} are coming soon.`,
    });
  };

  return (
    <div className={styles.section}>
      {/* Page header — search + Add Student CTA only; AppShell provides global nav. */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <School className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Platform overview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden w-64 sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students or courses..."
              className="pl-10"
              aria-label="Search registrations"
            />
          </div>
          <Button onClick={() => setSection("students")}>
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <StatIcon className="h-5 w-5" />
                </div>
                {stat.trend && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="stat-value mt-1 text-2xl font-bold text-foreground">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => setSection(action.section)}
                className="group flex h-32 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/50 hover:bg-primary/10"
              >
                <ActionIcon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <span className="text-sm font-bold text-foreground">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Recent Registrations</h2>
          <button
            onClick={() => setSection("students")}
            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            View All
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative sm:hidden">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students or courses..."
            className="pl-10"
            aria-label="Search registrations"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date Joined</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((student) => (
                    <tr key={student.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-muted-foreground">{student.role.toLowerCase()}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(student.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRowAction(student)}
                          aria-label={`Manage ${student.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
            <p className="text-sm">{query ? "No matching registrations" : "No registrations yet"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
