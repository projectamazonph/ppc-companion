"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formulas } from "@/lib/course-data";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Search, Layers, RefreshCw, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricKey = "impressions" | "clicks" | "spend" | "orders" | "adSales" | "totalRevenue";

const METRIC_LABELS: Record<MetricKey, { label: string; placeholder: string }> = {
  impressions: { label: "Impressions", placeholder: "10000" },
  clicks: { label: "Clicks", placeholder: "400" },
  spend: { label: "Ad Spend ($)", placeholder: "500" },
  orders: { label: "Orders", placeholder: "20" },
  adSales: { label: "Ad-Attributed Sales ($)", placeholder: "2000" },
  totalRevenue: { label: "Total Revenue (ad + organic) ($)", placeholder: "5000" },
};

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

export function MetricsCalculator() {
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
    { name: "CTR", value: ctr, display: fmt(ctr, { percent: true, decimals: 2 }), formula: "Clicks ÷ Impressions × 100", inputs: ["impressions", "clicks"], status: ctr > 0.5 ? "good" : ctr > 0 ? "warn" : "neutral" },
    { name: "CPC", value: cpc, display: fmt(cpc, { currency: true, decimals: 2 }), formula: "Spend ÷ Clicks", inputs: ["spend", "clicks"], status: cpc > 0 && cpc < 1.5 ? "good" : cpc > 0 && cpc <= 2.5 ? "warn" : cpc > 0 ? "bad" : "neutral" },
    { name: "CVR", value: cvr, display: fmt(cvr, { percent: true, decimals: 1 }), formula: "Orders ÷ Clicks × 100", inputs: ["clicks", "orders"], status: cvr >= 10 ? "good" : cvr >= 5 ? "warn" : cvr > 0 ? "bad" : "neutral" },
    { name: "ACoS", value: acos, display: fmt(acos, { percent: true, decimals: 1 }), formula: "Spend ÷ Ad Sales × 100", inputs: ["spend", "adSales"], status: acos > 0 && acos <= 30 ? "good" : acos > 0 && acos <= 50 ? "warn" : acos > 0 ? "bad" : "neutral" },
    { name: "ROAS", value: roas, display: fmt(roas, { decimals: 2 }), formula: "Ad Sales ÷ Spend", inputs: ["adSales", "spend"], status: roas >= 4 ? "good" : roas >= 2 ? "warn" : roas > 0 ? "bad" : "neutral" },
    { name: "TACoS", value: tacos, display: fmt(tacos, { percent: true, decimals: 1 }), formula: "Spend ÷ Total Revenue × 100", inputs: ["spend", "totalRevenue"], status: tacos > 0 && tacos <= 15 ? "good" : tacos > 0 && tacos <= 25 ? "warn" : tacos > 0 ? "bad" : "neutral" },
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
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>PPC Metrics Calculator</CardTitle>
            <CardDescription>Enter any of the inputs below — all derived metrics compute live.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(METRIC_LABELS) as MetricKey[]).map((key) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`m-${key}`} className="text-xs font-medium">
                {METRIC_LABELS[key].label}
              </Label>
              <Input
                id={`m-${key}`}
                value={values[key]}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                placeholder={METRIC_LABELS[key].placeholder}
                inputMode="decimal"
                className="font-mono"
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadExample} size="sm" variant="outline">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Load Exercise 1.2A example
          </Button>
          <Button onClick={reset} size="sm" variant="ghost">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
        </div>

        {/* Results */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => {
            const hasInputs = m.inputs.every((k) => values[k].trim().length > 0);
            return (
              <div
                key={m.name}
                className={cn(
                  "rounded-xl border-2 p-4 transition-all",
                  hasInputs ? statusColor(m.status) : "border-border/60 bg-muted/20 opacity-60"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {m.name}
                  </span>
                  {hasInputs && (
                    <Badge className={statusBadge(m.status)} variant="secondary">
                      {m.status === "good" ? <TrendingUp className="h-3 w-3 mr-1" /> : m.status === "bad" ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                      {m.status === "good" ? "Healthy" : m.status === "warn" ? "Watch" : m.status === "bad" ? "Poor" : ""}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold tabular-nums">
                  {hasInputs ? m.display : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 font-mono">{m.formula}</p>
              </div>
            );
          })}
        </div>

        {/* Formula reference */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            All formulas at a glance
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-xs">
            {formulas.map((f) => (
              <div key={f.name} className="rounded bg-card border border-border/60 p-2">
                <p className="font-semibold">{f.name}</p>
                <p className="text-muted-foreground font-mono mt-0.5">{f.formula}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interpretation guide */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2">
            How to read the colors
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li><span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1.5" /> <span className="font-semibold">Healthy:</span> within common healthy ranges (CTR {'>'} 0.5%, CVR ≥ 10%, ACoS ≤ 30%, TACoS ≤ 15%).</li>
            <li><span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-1.5" /> <span className="font-semibold">Watch:</span> borderline — keep an eye on the trend.</li>
            <li><span className="inline-block h-2 w-2 rounded-full bg-rose-500 mr-1.5" /> <span className="font-semibold">Poor:</span> outside healthy ranges — review the listing, targeting, or bids.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
