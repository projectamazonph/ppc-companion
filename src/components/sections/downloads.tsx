"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandButton } from "@/components/shared/buttons";
import { cn } from "@/lib/utils";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Trophy,
  BookOpen,
  Zap,
  Table2,
  CheckCircle2,
  FolderOpen,
  ArrowDownToLine,
  Info,
  Sparkles,
} from "lucide-react";

// =============================================================
// Downloadable resource definitions
// =============================================================

type Resource = {
  id: string;
  title: string;
  description: string;
  filename: string;
  fileType: "CSV" | "PDF";
  icon: typeof FileText;
  color: string;
  category: "Templates" | "Reference" | "Capstone";
  relatedExercise?: string;
};

const resources: Resource[] = [
  // Templates
  {
    id: "keyword-research",
    title: "Keyword Research Template",
    description:
      "CSV template for organizing keywords into Tier 1, 2, and 3. Pre-filled with 10 sample keywords for a water bottle product. Columns: Keyword, Tier, Volume, Match Type, Campaign Layer, Notes.",
    filename: "keyword-research-template.csv",
    fileType: "CSV",
    icon: FileSpreadsheet,
    color: "from-blue-600 to-blue-700",
    category: "Templates",
    relatedExercise: "3.1A",
  },
  {
    id: "campaign-blueprint",
    title: "Campaign Blueprint Template",
    description:
      "CSV template for designing your 4-layer campaign structure. Pre-filled with sample campaigns. Columns: Campaign Name, Ad Type, Match Type, Daily Budget, Goal, Example Keywords, Bid Strategy.",
    filename: "campaign-blueprint-template.csv",
    fileType: "CSV",
    icon: FileSpreadsheet,
    color: "from-rose-500 to-red-600",
    category: "Templates",
    relatedExercise: "3.2A",
  },
  {
    id: "search-term-report",
    title: "Search Term Report Template",
    description:
      "CSV template for analyzing search term reports. Pre-filled with the 5 search terms from Exercise 3.3A. Columns: Search Term, Clicks, Spend, Orders, Sales, ACoS, Action, Bid Change, Reason.",
    filename: "search-term-report-template.csv",
    fileType: "CSV",
    icon: FileSpreadsheet,
    color: "from-emerald-500 to-teal-600",
    category: "Templates",
    relatedExercise: "3.3A",
  },
  {
    id: "weekly-report",
    title: "Weekly Report Template",
    description:
      "PDF template for writing client-facing weekly reports. Includes all 5 sections (Executive Summary, Wins, Issues, Actions Taken, Next Steps) with fillable fields and a metrics comparison table.",
    filename: "weekly-report-template.pdf",
    fileType: "PDF",
    icon: FileText,
    color: "from-violet-500 to-purple-600",
    category: "Templates",
    relatedExercise: "4.1A",
  },
  // Capstone
  {
    id: "capstone-template",
    title: "Capstone Project Template",
    description:
      "PDF template for the capstone project. Structured sections for all 5 deliverables: keyword research, campaign blueprint, 30-day launch plan, optimization report, and presentation outline with timing.",
    filename: "capstone-project-template.pdf",
    fileType: "PDF",
    icon: Trophy,
    color: "from-violet-500 to-purple-600",
    category: "Capstone",
  },
  // Reference
  {
    id: "cheat-sheet",
    title: "PPC Cheat Sheet",
    description:
      "One-page PDF reference with all metric formulas, healthy ranges, optimization rules, match types, bid strategies, naming convention, common negative keywords, and launch vs scale guidance. Print this and keep it handy.",
    filename: "ppc-cheat-sheet.pdf",
    fileType: "PDF",
    icon: Zap,
    color: "from-blue-600 to-blue-700",
    category: "Reference",
  },
  {
    id: "glossary",
    title: "Glossary (Printable)",
    description:
      "Printable PDF glossary of all Amazon PPC terms organized by category: Fundamentals, Ad Types, Metrics, and Strategy. 30+ terms with clear definitions.",
    filename: "glossary.pdf",
    fileType: "PDF",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-600",
    category: "Reference",
  },
];

// =============================================================
// Category configuration
// =============================================================

type CategoryConfig = {
  label: string;
  icon: typeof FolderOpen;
  description: string;
  accentColor: string;
};

