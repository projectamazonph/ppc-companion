"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  School,
  Users,
  TrendingUp,
  Award,
  UserPlus,
  BookOpen,
  BarChart3,
  Mail,
  ArrowUpRight,
  MoreHorizontal,
  Sparkles,
  Loader2,
  AlertCircle,
  GraduationCap,
  FileCheck,
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
// Stat Card Component
// =============================================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { direction: "up" | "down"; value: string };
  color: "blue" | "green" | "amber" | "purple";
}) {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green:
      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    amber:
      "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    purple:
      "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2 rounded-lg", colorMap[color])}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                trend.direction === "up"
                  ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                  : "text-red-600 bg-red-50 dark:bg-red-900/20"
              )}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {trend.value}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================
// Quick Action Card
// =============================================================

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all group text-center h-32"
    >
      <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
      <span className="text-sm font-bold text-foreground">{label}</span>
    </button>
  );
}

// =============================================================
// Status Badge
// =============================================================

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    ACTIVE: { label: "Active", variant: "default" },
    INACTIVE: { label: "Inactive", variant: "secondary" },
    PENDING: { label: "Pending", variant: "outline" },
    SUSPENDED: { label: "Suspended", variant: "destructive" },
    GRADUATED: { label: "Graduated", variant: "outline" },
  };

  const config = statusConfig[status] ?? {
    label: status,
    variant: "outline" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
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

  // Fetch data on mount
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
    return () => {
      cancelled = true;
    };
  }, []);

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm font-medium">Failed to load dashboard</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Aggregate platform overview for{" "}
          {user?.name ?? "Administrator"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          subtitle="All registered users"
          icon={School}
          trend={{ direction: "up", value: "Live" }}
          color="blue"
        />
        <StatCard
          title="Active Students"
          value={stats?.activeStudents ?? 0}
          subtitle="Currently enrolled"
          icon={Users}
          trend={{ direction: "up", value: "Active" }}
          color="green"
        />
        <StatCard
          title="Completion Rate"
          value={stats ? `${stats.avgCompletion}%` : "0%"}
          subtitle="Avg across all phases"
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Submissions"
          value={stats?.totalSubmissions ?? 0}
          subtitle="Exercise submissions"
          icon={FileCheck}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            icon={UserPlus}
            label="Manage Users"
            onClick={() => setSection("students")}
          />
          <QuickAction
            icon={BookOpen}
            label="View Curriculum"
            onClick={() => setSection("curriculum")}
          />
          <QuickAction
            icon={GraduationCap}
            label="View Cohorts"
            onClick={() => setSection("cohorts")}
          />
          <QuickAction
            icon={BarChart3}
            label="Audit Log"
            onClick={() => setSection("audit")}
          />
        </div>
      </div>

      {/* Recent Registrations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recent Registrations</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => setSection("students")}
          >
            View All
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>

        {data?.recentRegistrations && data.recentRegistrations.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Student Name
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Role
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date Joined
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="py-4 px-6 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.recentRegistrations.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {student.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground capitalize">
                        {student.role.toLowerCase()}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {new Date(student.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              <p className="text-sm">No registrations yet</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
