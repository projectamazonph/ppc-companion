"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BrandButton } from "@/components/shared/buttons";
import { formulas } from "@/lib/course-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import styles from "./tools.module.css";
import { Calculator, MagnifyingGlass as Search, Stack as Layers, ArrowsClockwise as RefreshCw, TrendUp as TrendingUp, TrendDown as TrendingDown, Lightning as Zap, Plus, Trash as Trash2, Lightbulb, CheckCircle as CheckCircle2, Warning as AlertTriangle, Pause, ArrowUpRight, ArrowDownRight, ArrowsCounterClockwise as RotateCcw, Compass, ArrowsOut as Expand, Star, Shield, Copy, Check, ChartBar as BarChart3, Target, CurrencyDollar as DollarSign, CursorClick as MousePointerClick, ShoppingCart, Eye, Receipt, Question as CircleHelp, Sparkle as Sparkles } from "@phosphor-icons/react";

// =============================================================
// Shared helpers
// =============================================================

function parseNum(s: string): number {
  const cleaned = s.replace(/[$,%\s]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function fmt(n: number, opts: { percent?: boolean; currency?: boolean; decimals?: number } = {}): string {
  const d = opts.decimals ?? 2;
  if (opts.percent) return `${n.toFixed(d)}%`;
  if (opts.currency) return `$${n.toFixed(d)}`;
  return n.toFixed(d);
}

// =============================================================
// Tool: Metrics Calculator
// =============================================================

type MetricKey = "impressions" | "clicks" | "spend" | "orders" | "adSales" | "totalRevenue";

const METRIC_LABELS: Record<MetricKey, { label: string; placeholder: string; icon: typeof Eye }> = {
  impressions: { label: "Impressions", placeholder: "10000", icon: Eye },
  clicks: { label: "Clicks", placeholder: "400", icon: MousePointerClick },
  spend: { label: "Ad Spend ($)", placeholder: "500", icon: DollarSign },
  orders: { label: "Orders", placeholder: "20", icon: ShoppingCart },
  adSales: { label: "Ad-Attributed Sales ($)", placeholder: "2000", icon: Receipt },
  totalRevenue: { label: "Total Revenue (ad + organic) ($)", placeholder: "5000", icon: BarChart3 },
};

function MetricsCalculator() {
  const [values, setValues] = useState<Record<MetricKey, string>>({
    impressions: "",
    clicks: "",
    spend: "",
    orders: "",
    adSales: "",
    totalRevenue: "",
  });
  const { toast } = useToast();

  const n = {
    impressions: parseNum(values.impressions),
    clicks: parseNum(values.clicks),
    spend: parseNum(values.spend),
    orders: parseNum(values.orders),
    adSales: parseNum(values.adSales),
    totalRevenue: parseNum(values.totalRevenue),
  };

  const ctr = n.impressions > 0 ? (n.clicks / n.impressions) * 100 : 0;
  const cpc = n.clicks > 0 ? n.spend / n.clicks : 0;
  const cvr = n.clicks > 0 ? (n.orders / n.clicks) * 100 : 0;
  const acos = n.adSales > 0 ? (n.spend / n.adSales) * 100 : 0;
  const roas = n.spend > 0 ? n.adSales / n.spend : 0;
  const tacos = n.totalRevenue > 0 ? (n.spend / n.totalRevenue) * 100 : 0;

  const metrics = [
    { name: "CTR", value: ctr, display: fmt(ctr, { percent: true, decimals: 2 }), formula: "Clicks ÷ Impressions x 100", inputs: ["impressions", "clicks"], status: ctr > 0.5 ? "good" : ctr > 0 ? "warn" : "neutral" },
    { name: "CPC", value: cpc, display: fmt(cpc, { currency: true, decimals: 2 }), formula: "Spend ÷ Clicks", inputs: ["spend", "clicks"], status: cpc > 0 && cpc < 1.5 ? "good" : cpc > 0 && cpc <= 2.5 ? "warn" : cpc > 0 ? "bad" : "neutral" },
    { name: "CVR", value: cvr, display: fmt(cvr, { percent: true, decimals: 1 }), formula: "Orders ÷ Clicks x 100", inputs: ["clicks", "orders"], status: cvr >= 10 ? "good" : cvr >= 5 ? "warn" : cvr > 0 ? "bad" : "neutral" },
    { name: "ACoS", value: acos, display: fmt(acos, { percent: true, decimals: 1 }), formula: "Spend ÷ Ad Sales x 100", inputs: ["spend", "adSales"], status: acos > 0 && acos <= 30 ? "good" : acos > 0 && acos <= 50 ? "warn" : acos > 0 ? "bad" : "neutral" },
    { name: "ROAS", value: roas, display: fmt(roas, { decimals: 2 }), formula: "Ad Sales ÷ Spend", inputs: ["adSales", "spend"], status: roas >= 4 ? "good" : roas >= 2 ? "warn" : roas > 0 ? "bad" : "neutral" },
    { name: "TACoS", value: tacos, display: fmt(tacos, { percent: true, decimals: 1 }), formula: "Spend ÷ Total Revenue x 100", inputs: ["spend", "totalRevenue"], status: tacos > 0 && tacos <= 15 ? "good" : tacos > 0 && tacos <= 25 ? "warn" : tacos > 0 ? "bad" : "neutral" },
  ] as const;

  const reset = () => {
    setValues({ impressions: "", clicks: "", spend: "", orders: "", adSales: "", totalRevenue: "" });
    toast({ title: "Cleared", description: "All inputs reset." });
  };

  const loadExample = () => {
    setValues({
      impressions: "10000",
      clicks: "400",
      spend: "500",
      orders: "20",
      adSales: "2000",
      totalRevenue: "5000",
    });
    toast({ title: "Example loaded", description: "Same data as Exercise 1.2A." });
  };

  const statusColor = (status: string) =>
    status === "good"
      ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20"
      : status === "warn"
      ? "border-blue-300 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20"
      : status === "bad"
      ? "border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/20"
      : "border-border/60 bg-card";

  const statusBadge = (status: string) =>
    status === "good"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0"
      : status === "warn"
      ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-0"
      : status === "bad"
      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-0"
      : "bg-muted text-muted-foreground border-0";

  return (
    <div className={styles.section}>
      {/* Input section */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
            <Target className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Input Data</h3>
            <p className="text-xs text-muted-foreground">Enter your campaign metrics — all calculations update live.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(METRIC_LABELS) as MetricKey[]).map((key) => {
            const Icon = METRIC_LABELS[key].icon;
            return (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`m-${key}`} className="text-xs font-medium flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  {METRIC_LABELS[key].label}
                </Label>
                <Input
                  id={`m-${key}`}
                  value={values[key]}
                  onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                  placeholder={METRIC_LABELS[key].placeholder}
                  inputMode="decimal"
                  className="font-mono bg-muted/40 border-border/60 focus:bg-background transition-colors"
                />
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/60">
          <BrandButton onClick={loadExample} size="sm" variant="outline">
            <Zap className="h-3.5 w-3.5" />
            Load Exercise 1.2A example
          </BrandButton>
          <BrandButton onClick={reset} size="sm" variant="ghost">
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </BrandButton>
        </div>
      </div>

      {/* Results grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Calculated Metrics</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => {
            const hasInputs = m.inputs.every((k) => values[k].trim().length > 0);
            return (
              <div
                key={m.name}
                className={cn(
                  "rounded-xl border-2 p-4 transition-all duration-200",
                  hasInputs ? statusColor(m.status) : "border-dashed border-border/40 bg-muted/10"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {m.name}
                  </span>
                  {hasInputs && (
                    <Badge className={cn("text-[10px] px-1.5 py-0", statusBadge(m.status))} variant="secondary">
                      {m.status === "good" ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : m.status === "bad" ? <TrendingDown className="h-2.5 w-2.5 mr-0.5" /> : null}
                      {m.status === "good" ? "Healthy" : m.status === "warn" ? "Watch" : m.status === "bad" ? "Poor" : ""}
                    </Badge>
                  )}
                </div>
                <p className={cn("text-2xl font-bold tabular-nums tracking-tight", !hasInputs && "text-muted-foreground/40")}>
                  {hasInputs ? m.display : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1.5 font-mono leading-tight">{m.formula}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formula reference */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            All formulas at a glance
          </h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          {formulas.map((f) => (
            <div key={f.name} className="rounded-lg bg-card border border-border/60 p-3">
              <p className="font-semibold text-foreground">{f.name}</p>
              <p className="text-muted-foreground font-mono mt-0.5">{f.formula}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation guide */}
      <div className="rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <CircleHelp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            How to read the colors
          </h3>
        </div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 mt-0.5 shrink-0" />
            <span><strong className="text-foreground">Healthy:</strong> within common healthy ranges (CTR {'>'} 0.5%, CVR {'>='} 10%, ACoS {'<='} 30%, TACoS {'<='} 15%).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500 mt-0.5 shrink-0" />
            <span><strong className="text-foreground">Watch:</strong> borderline — keep an eye on the trend.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500 mt-0.5 shrink-0" />
            <span><strong className="text-foreground">Poor:</strong> outside healthy ranges — review the listing, targeting, or bids.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// =============================================================
// Tool: Search Term Analyzer
// =============================================================

type Row = {
  id: string;
  searchTerm: string;
  clicks: string;
  spend: string;
  orders: string;
  sales: string;
};

const PRESET_ROWS: Row[] = [
  { id: "p1", searchTerm: "insulated water bottle", clicks: "45", spend: "67.50", orders: "8", sales: "240" },
  { id: "p2", searchTerm: "cheap water bottle", clicks: "32", spend: "28.80", orders: "0", sales: "0" },
  { id: "p3", searchTerm: "water bottle 32oz", clicks: "28", spend: "42", orders: "5", sales: "150" },
  { id: "p4", searchTerm: "glass water bottle", clicks: "18", spend: "27", orders: "0", sales: "0" },
  { id: "p5", searchTerm: "hiking water bottle with filter", clicks: "12", spend: "18", orders: "3", sales: "90" },
];

type Recommendation = {
  action: "promote" | "negative" | "increase" | "decrease" | "pause" | "keep";
  bidChange: number;
  reason: string;
};

function recommend(row: Row, targetAcos: number): Recommendation | null {
  const clicks = parseNum(row.clicks);
  const spend = parseNum(row.spend);
  const orders = parseNum(row.orders);
  const sales = parseNum(row.sales);
  if (clicks === 0 && spend === 0) return null;
  const acos = sales > 0 ? (spend / sales) * 100 : spend > 0 ? Infinity : 0;

  if (clicks >= 10 && orders === 0) {
    return {
      action: "negative",
      bidChange: 0,
      reason: `${clicks} clicks with 0 orders — strong negative keyword candidate. Add as negative to stop waste.`,
    };
  }
  if (orders >= 3 && acos <= targetAcos) {
    return {
      action: "promote",
      bidChange: 15,
      reason: `${orders}+ orders at ${acos.toFixed(1)}% ACoS (at/below ${targetAcos}% target). Promote to Exact Hero campaign and increase bid 10-20% to capture more volume.`,
    };
  }
  if (acos > targetAcos && clicks >= 10) {
    return {
      action: "decrease",
      bidChange: -15,
      reason: `ACoS ${acos.toFixed(1)}% is above ${targetAcos}% target with ${clicks} clicks. Decrease bid 10-20% to improve efficiency.`,
    };
  }
  if (acos < targetAcos * 0.7 && orders > 0) {
    return {
      action: "increase",
      bidChange: 15,
      reason: `ACoS ${acos.toFixed(1)}% is well below ${targetAcos}% target. Increase bid 10-20% to capture more volume.`,
    };
  }
  return {
    action: "keep",
    bidChange: 0,
    reason: `Performance is in the safe zone. Keep monitoring — no change yet.`,
  };
}

const actionMeta: Record<Recommendation["action"], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  promote: { label: "Promote to Exact", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0", icon: ArrowUpRight },
  negative: { label: "Add as Negative", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-0", icon: Trash2 },
  increase: { label: "Increase Bid", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-0", icon: TrendingUp },
  decrease: { label: "Decrease Bid", color: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-0", icon: TrendingDown },
  pause: { label: "Pause / Negate", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-0", icon: Pause },
  keep: { label: "Keep Monitoring", color: "bg-muted text-muted-foreground border-0", icon: CheckCircle2 },
};

function SearchTermAnalyzer() {
  const [rows, setRows] = useState<Row[]>(PRESET_ROWS);
  const [targetAcos, setTargetAcos] = useState("30");
  const { toast } = useToast();

  const addRow = () => {
    setRows((r) => [
      ...r,
      { id: `row-${Date.now()}`, searchTerm: "", clicks: "", spend: "", orders: "", sales: "" },
    ]);
  };
  const updateRow = (id: string, field: keyof Row, value: string) => {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };
  const deleteRow = (id: string) => {
    setRows((r) => r.filter((row) => row.id !== id));
  };
  const reset = () => {
    setRows(PRESET_ROWS);
    toast({ title: "Reset to preset data", description: "Loaded the 5 search terms from Exercise 3.3A." });
  };

  const target = parseNum(targetAcos);
  const analysis = useMemo(
    () => rows.map((r) => ({ row: r, rec: recommend(r, target) })),
    [rows, target]
  );

  const summary = useMemo(() => {
    const s = { promote: 0, negative: 0, increase: 0, decrease: 0, keep: 0, totalClicks: 0, totalSpend: 0, totalOrders: 0, totalSales: 0 };
    for (const a of analysis) {
      if (!a.rec) continue;
      s[a.rec.action]++;
      s.totalClicks += parseNum(a.row.clicks);
      s.totalSpend += parseNum(a.row.spend);
      s.totalOrders += parseNum(a.row.orders);
      s.totalSales += parseNum(a.row.sales);
    }
    return s;
  }, [analysis]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="targetAcos" className="text-xs font-medium flex items-center gap-1.5">
              <Target className="h-3 w-3 text-muted-foreground" />
              Target ACoS (%)
            </Label>
            <Input
              id="targetAcos"
              value={targetAcos}
              onChange={(e) => setTargetAcos(e.target.value)}
              className="w-28 font-mono bg-muted/40 border-border/60 focus:bg-background transition-colors"
              inputMode="decimal"
            />
          </div>
          <BrandButton onClick={addRow} size="sm" variant="default">
            <Plus className="h-3.5 w-3.5" />
            Add row
          </BrandButton>
          <BrandButton onClick={reset} size="sm" variant="outline">
            <RotateCcw className="h-3.5 w-3.5" />
            Load Exercise 3.3A
          </BrandButton>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <MousePointerClick className="h-3 w-3 text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total clicks</p>
          </div>
          <p className="text-xl font-bold tabular-nums">{summary.totalClicks}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total spend</p>
          </div>
          <p className="text-xl font-bold tabular-nums">${summary.totalSpend.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ShoppingCart className="h-3 w-3 text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total orders</p>
          </div>
          <p className="text-xl font-bold tabular-nums">{summary.totalOrders}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Receipt className="h-3 w-3 text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total sales</p>
          </div>
          <p className="text-xl font-bold tabular-nums">${summary.totalSales.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart3 className="h-3 w-3 text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Overall ACoS</p>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {summary.totalSales > 0 ? `${((summary.totalSpend / summary.totalSales) * 100).toFixed(1)}%` : "—"}
          </p>
        </div>
      </div>

      {/* Action counts */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(actionMeta) as Recommendation["action"][]).map((key) => {
          const count = summary[key as keyof typeof summary] as number;
          if (count === 0) return null;
          const meta = actionMeta[key];
          const Icon = meta.icon;
          return (
            <Badge key={key} className={cn("text-xs px-2.5 py-1", meta.color)}>
              <Icon className="h-3 w-3 mr-1" />
              {meta.label}: {count}
            </Badge>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left font-semibold py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Search term</th>
                <th className="text-right font-semibold py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Clicks</th>
                <th className="text-right font-semibold py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Spend</th>
                <th className="text-right font-semibold py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Orders</th>
                <th className="text-right font-semibold py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Sales</th>
                <th className="text-right font-semibold py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">ACoS</th>
                <th className="text-left font-semibold py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Recommendation</th>
                <th className="py-3 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {analysis.map(({ row, rec }) => {
                const clicks = parseNum(row.clicks);
                const spend = parseNum(row.spend);
                const sales = parseNum(row.sales);
                const acos = sales > 0 ? (spend / sales) * 100 : spend > 0 ? Infinity : 0;
                return (
                  <tr key={row.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors align-top">
                    <td className="py-2.5 px-4">
                      <Input
                        value={row.searchTerm}
                        onChange={(e) => updateRow(row.id, "searchTerm", e.target.value)}
                        placeholder="e.g. insulated water bottle"
                        className="h-8 text-sm border-0 px-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/40 rounded"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <Input
                        value={row.clicks}
                        onChange={(e) => updateRow(row.id, "clicks", e.target.value)}
                        placeholder="0"
                        className="h-8 w-16 text-right font-mono text-sm bg-muted/30 border-border/50"
                        inputMode="decimal"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <Input
                        value={row.spend}
                        onChange={(e) => updateRow(row.id, "spend", e.target.value)}
                        placeholder="0.00"
                        className="h-8 w-20 text-right font-mono text-sm bg-muted/30 border-border/50"
                        inputMode="decimal"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <Input
                        value={row.orders}
                        onChange={(e) => updateRow(row.id, "orders", e.target.value)}
                        placeholder="0"
                        className="h-8 w-16 text-right font-mono text-sm bg-muted/30 border-border/50"
                        inputMode="decimal"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <Input
                        value={row.sales}
                        onChange={(e) => updateRow(row.id, "sales", e.target.value)}
                        placeholder="0.00"
                        className="h-8 w-20 text-right font-mono text-sm bg-muted/30 border-border/50"
                        inputMode="decimal"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-sm tabular-nums">
                      {sales > 0 ? `${acos.toFixed(1)}%` : spend > 0 ? "∞" : "—"}
                    </td>
                    <td className="py-2.5 px-4 min-w-[260px]">
                      {rec ? (
                        (() => {
                          const meta = actionMeta[rec.action];
                          const ActionIcon = meta.icon;
                          return (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge className={cn("text-[10px] px-1.5 py-0.5", meta.color)}>
                                  <ActionIcon className="h-2.5 w-2.5 mr-0.5" />
                                  {meta.label}
                                </Badge>
                                {rec.bidChange !== 0 && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                                    Bid {rec.bidChange > 0 ? "+" : ""}{rec.bidChange}%
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.reason}</p>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Enter data to see recommendation</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        onClick={() => deleteRow(row.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules reference */}
      <div className="rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Decision rules (from Module 3.3)
          </h3>
        </div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2"><AlertTriangle className="h-3 w-3 mt-0.5 text-rose-500 shrink-0" /> <span><strong className="text-foreground">Negative candidate:</strong> 10-15+ clicks with 0 orders, or obviously irrelevant.</span></li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-500 shrink-0" /> <span><strong className="text-foreground">Promote to Exact:</strong> 3+ orders with ACoS at or below target.</span></li>
          <li className="flex items-start gap-2"><TrendingUp className="h-3 w-3 mt-0.5 text-blue-500 shrink-0" /> <span><strong className="text-foreground">Increase bid +10-20%:</strong> ACoS much lower than target — push for more volume.</span></li>
          <li className="flex items-start gap-2"><TrendingDown className="h-3 w-3 mt-0.5 text-orange-500 shrink-0" /> <span><strong className="text-foreground">Decrease bid -10-20%:</strong> ACoS above target with 10+ clicks of data.</span></li>
          <li className="flex items-start gap-2"><Pause className="h-3 w-3 mt-0.5 text-rose-500 shrink-0" /> <span><strong className="text-foreground">Pause / negate:</strong> 10+ clicks with 0 orders — strongly consider stopping the bleed.</span></li>
        </ul>
      </div>
    </div>
  );
}

// =============================================================
// Tool: Campaign Builder
// =============================================================

type Layer = "discovery" | "expansion" | "heroes" | "defense";

type Campaign = {
  id: string;
  name: string;
  adType: string;
  matchType: string;
  budget: string;
  goal: string;
  exampleKeywords: string;
  layer: Layer;
};

const LAYER_META: Record<Layer, { label: string; budgetPct: number; description: string; color: string; icon: typeof Compass; gradient: string }> = {
  discovery: {
    label: "Discovery",
    budgetPct: 30,
    description: "Auto + Broad. Find new converting search terms.",
    color: "border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20",
    icon: Compass,
    gradient: "bg-blue-600",
  },
  expansion: {
    label: "Expansion",
    budgetPct: 20,
    description: "Phrase. Scale promising terms with more control.",
    color: "border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20",
    icon: Expand,
    gradient: "bg-rose-500",
  },
  heroes: {
    label: "Heroes",
    budgetPct: 40,
    description: "Exact. Maximize profit on best keywords.",
    color: "border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20",
    icon: Star,
    gradient: "bg-emerald-500",
  },
  defense: {
    label: "Defense & Conquest",
    budgetPct: 10,
    description: "ASIN + SD. Defend your listings, attack competitors.",
    color: "border-violet-300 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20",
    icon: Shield,
    gradient: "bg-violet-500",
  },
};

const PRESET_CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "WaterBottle – SP – Auto – Discovery", adType: "Sponsored Products", matchType: "Auto", budget: "30", goal: "Discover converting search terms", exampleKeywords: "(Amazon decides)", layer: "discovery" },
  { id: "c2", name: "WaterBottle – SP – Broad – Discovery", adType: "Sponsored Products", matchType: "Broad", budget: "20", goal: "Explore long-tail & synonyms", exampleKeywords: "insulated water bottle, steel water bottle", layer: "discovery" },
  { id: "c3", name: "WaterBottle – SP – Phrase – Expansion", adType: "Sponsored Products", matchType: "Phrase", budget: "25", goal: "Scale working terms with control", exampleKeywords: "water bottle 32oz, hiking water bottle", layer: "expansion" },
  { id: "c4", name: "WaterBottle – SP – Exact – Heroes", adType: "Sponsored Products", matchType: "Exact", budget: "60", goal: "Maximize profit on hero keywords", exampleKeywords: "insulated water bottle 32oz", layer: "heroes" },
  { id: "c5", name: "WaterBottle – SD – ASIN – Conquest", adType: "Sponsored Display", matchType: "ASIN Targeting", budget: "15", goal: "Conquest weaker competitor ASINs", exampleKeywords: "B08XXX competitor ASINs", layer: "defense" },
];

const AD_TYPES = ["Sponsored Products", "Sponsored Brands", "Sponsored Display"];
const MATCH_TYPES = ["Auto", "Broad", "Phrase", "Exact", "ASIN", "Video", "Placement"];

function CampaignBuilder() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(PRESET_CAMPAIGNS);
  const [product, setProduct] = useState("WaterBottle");
  const [totalBudget, setTotalBudget] = useState("150");
  const { toast } = useToast();

  const totalBudgetNum = parseFloat(totalBudget.replace(/[$,\s]/g, "")) || 0;
  const allocatedBudget = campaigns.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0);

  const addCampaign = (layer: Layer) => {
    const id = `c-${Date.now()}`;
    const newC: Campaign = {
      id,
      name: `${product || "Product"} – SP – Auto – ${LAYER_META[layer].label}`,
      adType: "Sponsored Products",
      matchType: "Auto",
      budget: "10",
      goal: "",
      exampleKeywords: "",
      layer,
    };
    setCampaigns((c) => [...c, newC]);
  };

  const updateCampaign = (id: string, field: keyof Campaign, value: string) => {
    setCampaigns((c) => c.map((camp) => (camp.id === id ? { ...camp, [field]: value } : camp)));
  };
  const deleteCampaign = (id: string) => setCampaigns((c) => c.filter((camp) => camp.id !== id));

  const autoName = (c: Campaign) => {
    const purpose =
      c.layer === "discovery" ? "Discovery" :
      c.layer === "expansion" ? "Expansion" :
      c.layer === "heroes" ? "Heroes" : "Conquest";
    const adShort =
      c.adType === "Sponsored Products" ? "SP" :
      c.adType === "Sponsored Brands" ? "SB" :
      c.adType === "Sponsored Display" ? "SD" : "SP";
    return `${product || "Product"} – ${adShort} – ${c.matchType} – ${purpose}`;
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    }
  };

  const exportBlueprint = () => {
    const lines = [
      `Campaign Blueprint — ${product}`,
      `Total Budget: $${totalBudget}/day`,
      "",
      ...campaigns.map((c) =>
        `${c.name}\n  Ad Type: ${c.adType}\n  Match Type: ${c.matchType}\n  Budget: $${c.budget}/day\n  Goal: ${c.goal}\n  Example Keywords: ${c.exampleKeywords}\n`
      ),
    ];
    copyToClipboard(lines.join("\n"));
  };

  return (
    <div className="space-y-6">
      {/* Product + budget header */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="product" className="text-xs font-medium flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-muted-foreground" />
              Product name
            </Label>
            <Input
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="WaterBottle"
              className="bg-muted/40 border-border/60 focus:bg-background transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget" className="text-xs font-medium flex items-center gap-1.5">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              Total daily budget ($)
            </Label>
            <Input
              id="budget"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="font-mono bg-muted/40 border-border/60 focus:bg-background transition-colors"
              inputMode="decimal"
            />
          </div>
        </div>
      </div>

      {/* Budget allocation bar */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Budget allocation by layer</h3>
          </div>
          <p className="text-xs tabular-nums">
            <span className="font-bold">${allocatedBudget.toFixed(0)}</span>
            <span className="text-muted-foreground"> / ${totalBudgetNum.toFixed(0)} allocated</span>
          </p>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden bg-muted">
          {(Object.keys(LAYER_META) as Layer[]).map((layer) => {
            const total = campaigns.filter((c) => c.layer === layer).reduce((s, c) => s + (parseFloat(c.budget) || 0), 0);
            const pct = totalBudgetNum > 0 ? (total / totalBudgetNum) * 100 : 0;
            return (
              <div
                key={layer}
                className={cn("h-full transition-all duration-300", LAYER_META[layer].gradient)}
                style={{ width: `${pct}%` }}
                title={`${LAYER_META[layer].label}: $${total.toFixed(0)} (${pct.toFixed(0)}%)`}
              />
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[11px]">
          {(Object.keys(LAYER_META) as Layer[]).map((layer) => {
            const total = campaigns.filter((c) => c.layer === layer).reduce((s, c) => s + (parseFloat(c.budget) || 0), 0);
            const pct = totalBudgetNum > 0 ? (total / totalBudgetNum) * 100 : 0;
            const target = LAYER_META[layer].budgetPct;
            const Icon = LAYER_META[layer].icon;
            return (
              <div key={layer} className="flex items-center gap-1.5">
                <div className={cn("flex h-4 w-4 items-center justify-center rounded-sm text-white", LAYER_META[layer].gradient)}>
                  <Icon className="h-2.5 w-2.5" />
                </div>
                <span className="text-muted-foreground">{LAYER_META[layer].label}</span>
                <span className="font-bold tabular-nums">{pct.toFixed(0)}%</span>
                <span className="text-muted-foreground text-[10px]">(target {target}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layer sections */}
      {(Object.keys(LAYER_META) as Layer[]).map((layer) => {
        const meta = LAYER_META[layer];
        const layerCampaigns = campaigns.filter((c) => c.layer === layer);
        const Icon = meta.icon;
        return (
          <div key={layer} className={cn("rounded-xl border-2 p-5", meta.color)}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm", meta.gradient)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">{meta.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                  Target: {meta.budgetPct}% · {layerCampaigns.length} campaign{layerCampaigns.length !== 1 ? "s" : ""}
                </Badge>
                <BrandButton size="sm" variant="outline" onClick={() => addCampaign(layer)}>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </BrandButton>
              </div>
            </div>

            {layerCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground italic">No campaigns yet — click "Add" to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {layerCampaigns.map((c) => (
                  <div key={c.id} className="rounded-xl border border-border/60 bg-card/80 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={c.name}
                        onChange={(e) => updateCampaign(c.id, "name", e.target.value)}
                        className="font-mono text-xs h-9 bg-muted/30 border-border/50"
                        placeholder="Campaign name"
                      />
                      <BrandButton
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 shrink-0"
                        onClick={() => updateCampaign(c.id, "name", autoName(c))}
                        title="Auto-generate name using [Product] – [Ad Type] – [Match Type] – [Purpose]"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </BrandButton>
                      <BrandButton
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        onClick={() => deleteCampaign(c.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </BrandButton>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Ad Type</Label>
                        <select
                          value={c.adType}
                          onChange={(e) => updateCampaign(c.id, "adType", e.target.value)}
                          className="flex h-9 w-full rounded-lg border border-input bg-muted/30 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          {AD_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Match Type</Label>
                        <select
                          value={c.matchType}
                          onChange={(e) => updateCampaign(c.id, "matchType", e.target.value)}
                          className="flex h-9 w-full rounded-lg border border-input bg-muted/30 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          {MATCH_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Daily Budget ($)</Label>
                        <Input
                          value={c.budget}
                          onChange={(e) => updateCampaign(c.id, "budget", e.target.value)}
                          className="h-9 font-mono text-xs bg-muted/30 border-border/50"
                          inputMode="decimal"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Goal</Label>
                        <Input
                          value={c.goal}
                          onChange={(e) => updateCampaign(c.id, "goal", e.target.value)}
                          className="h-9 text-xs bg-muted/30 border-border/50"
                          placeholder="e.g. Maximize profit"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Example Keywords / Targets</Label>
                      <Input
                        value={c.exampleKeywords}
                        onChange={(e) => updateCampaign(c.id, "exampleKeywords", e.target.value)}
                        className="h-9 text-xs bg-muted/30 border-border/50"
                        placeholder="e.g. insulated water bottle 32oz, B08XXX"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Export */}
      <div className="flex flex-wrap gap-2">
        <BrandButton onClick={exportBlueprint} size="sm" variant="default">
          <Copy className="h-3.5 w-3.5" />
          Copy blueprint to clipboard
        </BrandButton>
      </div>

      {/* Naming convention tip */}
      <div className="rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Naming convention
          </h3>
        </div>
        <div className="font-mono text-xs bg-card border border-border/60 rounded-lg p-3 inline-block">
          [Product] - [Ad Type] - [Match Type/Targeting] - [Purpose]
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Examples: <span className="font-mono">WaterBottle - SP - Auto - Discovery</span> · <span className="font-mono">WaterBottle - SP - Exact - Heroes</span> · <span className="font-mono">WaterBottle - SB - Video - Brand</span> · <span className="font-mono">WaterBottle - SD - ASIN - Conquest</span>
        </p>
        <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-2">
          Click the checkmark next to a campaign name to auto-generate it from this format.
        </p>
      </div>
    </div>
  );
}

// =============================================================
// Main Tools Section — wrapper with tool navigation
// =============================================================

type ToolId = "calculator" | "analyzer" | "builder";

const TOOLS: { id: ToolId; label: string; description: string; icon: typeof Calculator; gradient: string }[] = [
  { id: "calculator", label: "Metrics Calculator", description: "CTR, CPC, ACoS, ROAS", icon: Calculator, gradient: "bg-blue-600" },
  { id: "analyzer", label: "Search Term Analyzer", description: "Promote, negate, bid", icon: Search, gradient: "bg-rose-500" },
  { id: "builder", label: "Campaign Builder", description: "4-layer structure", icon: Layers, gradient: "bg-violet-500" },
];

export function ToolsSection() {
  const [activeTool, setActiveTool] = useState<ToolId>("calculator");

  const activeMeta = TOOLS.find((t) => t.id === activeTool)!;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Tools</h1>
            <Badge className="bg-primary/10 dark:bg-primary/20 text-primary border-0 text-[10px] px-2 py-0.5 font-semibold">
              3
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Interactive tools for your PPC workflow. All work offline — nothing is sent to a server.
          </p>
        </div>
      </div>

      {/* Tool selector — card navigation */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 sm:p-4 transition-all duration-200 text-center",
                isActive
                  ? "border-primary/40 dark:border-primary/70 bg-primary/5 dark:bg-primary/20 shadow-sm"
                  : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
              )}
            >
              <div className={cn(
                "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-all duration-200",
                isActive
                  ? `${tool.gradient} text-white shadow-md`
                  : "bg-muted text-muted-foreground group-hover:bg-muted/80"
              )}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className={cn(
                  "text-xs sm:text-sm font-semibold leading-tight",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {tool.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{tool.description}</p>
              </div>
              {isActive && (
                <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active tool header */}
      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm", activeMeta.gradient)}>
          <activeMeta.icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-semibold">{activeMeta.label}</h2>
          <p className="text-xs text-muted-foreground">{activeMeta.description}</p>
        </div>
      </div>

      {/* Tool content */}
      <div className="min-h-[400px]">
        {activeTool === "calculator" && <MetricsCalculator />}
        {activeTool === "analyzer" && <SearchTermAnalyzer />}
        {activeTool === "builder" && <CampaignBuilder />}
      </div>
    </div>
  );
}