const categoryConfig: Record<Resource["category"], CategoryConfig> = {
  Templates: {
    label: "Templates",
    icon: Table2,
    description: "Spreadsheet and document templates for exercises",
    accentColor: "text-blue-600 dark:text-blue-400",
  },
  Capstone: {
    label: "Capstone",
    icon: Trophy,
    description: "Project templates for your final deliverable",
    accentColor: "text-violet-600 dark:text-violet-400",
  },
  Reference: {
    label: "Reference",
    icon: BookOpen,
    description: "Quick-reference guides and printable resources",
    accentColor: "text-emerald-600 dark:text-emerald-400",
  },
};

// =============================================================
// File type badge styling
// =============================================================

const fileTypeStyles: Record<
  Resource["fileType"],
  { bg: string; text: string; border: string; icon: typeof FileText }
> = {
  CSV: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/25",
    icon: FileSpreadsheet,
  },
  PDF: {
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/25",
    icon: FileText,
  },
};

// =============================================================
// Main component
// =============================================================

export function DownloadsSection() {
  const categories: Resource["category"][] = [
    "Templates",
    "Capstone",
    "Reference",
  ];
  const totalFiles = resources.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Downloads
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
            Templates, cheat sheets, and reference materials. Download these to
            use with the exercises and capstone project.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="self-start sm:self-auto text-xs font-medium px-3 py-1 gap-1.5"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          {totalFiles} files
        </Badge>
      </div>

      {/* ── Info banner ────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 dark:border-blue-800/30 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-transparent dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent dark:from-blue-800/10" />
        <div className="relative flex items-start gap-4 p-5 sm:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
            <Info className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              How to use these files
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CSV files open in Google Sheets, Excel, or Numbers. PDF files are
              printable templates you can fill in by hand or digitally. Each
              template links to a specific exercise — download the template
              before starting that exercise.
            </p>
          </div>
        </div>
      </div>

      {/* ── Resources by category ──────────────────────── */}
      {categories.map((category) => {
        const items = resources.filter((r) => r.category === category);
        if (items.length === 0) return null;

        const config = categoryConfig[category];
        const CategoryIcon = config.icon;

        return (
          <section key={category} className="space-y-4">
            {/* Section header */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60",
                  config.accentColor
                )}
              >
                <CategoryIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {config.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {config.description}
                </p>
              </div>
              <div className="ml-auto">
                <Badge variant="outline" className="text-[10px] font-medium">
                  {items.length} {items.length === 1 ? "file" : "files"}
                </Badge>
              </div>
            </div>

            {/* Resource cards grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((resource) => {
                const Icon = resource.icon;
                const ftStyle = fileTypeStyles[resource.fileType];
                const FtIcon = ftStyle.icon;

                return (
                  <Card
                    key={resource.id}
                    className="group relative border-border/50 hover:border-border bg-card/50 hover:bg-card backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:shadow-black/[0.03] dark:hover:shadow-black/20 flex flex-col overflow-hidden"
                  >
                    {/* Subtle top accent line */}
                    <div
                      className={cn(
                        "h-0.5 w-full bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity",
                        resource.color
                      )}
                    />

                    <CardContent className="p-5 sm:p-6 flex flex-col flex-1">
                      {/* Top row: icon + file type badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-200 group-hover:scale-105",
                            resource.color
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                            ftStyle.bg,
                            ftStyle.text,
                            ftStyle.border
                          )}
                        >
                          <FtIcon className="h-3 w-3" />
                          {resource.fileType}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-[15px] leading-snug text-foreground group-hover:text-foreground transition-colors">
                        {resource.title}
                      </h4>

                      {/* Related exercise badge */}
                      {resource.relatedExercise && (
                        <div className="mt-2.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 dark:bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles className="h-2.5 w-2.5" />
                            Exercise {resource.relatedExercise}
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed flex-1">
                        {resource.description}
                      </p>

                      {/* Download button */}
                      <a
                        href={`/downloads/${resource.filename}`}
                        download
                        className="mt-5 block"
                      >
                        <BrandButton
                          variant="outline"
                          size="default"
                          className="w-full gap-2"
                        >
                          <ArrowDownToLine className="h-4 w-4" />
                          Download {resource.fileType}
                        </BrandButton>
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ── Footer note ────────────────────────────────── */}
      <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 px-5 py-4">
        <p className="text-xs text-muted-foreground leading-relaxed text-center">
          All files are also available in the{" "}
          <code className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/80 border border-border/50">
            /public/downloads/
          </code>{" "}
          directory. Files are generated by{" "}
          <code className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/80 border border-border/50">
            scripts/generate-downloadables.py
          </code>{" "}
          — re-run to regenerate.
        </p>
      </div>
    </div>
  );
}
