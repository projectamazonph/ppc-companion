"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Lock, Bell, Download, SignOut as LogOut, Pencil as Edit, SealCheck as Verified, CaretRight as ChevronRight, CaretDown as ChevronDown, Medal as Award, WarningCircle as AlertCircle, CircleNotch as Loader2 } from "@phosphor-icons/react";
import styles from "./my-profile.module.css";

type Student = {
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

type Stats = {
  submissionsCount: number;
  gradedSubmissions: number;
  quizAttemptsCount: number;
  quizzesPassedCount: number;
  avgQuizPercentage: number | null;
  capstoneStatus: string;
  overallProgress: number;
  currentPhase: number;
};

type Submission = {
  id: string;
  status: string;
  updatedAt: string;
  exercise: {
    title: string;
    module?: { phaseNumber?: number };
  };
};

type ProgressPhase = {
  phaseNumber: number;
  completedModules: number;
  totalModules: number;
};

type ActivityData = {
  student: Student;
  stats: Stats;
  tags: unknown[];
  submissions: Submission[];
  progress: ProgressPhase[];
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MyProfileSection() {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const { toast } = useToast();
  const router = useRouter();
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
        const json = (await res.json()) as ActivityData;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load profile");
          setLoading(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out", description: "You have been signed out." });
    router.push("/");
  };

  if (!user) return null;

  if (loading) {
    return <LoadingState />;
  }

  if (error || !data) {
    return <ErrorState message={error ?? "Profile not found"} />;
  }

  const { student, stats, tags, submissions, progress } = data;

  return (
    <div className={styles.section}>
      {/* ── Breadcrumb ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Home
        </button>
        <span className="text-muted-foreground/40">›</span>
        <span className="text-sm font-medium text-foreground">My Profile</span>
      </div>

      {/* ── Title ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          My Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── Left column: profile card + security nav (col-span-4) ── */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <ProfileHeroCard student={student} tags={tags} />

          {/* Security & Settings */}
          <div className="flex flex-col rounded-2xl border border-border/50 bg-card p-6">
            <h3 className="mb-4 text-base font-bold text-foreground">Security &amp; Settings</h3>
            <nav className="flex flex-col gap-1">
              <button
                type="button"
                className="group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/30 dark:hover:bg-slate-800"
                onClick={() => toast({ title: "Coming soon", description: "Change password is not available yet." })}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-2 text-primary transition-colors group-hover:bg-white dark:group-hover:bg-slate-600">
                    <Lock className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                    Change Password
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </button>
              <button
                type="button"
                className="group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/30 dark:hover:bg-slate-800"
                onClick={() => toast({ title: "Coming soon", description: "Notification settings are not available yet." })}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-2 text-primary transition-colors group-hover:bg-white dark:group-hover:bg-slate-600">
                    <Bell className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                    Notification Settings
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </button>
              <button
                type="button"
                className="group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/30 dark:hover:bg-slate-800"
                onClick={() => toast({ title: "Coming soon", description: "Export my data is not available yet." })}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-2 text-primary transition-colors group-hover:bg-white dark:group-hover:bg-slate-600">
                    <Download className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                    Export My Data
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </button>
            </nav>

            {/* Logout */}
            <div className="mt-auto pt-5">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>

        {/* ── Right column: personal info + certificates (col-span-8) ── */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <PersonalInfoCard student={student} />

          {/* Certificates */}
          <div className="flex-1 rounded-2xl border border-border/50 bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">My Certificates</h3>
              <button
                type="button"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                onClick={() => toast({ title: "Coming soon", description: "Full certificate history is not available yet." })}
              >
                View All History
              </button>
            </div>
            <CertificatesList submissions={submissions} progress={progress} />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Loading state
// =============================================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <div className="space-y-1 text-center">
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground">Try refreshing the page or contact support.</p>
    </div>
  );
}

// =============================================================
// Profile hero card
// =============================================================

function ProfileHeroCard({
  student,
  tags,
}: {
  student: Student;
  tags: unknown[];
}) {
  const initials = initialsOf(student.name);
  const tagList = Array.isArray(tags) ? tags : [];

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Avatar */}
        <div className="relative group cursor-pointer">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground shadow-lg">
            {initials}
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-xs font-medium text-white">Change Photo</span>
          </div>
        </div>

        {/* Name + role */}
        <div>
          <h3 className="text-xl font-bold text-foreground">{student.name}</h3>
          <p className="text-sm text-muted-foreground">Amazon PPC Specialist</p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Verified className="h-3 w-3" />
            Verified VA
          </div>
        </div>

        {/* Member info */}
        <div className="w-full border-t border-border/50 pt-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm font-medium text-foreground">
              {new Date(student.enrolledAt).toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Location</span>
            <span className="text-sm font-medium text-foreground">
              {student.cohort ?? "Manila, PH"}
            </span>
          </div>
          {tagList.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {tagList.map((t, i) => (
                <span
                  key={i}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {typeof t === "string" ? t : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Personal info card
// =============================================================

function PersonalInfoCard({ student }: { student: Student }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: student.name,
    email: student.email,
    phone: "",
    location: "",
    timeZone: "(GMT+08:00) Taipei, Manila",
  });

  const setField = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    toast({ title: "Changes saved", description: "Your profile has been updated." });
  };

  const handleCancel = () => {
    setForm({
      name: student.name,
      email: student.email,
      phone: "",
      location: "",
      timeZone: "(GMT+08:00) Taipei, Manila",
    });
    setEditing(false);
  };

  const inputClass = cn(
    "w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30",
    !editing && "opacity-70"
  );

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Personal Info</h3>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      <form className="grid grid-cols-1 gap-5 md:grid-cols-2" onSubmit={handleSave}>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-foreground/70">Full Name</label>
          <input
            className={inputClass}
            type="text"
            value={form.name}
            disabled={!editing}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/70">Email Address</label>
          <input
            className={inputClass}
            type="email"
            value={form.email}
            disabled={!editing}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/70">Phone Number</label>
          <input
            className={inputClass}
            type="tel"
            placeholder="+63 912 345 6789"
            value={form.phone}
            disabled={!editing}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/70">Location</label>
          <input
            className={inputClass}
            type="text"
            placeholder="Manila, Philippines"
            value={form.location}
            disabled={!editing}
            onChange={(e) => setField("location", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/70">Time Zone</label>
          <div className="relative">
            <select
              className={cn(inputClass, "appearance-none")}
              value={form.timeZone}
              disabled={!editing}
              onChange={(e) => setField("timeZone", e.target.value)}
            >
              <option>(GMT+08:00) Kuala Lumpur, Singapore</option>
              <option>(GMT+08:00) Taipei, Manila</option>
              <option>(GMT+09:00) Seoul, Tokyo</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {editing && (
          <div className="col-span-1 flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full rounded-lg border border-border px-5 py-2.5 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

// =============================================================
// Certificates list (stitch user-profile structure)
// =============================================================

function CertificatesList({
  submissions,
  progress,
}: {
  submissions: Submission[];
  progress: ProgressPhase[];
}) {
  const { toast } = useToast();
  const completedCerts = submissions
    .filter((s) => s.status === "GRADED")
    .slice(0, 3)
    .map((s) => ({
      id: s.id,
      title: s.exercise.title || "Course Completion Certificate",
      earned: true as const,
      date: s.updatedAt,
    }));

  const inProgressCerts = (progress ?? [])
    .filter((p) => p.phaseNumber && p.completedModules > 0 && p.totalModules > 0)
    .slice(0, 2)
    .map((p) => ({
      id: `progress-${p.phaseNumber}`,
      title: `Phase ${p.phaseNumber} Certificate`,
      earned: false as const,
      pct: p.totalModules > 0 ? Math.round((p.completedModules / p.totalModules) * 100) : 0,
    }));

  const allCerts = [...completedCerts, ...inProgressCerts];

  if (allCerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
          <Award className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground/70">Complete quizzes to earn certificates</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {allCerts.map((cert) =>
        cert.earned ? (
          <div
            key={cert.id}
            className="flex flex-col gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 transition-all hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{cert.title}</h4>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-block size-1.5 rounded-full bg-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">
                    Earned{" "}
                    {new Date(cert.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                Completed
              </span>
              <button
                type="button"
                title="Download PDF"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => toast({ title: "Coming soon", description: "Certificate download is not available yet." })}
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            key={cert.id}
            className="flex flex-col gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 transition-all hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Award className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-foreground">{cert.title}</h4>
                <div className="mt-1 flex w-full max-w-[140px] items-center gap-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${cert.pct}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{cert.pct}%</span>
                </div>
              </div>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                In Progress
              </span>
              <button
                type="button"
                className="w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                onClick={() => toast({ title: "Coming soon", description: "Continue learning is not available yet." })}
              >
                Continue
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
