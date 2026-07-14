"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  School,
  Users,
  TrendingUp,
  Award,
  UserPlus,
  BookOpen,
  BarChart3,
  ArrowUpRight,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  GraduationCap,
  FileCheck,
  RefreshCw,
} from "lucide-react";

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
  const user = useAppStore((s) => s.user);

  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/stats");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const json: StatsResponse = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
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
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  const statCards = [
    { title: "Total Students", value: stats?.totalStudents ?? 0, subtitle: "All registered users", icon: School, color: "blue" as const, trend: "Live" },
    { title: "Active Students", value: stats?.activeStudents ?? 0, subtitle: "Currently enrolled", icon: Users, color: "green" as const, trend: "Active" },
    { title: "Completion Rate", value: stats ? `${stats.avgCompletion}%` : "0%", subtitle: "Avg across all phases", icon: Award, color: "amber" as const },
    { title: "Submissions", value: stats?.totalSubmissions ?? 0, subtitle: "Exercise submissions", icon: FileCheck, color: "purple" as const },
  ];

  const colorStyles = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  };

  const quickActions = [
    { icon: UserPlus, label: "Manage Users", section: "students" as const },
    { icon: BookOpen, label: "View Curriculum", section: "curriculum" as const },
    { icon: GraduationCap, label: "View Cohorts", section: "cohorts" as const },
    { icon: BarChart3, label: "Audit Log", section: "audit" as const },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Aggregate platform overview for {user?.name ?? "Administrator"}
          </p>
        </div>
        <button
          onClick={() => setSection("students")}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-orange)] text-white px-4 py-2.5 text-sm font-bold hover:bg-[var(--color-brand-orange)]/90 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add Student
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.title} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2.5 rounded-lg", colorStyles[stat.color])}>
                  <StatIcon className="h-5 w-5" />
                </div>
                {stat.trend && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{stat.value}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => setSection(action.section)}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-[var(--color-brand-orange)]/50 hover:bg-accent/50 transition-all group text-center h-32"
              >
                <ActionIcon className="h-8 w-8 text-[var(--color-brand-orange)] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-foreground">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recent Registrations</h2>
          <button
            onClick={() => setSection("students")}
            className="inline-flex items-center gap-1 text-sm font-bold text-[var(--color-brand-orange)] hover:underline"
          >
            View All
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {data?.recentRegistrations && data.recentRegistrations.length > 0 ? (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student Name</th>
                    <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date Joined</th>
                    <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="py-3.5 px-6 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recentRegistrations.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground capitalize">{student.role.toLowerCase()}</td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {new Date(student.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-4 px-6"><StatusBadge status={student.status} /></td>
                      <td className="py-4 px-6 text-right">
                        <button className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
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
          <div className="bg-card rounded-xl border border-border flex items-center justify-center h-24 text-muted-foreground">
            <p className="text-sm">No registrations yet</p>
          </div>
        )}
      </div>
    </div>
  );
}