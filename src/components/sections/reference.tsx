"use client";

import { useState, useMemo } from "react";
import { useAppStore, checklistItemId } from "@/lib/store";
import {
  glossary, formulas, weeklyChecklist, namingFormat, exampleReport, submissionChecklist, type GlossaryTerm, } from "@/lib/course-data";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import styles from "./reference.module.css";
import {
  MagnifyingGlass as Search, BookBookmark as BookMarked, Calculator, ListChecks, Tag, Envelope as Mail, CalendarDots as CalendarDays, CheckCircle as CheckCircle2, ArrowRight, Sparkle as Sparkles, FileText, Clock, Warning as AlertTriangle, Hash, CaretRight as ChevronRight, type Icon } from "@phosphor-icons/react";

// =============================================================
// Tab configuration
// =============================================================

interface TabConfig {
  value: string;
  label: string;
  icon: Icon;
  description: string;
}

const TABS: TabConfig[] = [
  { value: "glossary", label: "Glossary", icon: BookMarked, description: `${glossary.length} terms` },
  { value: "formulas", label: "Formulas", icon: Calculator, description: `${formulas.length} core metrics` },
  { value: "checklist", label: "Checklist", icon: ListChecks, description: "Weekly tasks" },
  { value: "naming", label: "Naming", icon: Tag, description: "Convention format" },
  { value: "report", label: "Report", icon: Mail, description: "Weekly template" },
  { value: "deadlines", label: "Deadlines", icon: CalendarDays, description: "Phase schedule" },
];

// =============================================================
// Category filters
// =============================================================

const CATEGORIES: { key: GlossaryTerm["category"] | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "fundamental", label: "Fundamentals" },
  { key: "ad-type", label: "Ad Types" },
  { key: "metric", label: "Metrics" },
  { key: "strategy", label: "Strategy" },
];

// =============================================================
// Category badge colors
// =============================================================

const CATEGORY_COLORS: Record<string, string> = {
  fundamental: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  "ad-type": "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  metric: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  strategy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
};

// =============================================================
// Main component
// =============================================================

export function ReferenceSection() {
  const [activeTab, setActiveTab] = useState("glossary");

  return (
    <div className={styles.section}>
      {/* Page header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <FileText className="h-3.5 w-3.5" />
          <span>Knowledge Base</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reference</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Everything you need at a glance — glossary, formulas, weekly checklists, naming conventions, and report templates.
        </p>
      </div>

      {/* Tab navigation */}
      <nav className="border-b border-border/60">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "group relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "hidden sm:inline text-xs transition-colors",
                    isActive ? "text-primary/70" : "text-muted-foreground"
                  )}
                >
                  {tab.description}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Tab content */}
      <div>
        {activeTab === "glossary" && <GlossaryPanel />}
        {activeTab === "formulas" && <FormulasPanel />}
        {activeTab === "checklist" && <ChecklistPanel />}
        {activeTab === "naming" && <NamingPanel />}
        {activeTab === "report" && <ReportPanel />}
        {activeTab === "deadlines" && <DeadlinesPanel />}
      </div>
    </div>
  );
}

// =============================================================
// Section header helper
// =============================================================

