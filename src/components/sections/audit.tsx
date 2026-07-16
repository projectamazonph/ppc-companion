"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Scroll as ScrollText, MagnifyingGlass as Search, CircleNotch as Loader2, WarningCircle as AlertCircle, ArrowsClockwise as RefreshCw, SignIn as LogIn, SignOut as LogOut, Pencil, Trash as Trash2, Plus, Download, User, ShieldCheck, CaretDown as ChevronDown, CaretRight as ChevronRight, Clock, Hash, Globe } from "@phosphor-icons/react";
import styles from "./audit.module.css";

type AuditLog = {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  changes: string | null;
  ipAddress: string | null;
  createdAt: string;
  actor: { id: string; name: string; email: string; role: string } | null;
};

// ── Action type config ──────────────────────────────────────────────

const ACTION_CONFIG: Record<
  string,
  { icon: typeof LogIn; bg: string; ring: string; text: string; label: string }
> = {
  CREATE: {
    icon: Plus,
    bg: "bg-emerald-100 dark:bg-emerald-500/15",
    ring: "ring-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Create",
  },
  UPDATE: {
    icon: Pencil,
    bg: "bg-blue-100 dark:bg-blue-500/15",
    ring: "ring-blue-500/20",
    text: "text-blue-700 dark:text-blue-400",
    label: "Update",
  },
  DELETE: {
    icon: Trash2,
    bg: "bg-rose-100 dark:bg-rose-500/15",
    ring: "ring-rose-500/20",
    text: "text-rose-700 dark:text-rose-400",
    label: "Delete",
  },
  LOGIN: {
    icon: LogIn,
    bg: "bg-cyan-100 dark:bg-cyan-500/15",
    ring: "ring-cyan-500/20",
    text: "text-cyan-700 dark:text-cyan-400",
    label: "Login",
  },
  LOGOUT: {
    icon: LogOut,
    bg: "bg-violet-100 dark:bg-violet-500/15",
    ring: "ring-violet-500/20",
    text: "text-violet-700 dark:text-violet-400",
    label: "Logout",
  },
  EXPORT: {
    icon: Download,
    bg: "bg-stone-100 dark:bg-stone-500/15",
    ring: "ring-stone-500/20",
    text: "text-stone-700 dark:text-stone-400",
    label: "Export",
  },
};

const DEFAULT_ACTION = {
  icon: ScrollText,
  bg: "bg-gray-100 dark:bg-gray-500/15",
  ring: "ring-gray-500/20",
  text: "text-gray-700 dark:text-gray-400",
  label: "Action",
};

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] ?? DEFAULT_ACTION;
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return { date, time };
}

// ── Component ───────────────────────────────────────────────────────

export function AuditLogSection() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (entityFilter !== "all") params.set("entityType", entityFilter);
      params.set("limit", "100");
      const res = await fetch(`/api/audit?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load audit logs");
      const data = await res.json();
      let filtered = data.logs ?? [];
      // Client-side search on summary + actor name
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter((l: AuditLog) =>
          l.summary.toLowerCase().includes(q) ||
          l.actor?.name?.toLowerCase().includes(q) ||
          l.actor?.email?.toLowerCase().includes(q) ||
          l.entityType.toLowerCase().includes(q)
        );
      }
      setLogs(filtered);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchLogs, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [actionFilter, entityFilter, search]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.section}>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              Audit Log
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              <ShieldCheck className="h-3 w-3" />
              Compliance
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            Every admin and instructor action is recorded here for compliance.
          </p>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────── */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by summary, actor, or entity…"
                className="pl-10 h-9 text-sm bg-muted/40"
              />
            </div>

            {/* Action filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm bg-muted/40">
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="EXPORT">Export</SelectItem>
              </SelectContent>
            </Select>

            {/* Entity filter */}
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm bg-muted/40">
                <SelectValue placeholder="Entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="cohort">Cohort</SelectItem>
                <SelectItem value="exercise_submission">Submission</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
              className="h-9 shrink-0 gap-1.5"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Error State ─────────────────────────────────────────── */}
      {error && (
        <Card className="border-rose-200 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20">
          <CardContent className="p-4 flex items-center gap-2.5 text-sm text-rose-700 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* ── Loading State ───────────────────────────────────────── */}
      {loading && !error && (
        <Card className="border-border/60">
          <CardContent className="p-16 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/5">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            </div>
            <p className="text-sm font-medium">Loading audit logs…</p>
          </CardContent>
        </Card>
      )}

      {/* ── Empty State ─────────────────────────────────────────── */}
      {!loading && !error && logs.length === 0 && (
        <Card className="border-dashed border-border/50">
          <CardContent className="p-16 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
              <ScrollText className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">No matching entries</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No audit log entries match your current filters. Try adjusting your search or filter criteria.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {!loading && !error && logs.length > 0 && (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              <span className="text-foreground">{logs.length}</span>{" "}
              {logs.length === 1 ? "entry" : "entries"} found
            </p>
          </div>

          {/* Log entries */}
          <div className="space-y-2">
            {logs.map((log) => {
              const config = getActionConfig(log.action);
              const Icon = config.icon;
              const { date, time } = formatTimestamp(log.createdAt);
              const isExpanded = expandedId === log.id;

              return (
                <Card
                  key={log.id}
                  className={cn(
                    "border-border/60 transition-shadow hover:shadow-sm",
                    isExpanded && "ring-1 ring-border/80 shadow-sm"
                  )}
                >
                  <CardContent className="p-0">
                    {/* Main row — always visible */}
                    <button
                      type="button"
                      className="w-full text-left p-3 sm:p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset rounded-lg"
                      onClick={() => log.changes && toggleExpand(log.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon badge */}
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
                            config.bg,
                            config.ring
                          )}
                        >
                          <Icon className={cn("h-4 w-4", config.text)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Top row: summary + timestamp */}
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium leading-snug text-foreground">
                              {log.summary}
                            </p>
                            <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
                              <span className="text-[11px] font-medium text-foreground/80 whitespace-nowrap">
                                {date}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                                <Clock className="h-2.5 w-2.5" />
                                {time}
                              </span>
                            </div>
                          </div>

                          {/* Badges row */}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                                config.bg,
                                config.ring,
                                config.text
                              )}
                            >
                              {config.label}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium text-muted-foreground/80"
                            >
                              <Hash className="mr-0.5 h-2.5 w-2.5" />
                              {log.entityType}
                            </Badge>
                            {log.actor && (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-medium text-muted-foreground/80"
                              >
                                <User className="mr-0.5 h-2.5 w-2.5" />
                                {log.actor.name}
                              </Badge>
                            )}
                            {log.ipAddress && (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-mono text-muted-foreground/60"
                              >
                                <Globe className="mr-0.5 h-2.5 w-2.5" />
                                {log.ipAddress}
                              </Badge>
                            )}

                            {/* Expand indicator */}
                            {log.changes && (
                              <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                                Changes
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expandable changes */}
                    {log.changes && isExpanded && (
                      <div className="border-t border-border/50 px-3 sm:px-4 pb-4 pt-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Change Details
                          </span>
                        </div>
                        <pre className="text-[11px] leading-relaxed text-muted-foreground bg-muted/50 rounded-lg p-3 overflow-x-auto font-mono whitespace-pre-wrap break-all border border-border/40">
                          {log.changes}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
