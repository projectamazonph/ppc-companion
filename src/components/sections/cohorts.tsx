"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BrandButton } from "@/components/shared/buttons";
import { Student as School, Plus, DotsThree as MoreHorizontal, Pencil, Trash as Trash2, Eye, CircleNotch as Loader2, WarningCircle as AlertCircle, CalendarBlank as Calendar, Users, ArrowsClockwise as RefreshCw, GraduationCap, UserCircle, Clock, X, CaretRight as ChevronRight, Stack as Layers } from "@phosphor-icons/react";

type Cohort = {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  maxStudents: number | null;
  instructorId: string | null;
  instructor?: { id: string; name: string; email: string } | null;
  enrollmentCount?: number;
  activeCount?: number;
};

// Status color maps
const COHORT_STATUS_STYLES: Record<string, string> = {
  PLANNED: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  COMPLETED: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
};

const COHORT_STATUS_STRIP: Record<string, string> = {
  PLANNED: "bg-blue-500",
  ACTIVE: "bg-emerald-500",
  COMPLETED: "bg-violet-500",
  CANCELLED: "bg-rose-500",
};

const ENROLLMENT_STATUS_STYLES: Record<string, string> = {
  ENROLLED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  COMPLETED: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  DROPPED: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// =============================================================
// Main Section
// =============================================================

export function CohortsSection() {
  const user = useAppStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Cohort | null>(null);
  const [viewing, setViewing] = useState<Cohort | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cohort | null>(null);
  const { toast } = useToast();

  const fetchCohorts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cohorts?stats=true");
      if (!res.ok) throw new Error("Failed to load cohorts");
      const data = await res.json();
      setCohorts(data.cohorts ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRef = useRef(fetchCohorts);
  const refetch = useCallback(() => fetchRef.current(), []);

  useEffect(() => {
    fetchRef.current = fetchCohorts;
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/cohorts/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      toast({ title: "Cohort deleted", description: `${deleteTarget.name} has been removed.` });
      setDeleteTarget(null);
      refetch();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  };

  // Summary stats
  const totalCohorts = cohorts.length;
  const activeCohorts = cohorts.filter((c) => c.status === "ACTIVE").length;
  const totalEnrolled = cohorts.reduce((sum, c) => sum + (c.enrollmentCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950/30">
              <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Cohorts
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            {isAdmin
              ? "Create, manage, and monitor training cohorts. Track enrollments, assign instructors, and oversee student progress."
              : "Browse your assigned training cohorts and track your learning journey."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="h-9"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          {isAdmin && (
            <BrandButton size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>New cohort</span>
            </BrandButton>
          )}
        </div>
      </div>

      {/* ── Summary Stats (when data exists) ───────────── */}
      {!loading && !error && cohorts.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/60 bg-card p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Total cohorts
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{totalCohorts}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Active
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {activeCohorts}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Total enrolled
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
              {totalEnrolled}
            </p>
          </div>
        </div>
      )}

      {/* ── Error State ─────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/20 px-4 py-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <p className="flex-1 text-sm text-rose-700 dark:text-rose-400">{error}</p>
          <BrandButton size="sm" variant="danger" onClick={refetch}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </BrandButton>
        </div>
      )}

      {/* ── Loading State ───────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-16">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-border" />
            <Loader2 className="absolute inset-0 m-auto h-6 w-6 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Loading cohorts…
          </p>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────── */}
      {!loading && !error && cohorts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-card/50 py-20 px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/30">
            <School className="h-8 w-8 text-primary-400 dark:text-primary-500" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-foreground">
            No cohorts yet
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            {isAdmin
              ? "Get started by creating your first training cohort. Organize students, assign instructors, and track progress."
              : "No cohorts have been assigned to you yet. Check back later or contact your administrator."}
          </p>
          {isAdmin && (
            <BrandButton className="mt-6" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create your first cohort
            </BrandButton>
          )}
        </div>
      )}

      {/* ── Cohort Cards Grid ───────────────────────────── */}
      {!loading && !error && cohorts.length > 0 && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {cohorts.map((c) => (
            <div
              key={c.id}
              className="group relative flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-200 hover:border-border hover:shadow-md"
            >
              {/* Status color strip */}
              <div
                className={cn(
                  "h-1 w-full",
                  COHORT_STATUS_STRIP[c.status] ?? "bg-muted-foreground/30"
                )}
              />

              <div className="flex flex-1 flex-col p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base text-foreground truncate group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                      {c.name}
                    </h3>
                    {c.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5",
                      COHORT_STATUS_STYLES[c.status] ?? "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {c.status.toLowerCase()}
                  </Badge>
                </div>

                {/* Stats grid */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Enrolled
                    </p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
                      {c.enrollmentCount ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Capacity
                    </p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
                      {c.maxStudents ?? "∞"}
                    </p>
                  </div>
                </div>

                {/* Meta info */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <span>
                      {formatDate(c.startDate)}
                      {c.endDate && (
                        <>
                          <span className="mx-1 text-muted-foreground/40">→</span>
                          {formatDate(c.endDate)}
                        </>
                      )}
                    </span>
                  </div>
                  {c.instructor && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">
                        <span className="text-muted-foreground/60">Instructor:</span>{" "}
                        <span className="font-medium text-foreground/80">
                          {c.instructor.name}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 border-t border-border/40 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setViewing(c)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View students
                    <ChevronRight className="h-3 w-3 ml-auto opacity-40" />
                  </Button>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setEditing(c)}
                          className="text-sm cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-2.5 text-muted-foreground" />
                          Edit cohort
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(c)}
                          className="text-sm cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2.5" />
                          Delete cohort
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create/Edit Dialog (admin only) ─────────────── */}
      {isAdmin && (
        <CohortFormDialog
          open={createOpen || !!editing}
          onOpenChange={(o) => {
            if (!o) {
              setCreateOpen(false);
              setEditing(null);
            }
          }}
          cohort={editing}
          onSaved={() => {
            setCreateOpen(false);
            setEditing(null);
            refetch();
          }}
        />
      )}

      {/* ── View Students Dialog ────────────────────────── */}
      {viewing && (
        <CohortStudentsDialog
          cohort={viewing}
          onOpenChange={(o) => !o && setViewing(null)}
        />
      )}

      {/* ── Delete Confirmation Dialog ──────────────────── */}
      {deleteTarget && (
        <DeleteCohortDialog
          cohort={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// =============================================================
// Delete Confirmation Dialog
// =============================================================

function DeleteCohortDialog({
  cohort,
  onConfirm,
  onCancel,
}: {
  cohort: Cohort;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/40">
              <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">Delete cohort</DialogTitle>
              <DialogDescription className="mt-1">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {cohort.name}
                </span>
                ?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          Students enrolled in this cohort will not be deleted, but their
          enrollment records will be permanently removed.
        </div>
        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <BrandButton variant="danger" onClick={onConfirm}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete cohort
          </BrandButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================
// Cohort Form Dialog (create/edit)
// =============================================================

function CohortFormDialog({
  open,
  onOpenChange,
  cohort,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  cohort?: Cohort | null;
  onSaved: () => void;
}) {
  const isEdit = !!cohort;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "PLANNED",
    maxStudents: "",
  });
  const { toast } = useToast();

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (cohort) {
      setForm({
        name: cohort.name,
        description: cohort.description ?? "",
        startDate: cohort.startDate.split("T")[0],
        endDate: cohort.endDate ? cohort.endDate.split("T")[0] : "",
        status: cohort.status,
        maxStudents: cohort.maxStudents?.toString() ?? "",
      });
    } else if (open) {
      setForm({
        name: "",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        status: "PLANNED",
        maxStudents: "",
      });
    }
  }, [cohort, open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const submit = async () => {
    if (!form.name.trim() || !form.startDate) {
      toast({
        title: "Missing required fields",
        description: "Name and start date are required.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        status: form.status,
        maxStudents: form.maxStudents ? parseInt(form.maxStudents, 10) : null,
      };
      const res = isEdit
        ? await fetch(`/api/cohorts/${cohort!.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/cohorts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      toast({
        title: isEdit ? "Cohort updated" : "Cohort created",
        description: `${payload.name} saved successfully.`,
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/30">
              {isEdit ? (
                <Pencil className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              ) : (
                <Layers className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg">
                {isEdit ? "Edit cohort" : "Create new cohort"}
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                {isEdit
                  ? "Update the cohort details below."
                  : "Set up a new training cohort for your students."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Summer 2026"
              className="h-10"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Brief description of this cohort…"
              className="min-h-[70px] resize-none"
            />
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                Start date <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                End date
              </Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value })
                }
                className="h-10"
              />
            </div>
          </div>

          {/* Status + Capacity row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                Status
              </Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNED">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Planned
                    </div>
                  </SelectItem>
                  <SelectItem value="ACTIVE">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-violet-500" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="CANCELLED">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                Max students
              </Label>
              <Input
                type="number"
                value={form.maxStudents}
                onChange={(e) =>
                  setForm({ ...form, maxStudents: e.target.value })
                }
                placeholder="Unlimited"
                min="1"
                className="h-10"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <BrandButton onClick={submit} disabled={saving} loading={saving}>
            {isEdit ? "Save changes" : "Create cohort"}
          </BrandButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================
// Cohort Students Dialog
// =============================================================

function CohortStudentsDialog({
  cohort,
  onOpenChange,
}: {
  cohort: Cohort;
  onOpenChange: (o: boolean) => void;
}) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(`/api/cohorts/${cohort.id}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled) {
          setStudents(data.cohort?.enrollments ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [cohort.id]);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/30">
                <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg truncate">
                  {cohort.name}
                </DialogTitle>
                <DialogDescription className="mt-0.5">
                  {students.length} student
                  {students.length === 1 ? "" : "s"} enrolled
                  {cohort.instructor
                    ? ` · Instructor: ${cohort.instructor.name}`
                    : ""}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="h-10 w-10 rounded-full border-2 border-border" />
              <Loader2 className="absolute inset-0 m-auto h-5 w-5 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Loading students…
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/40 bg-card/30 py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <Users className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No students enrolled yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Students will appear here once they enroll.
            </p>
          </div>
        ) : (
          <div className="space-y-2 py-1">
            {students.map((e: any) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3.5 transition-colors hover:border-border hover:bg-muted/20"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow-sm">
                  {getInitials(e.student.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {e.student.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {e.student.email}
                  </p>
                </div>

                {/* Badges */}
                <Badge
                  variant="outline"
                  className="shrink-0 text-[10px] font-medium"
                >
                  Phase {e.student.currentPhase}/4
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 text-[10px] font-semibold capitalize",
                    ENROLLMENT_STATUS_STYLES[e.status] ??
                      "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {e.status.toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