function SectionHeader({
  icon: Icon,
  title,
  description,
  iconBg = "bg-primary/10 text-primary",
}: {
  icon: Icon;
  title: string;
  description: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          iconBg
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// =============================================================
// Glossary
// =============================================================

function GlossaryPanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryTerm["category"] | "all">("all");

  const filtered = useMemo(() => {
    return glossary
      .filter((g) => category === "all" || g.category === category)
      .filter((g) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [query, category]);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={BookMarked}
        title="Glossary"
        description={`${glossary.length} Amazon PPC terms — searchable and organized by category`}
        iconBg="bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
      />

      {/* Search bar */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms or definitions..."
          className="pl-10 h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const isActive = category === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {c.key !== "all" && (
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isActive ? "bg-primary-foreground/60" : "bg-muted-foreground/40"
                  )}
                />
              )}
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{filtered.length}</span>{" "}
        {filtered.length === 1 ? "term" : "terms"}
        {category !== "all" && (
          <>
            {" "}
            in <span className="font-medium capitalize">{category.replace("-", " ")}</span>
          </>
        )}
        {query.trim() && (
          <>
            {" "}
            matching "<span className="font-medium">{query}</span>"
          </>
        )}
      </p>

      {/* Term grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <div
              key={g.term}
              className="group relative rounded-xl border border-border/50 bg-card p-4 hover:border-border hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {g.term}
                </h3>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                    CATEGORY_COLORS[g.category] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {g.category.replace("-", " ")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {g.definition}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No matching terms</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Try a different search query or select a different category filter.
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================
// Formulas
// =============================================================

const FORMULA_COLORS = [
  { bg: "bg-rose-50 dark:bg-rose-950/20", border: "border-rose-200 dark:border-rose-900", text: "text-rose-700 dark:text-rose-400", badge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400" },
  { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-900", text: "text-amber-700 dark:text-amber-400", badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-900", text: "text-emerald-700 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  { bg: "bg-sky-50 dark:bg-sky-950/20", border: "border-sky-200 dark:border-sky-900", text: "text-sky-700 dark:text-sky-400", badge: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400" },
  { bg: "bg-violet-50 dark:bg-violet-950/20", border: "border-violet-200 dark:border-violet-900", text: "text-violet-700 dark:text-violet-400", badge: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400" },
  { bg: "bg-pink-50 dark:bg-pink-950/20", border: "border-pink-200 dark:border-pink-900", text: "text-pink-700 dark:text-pink-400", badge: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400" },
];

function FormulasPanel() {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Calculator}
        title="Metric Formulas"
        description="The 6 formulas every Amazon PPC manager must know by heart"
        iconBg="bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {formulas.map((f, idx) => {
          const color = FORMULA_COLORS[idx % FORMULA_COLORS.length];
          return (
            <div
              key={f.name}
              className={cn(
                "rounded-xl border-2 p-5 transition-all hover:shadow-sm",
                color.border,
                color.bg
              )}
            >
              {/* Formula name */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold",
                    color.badge
                  )}
                >
                  {idx + 1}
                </span>
                <h3 className="font-semibold text-sm">{f.name}</h3>
              </div>

              {/* Formula display */}
              <div className="rounded-lg bg-background/80 dark:bg-background/40 border border-border/40 p-4 mb-4">
                <p className="font-mono text-sm sm:text-base font-semibold text-center tracking-wide">
                  {f.formula}
                </p>
              </div>

              {/* Example */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0 mt-0.5">
                    Example
                  </span>
                  <p className="font-mono text-xs text-foreground/80">{f.example}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0 mt-0.5">
                    Meaning
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {f.interpretation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================
// Weekly Checklist
// =============================================================

function ChecklistPanel() {
  const checklistCompleted = useAppStore((s) => s.checklistCompleted);
  const toggleChecklist = useAppStore((s) => s.toggleChecklist);

  const totalItems = weeklyChecklist.reduce((s, c) => s + c.items.length, 0);
  const completedItems = weeklyChecklist.reduce(
    (s, c) =>
      s + c.items.filter((i) => checklistCompleted[checklistItemId(c.category, i)]).length,
    0
  );
  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isComplete = completedItems === totalItems && totalItems > 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={ListChecks}
        title="Weekly Optimization Checklist"
        description="Work through these tasks every week to keep your accounts optimized"
        iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
      />

      {/* Progress bar */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tabular-nums">{pct}%</span>
            <span className="text-sm text-muted-foreground">
              {completedItems} of {totalItems} tasks complete
            </span>
          </div>
          {isComplete && (
            <Sparkles className="h-5 w-5 text-amber-500" />
          )}
        </div>
        <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              isComplete
                ? "bg-emerald-500"
                : "bg-primary"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Checklist sections */}
      <div className="space-y-4">
        {weeklyChecklist.map((section) => {
          const sectionTotal = section.items.length;
          const sectionDone = section.items.filter(
            (i) => checklistCompleted[checklistItemId(section.category, i)]
          ).length;
          const sectionComplete = sectionDone === sectionTotal;

          return (
            <div
              key={section.category}
              className={cn(
                "rounded-xl border bg-card overflow-hidden transition-all",
                sectionComplete
                  ? "border-emerald-200 dark:border-emerald-900"
                  : "border-border/50"
              )}
            >
              {/* Section header */}
              <div
                className={cn(
                  "flex items-center justify-between px-5 py-3.5 border-b",
                  sectionComplete
                    ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900"
                    : "bg-muted/20 border-border/50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  {sectionComplete ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                  ) : (
                    <div className="h-4.5 w-4.5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <h3 className="font-semibold text-sm">{section.category}</h3>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    sectionComplete
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  )}
                >
                  {sectionDone}/{sectionTotal}
                </span>
              </div>

              {/* Items */}
              <ul className="divide-y divide-border/30">
                {section.items.map((item) => {
                  const id = checklistItemId(section.category, item);
                  const done = !!checklistCompleted[id];
                  return (
                    <li key={item}>
                      <label
                        className={cn(
                          "flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors group",
                          done ? "bg-emerald-50/30 dark:bg-emerald-950/5" : "hover:bg-muted/20"
                        )}
                      >
                        <Checkbox
                          checked={done}
                          onCheckedChange={() => toggleChecklist(id)}
                          className="h-4.5 w-4.5 rounded border-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 data-[state=checked]:text-white"
                        />
                        <span
                          className={cn(
                            "text-sm transition-all flex-1",
                            done
                              ? "line-through text-muted-foreground/70"
                              : "text-foreground group-hover:text-foreground"
                          )}
                        >
                          {item}
                        </span>
                        {done && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Completion celebration */}
      {isComplete && (
        <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 p-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <Sparkles className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-lg text-emerald-800 dark:text-emerald-300">
              Week complete! 🎉
            </p>
            <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">
              All {totalItems} optimization tasks are done. Reset anytime to start fresh next week.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// Naming
// =============================================================

function NamingPanel() {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Tag}
        title="Campaign Naming Format"
        description="Consistency equals clarity. Use this format for every campaign, ad group, and keyword."
        iconBg="bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
      />

      {/* Format display */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 sm:p-8 text-center">
        <p className="text-[10px] uppercase tracking-widest text-primary/70 font-semibold mb-3">
          Standard Format
        </p>
        <p className="font-mono text-lg sm:text-xl font-bold tracking-wide">
          {namingFormat.format}
        </p>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ArrowRight className="h-3 w-3" />
          <span>Copy this structure for every new campaign</span>
        </div>
      </div>

      {/* Examples */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5" />
          Examples
        </h3>
        <div className="space-y-2">
          {namingFormat.examples.map((ex, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-3 group hover:border-primary/20 transition-colors"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary shrink-0">
                {i + 1}
              </span>
              <code className="text-sm font-mono text-foreground/90">{ex}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Token reference */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/50 bg-muted/20">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            Token Reference
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/30">
          <div className="p-5">
            <p className="font-mono text-sm font-semibold text-primary mb-1">[Product]</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your SKU / brand abbreviation, e.g. &quot;WaterBottle&quot;
            </p>
          </div>
          <div className="p-5">
            <p className="font-mono text-sm font-semibold text-primary mb-1">[Ad Type]</p>
            <p className="text-xs text-muted-foreground leading-relaxed">SP, SB, SBV, SD</p>
          </div>
          <div className="p-5">
            <p className="font-mono text-sm font-semibold text-primary mb-1">[Match Type]</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Auto, Broad, Phrase, Exact, ASIN, Video, Placement
            </p>
          </div>
          <div className="p-5">
            <p className="font-mono text-sm font-semibold text-primary mb-1">[Purpose]</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Discovery, Expansion, Heroes, Conquest, Brand, Retarget
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Example Report
// =============================================================

function ReportPanel() {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Mail}
        title="Example Weekly Report"
        description="The 5-section structure from Module 4.1 — with sample content"
        iconBg="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
      />

      {/* Report document */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        {/* Email header */}
        <div className="border-b border-border/50 px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Mail className="h-3 w-3" />
            <span>Subject Line</span>
          </div>
          <p className="font-semibold">{exampleReport.subject}</p>
        </div>

        {/* Sections */}
        <div className="divide-y divide-border/30">
          {exampleReport.sections.map((section, i) => (
            <div key={i} className="px-6 py-5">
              <div className="flex items-center gap-2.5 mb-3">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold text-white",
                    i === 0
                      ? "bg-blue-500"
                      : i === 1
                      ? "bg-violet-500"
                      : i === 2
                      ? "bg-amber-500"
                      : i === 3
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                  )}
                >
                  {i + 1}
                </span>
                <h3 className="font-semibold text-sm">{section.title}</h3>
              </div>
              <ul className="space-y-2 ml-8">
                {section.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                    <span className="text-foreground/80 leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10 p-4">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-400/80 leading-relaxed">
          <span className="font-semibold">Pro tip:</span> Use this as a template for your weekly
          client reports. Keep bullets short and concrete — name specific keywords, campaigns, and
          dollar amounts.
        </p>
      </div>
    </div>
  );
}

// =============================================================
// Deadlines
// =============================================================

function DeadlinesPanel() {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={CalendarDays}
        title="Submission Deadlines"
        description="What&apos;s due and when — organized by phase"
        iconBg="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
      />

      <div className="space-y-4">
        {submissionChecklist.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card overflow-hidden hover:border-border transition-colors"
          >
            {/* Phase header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">{item.phase}</h3>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-1">
                <Clock className="h-3 w-3 text-amber-600 dark:text-amber-500" />
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Due: {item.deadline}
                </span>
              </div>
            </div>

            {/* Items */}
            <ul className="divide-y divide-border/20">
              {item.items.map((it, j) => (
                <li key={j} className="flex items-start gap-3 px-5 py-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                  <span className="text-sm text-foreground/80 leading-relaxed">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
