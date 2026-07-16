"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  MagnifyingGlass as Search,
  TrendUp as TrendingUp,
  TrendDown as TrendingDown,
  ArrowUpRight,
  Trash as Trash2,
  Lightbulb,
  X,
} from "@phosphor-icons/react";
import { actionMeta, parseNum, recommend, type Row } from "./search-term-analyzer";
import styles from "./keyword-deep-dive.module.css";

type DeepDiveProps = {
  row: Row | null;
  targetAcos: number;
  onClose: () => void;
};

function buildRelatedIdeas(row: Row, rec: NonNullable<ReturnType<typeof recommend>>) {
  const term = row.searchTerm.trim();
  const ideas: { label: string; hint: string }[] = [];
  if (term) {
    ideas.push({
      label: `Test "${term}" as an Exact match`,
      hint: "Exact captures highest-intent traffic and protects your ACoS.",
    });
    ideas.push({
      label: `Add "${term}" to a Phrase campaign`,
      hint: "Phrase gives control while still exploring long-tail variants.",
    });
  }
  if (rec.action === "negative") {
    ideas.push({
      label: "Add as a negative keyword",
      hint: "Stops wasted spend on a term with clicks but zero orders.",
    });
  } else if (rec.action === "promote" || rec.action === "increase") {
    ideas.push({
      label: "Move into the Heroes (Exact) layer",
      hint: "Scale proven converters with a controlled bid increase.",
    });
  } else if (rec.action === "decrease") {
    ideas.push({
      label: "Trim bid 10–20%",
      hint: "Pull ACoS back toward your target without losing the term.",
    });
  }
  return ideas;
}

export function KeywordDeepDive({ row, targetAcos, onClose }: DeepDiveProps) {
  const rec = row ? recommend(row, targetAcos) : null;
  const clicks = row ? parseNum(row.clicks) : 0;
  const spend = row ? parseNum(row.spend) : 0;
  const orders = row ? parseNum(row.orders) : 0;
  const sales = row ? parseNum(row.sales) : 0;
  const acos = sales > 0 ? (spend / sales) * 100 : spend > 0 ? Infinity : 0;

  const meta = rec ? actionMeta[rec.action] : null;
  const Icon = meta?.icon;
  const related = row && rec ? buildRelatedIdeas(row, rec) : [];

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-[#FF6B35]" />
            <span className="truncate">{row?.searchTerm || "Keyword"}</span>
          </DialogTitle>
          <DialogDescription>
            Drill-down for this search term against a target ACoS of {targetAcos}%.
          </DialogDescription>
        </DialogHeader>

        {/* Metric grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Clicks</p>
            <p className="text-lg font-bold tabular-nums">{clicks}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Spend</p>
            <p className="text-lg font-bold tabular-nums">${spend.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Orders</p>
            <p className="text-lg font-bold tabular-nums">{orders}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sales</p>
            <p className="text-lg font-bold tabular-nums">${sales.toFixed(2)}</p>
          </div>
        </div>

        {/* ACoS + recommendation */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            ACoS
          </span>
          <span className="text-lg font-bold tabular-nums">
            {sales > 0 ? `${acos.toFixed(1)}%` : spend > 0 ? "∞" : "—"}
          </span>
        </div>

        {rec && meta && (
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 text-[#FF6B35]" />}
              <span className="text-sm font-semibold">{meta.label}</span>
              {rec.bidChange !== 0 && (
                <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                  {rec.bidChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  Bid {rec.bidChange > 0 ? "+" : ""}
                  {rec.bidChange}%
                </span>
              )}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{rec.reason}</p>
          </div>
        )}

        {/* Related ideas */}
        {related.length > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900/50 dark:bg-blue-950/10">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              <Lightbulb className="h-3.5 w-3.5" />
              Related ideas
            </p>
            <ul className="mt-2 space-y-2">
              {related.map((idea) => (
                <li key={idea.label} className="flex items-start gap-2 text-xs">
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF6B35]" />
                  <span>
                    <span className="font-medium text-foreground">{idea.label}.</span>{" "}
                    <span className="text-muted-foreground">{idea.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogClose asChild>
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
