"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { KeywordDeepDive } from "./keyword-deep-dive";
import { cn } from "@/lib/utils";
import { MagnifyingGlass as Search, Plus, Trash as Trash2, Lightbulb, CheckCircle as CheckCircle2, Warning as AlertTriangle, TrendUp as TrendingUp, TrendDown as TrendingDown, Pause, ArrowUpRight, ArrowDownRight, ArrowsCounterClockwise as RotateCcw } from "@phosphor-icons/react";

export type Row = {
  id: string;
  searchTerm: string;
  clicks: string;
  spend: string;
  orders: string;
  sales: string;
  description: string;
};

const PRESET_ROWS: Row[] = [
  { id: "p1", searchTerm: "insulated water bottle", clicks: "45", spend: "67.50", orders: "8", sales: "240", description: "Hero term — strong converter. Promote to Exact." },
  { id: "p2", searchTerm: "cheap water bottle", clicks: "32", spend: "28.80", orders: "0", sales: "0", description: "Low-intent traffic. Candidate negative." },
  { id: "p3", searchTerm: "water bottle 32oz", clicks: "28", spend: "42", orders: "5", sales: "150", description: "Exact hero — scaling profitably." },
  { id: "p4", searchTerm: "glass water bottle", clicks: "18", spend: "27", orders: "0", sales: "0", description: "No orders after 18 clicks — negate." },
  { id: "p5", searchTerm: "hiking water bottle with filter", clicks: "12", spend: "18", orders: "3", sales: "90", description: "Long-tail, converting. Expand phrase." },
];

export function parseNum(s: string): number {
  const n = parseFloat(s.replace(/[$,%\s]/g, ""));
  return isNaN(n) ? 0 : n;
}

export type Recommendation = {
  action: "promote" | "negative" | "increase" | "decrease" | "pause" | "keep";
  bidChange: number; // percent
  reason: string;
};

export function recommend(row: Row, targetAcos: number): Recommendation | null {
  const clicks = parseNum(row.clicks);
  const spend = parseNum(row.spend);
  const orders = parseNum(row.orders);
  const sales = parseNum(row.sales);
  if (clicks === 0 && spend === 0) return null;
  const acos = sales > 0 ? (spend / sales) * 100 : spend > 0 ? Infinity : 0;

  // Negative candidate: 10-15+ clicks, 0 orders
  if (clicks >= 10 && orders === 0) {
    return {
      action: "negative",
      bidChange: 0,
      reason: `${clicks} clicks with 0 orders — strong negative keyword candidate. Add as negative to stop waste.`,
    };
  }
  // Promote to Exact: 3+ orders and ACoS at/below target
  if (orders >= 3 && acos <= targetAcos) {
    return {
      action: "promote",
      bidChange: 15,
      reason: `${orders}+ orders at ${acos.toFixed(1)}% ACoS (at/below ${targetAcos}% target). Promote to Exact Hero campaign and increase bid 10–20% to capture more volume.`,
    };
  }
  // Decrease bid: ACoS higher than target with enough data
  if (acos > targetAcos && clicks >= 10) {
    return {
      action: "decrease",
      bidChange: -15,
      reason: `ACoS ${acos.toFixed(1)}% is above ${targetAcos}% target with ${clicks} clicks. Decrease bid 10–20% to improve efficiency.`,
    };
  }
  // Increase bid: ACoS much lower than target
  if (acos < targetAcos * 0.7 && orders > 0) {
    return {
      action: "increase",
      bidChange: 15,
      reason: `ACoS ${acos.toFixed(1)}% is well below ${targetAcos}% target. Increase bid 10–20% to capture more volume.`,
    };
  }
  return {
    action: "keep",
    bidChange: 0,
    reason: `Performance is in the safe zone. Keep monitoring — no change yet.`,
  };
}

export const actionMeta: Record<Recommendation["action"], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  promote: { label: "Promote to Exact", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0", icon: ArrowUpRight },
  negative: { label: "Add as Negative", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-0", icon: Trash2 },
  increase: { label: "Increase Bid", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-0", icon: TrendingUp },
  decrease: { label: "Decrease Bid", color: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-0", icon: TrendingDown },
  pause: { label: "Pause / Negate", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-0", icon: Pause },
  keep: { label: "Keep Monitoring", color: "bg-muted text-muted-foreground border-0", icon: CheckCircle2 },
};

export function SearchTermAnalyzer() {
  const [rows, setRows] = useState<Row[]>(PRESET_ROWS);
  const [targetAcos, setTargetAcos] = useState("30");
  const [deepDiveRow, setDeepDiveRow] = useState<Row | null>(null);
  const { toast } = useToast();

  const addRow = () => {
    setRows((r) => [
      ...r,
      { id: `row-${Date.now()}`, searchTerm: "", clicks: "", spend: "", orders: "", sales: "", description: "" },
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

  // Summary
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
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B35] text-white shadow-sm">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Search Term Analyzer</CardTitle>
            <CardDescription>
              Paste a search term report. Each row gets a recommendation based on the rules from Module 3.3.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Target ACoS + actions */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="targetAcos" className="text-xs font-medium">
              Target ACoS (%)
            </Label>
            <Input
              id="targetAcos"
              value={targetAcos}
              onChange={(e) => setTargetAcos(e.target.value)}
              className="w-28 font-mono"
              inputMode="decimal"
            />
          </div>
          <Button onClick={addRow} size="sm" variant="default" className="bg-[#FF6B35] hover:brightness-105">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add row
          </Button>
          <Button onClick={reset} size="sm" variant="outline">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Load Exercise 3.3A
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="rounded-lg border border-border/60 bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total clicks</p>
            <p className="text-lg font-bold tabular-nums">{summary.totalClicks}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total spend</p>
            <p className="text-lg font-bold tabular-nums">${summary.totalSpend.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total orders</p>
            <p className="text-lg font-bold tabular-nums">{summary.totalOrders}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total sales</p>
            <p className="text-lg font-bold tabular-nums">${summary.totalSales.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Overall ACoS</p>
            <p className="text-lg font-bold tabular-nums">
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
              <Badge key={key} className={meta.color}>
                <Icon className="h-3 w-3 mr-1" />
                {meta.label}: {count}
              </Badge>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
           <table className="w-full text-sm min-w-[1200px]">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="text-left font-semibold py-2 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">Search term</th>
                <th scope="col" className="text-right font-semibold py-2 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">Clicks</th>
                <th scope="col" className="text-right font-semibold py-2 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">Spend</th>
                <th scope="col" className="text-right font-semibold py-2 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">Orders</th>
                <th scope="col" className="text-right font-semibold py-2 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">Sales</th>
                <th scope="col" className="text-right font-semibold py-2 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">ACoS</th>
                <th scope="col" className="text-right font-semibold py-2 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">CPC</th>
                <th scope="col" className="text-right font-semibold py-2 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">CVR</th>
                <th scope="col" className="text-right font-semibold py-2 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">CPA</th>
                <th scope="col" className="text-left font-semibold py-2 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">Recommendation</th>
                <th scope="col" className="text-left font-semibold py-2 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">Notes</th>
                <th scope="col" className="py-2 px-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {analysis.map(({ row, rec }) => {
                const clicks = parseNum(row.clicks);
                const spend = parseNum(row.spend);
                const sales = parseNum(row.sales);
                const acos = sales > 0 ? (spend / sales) * 100 : spend > 0 ? Infinity : 0;
                const orders = parseNum(row.orders);
                const cpc = clicks > 0 ? spend / clicks : 0;
                const cvr = clicks > 0 ? (orders / clicks) * 100 : 0;
                const cpa = orders > 0 ? spend / orders : 0;
                return (
                   <tr key={row.id} className="border-b border-border/50 last:border-0 align-top hover:bg-muted/40 transition-colors">
                    <td className="py-2 px-3">
                      <Input
                        value={row.searchTerm}
                        onChange={(e) => updateRow(row.id, "searchTerm", e.target.value)}
                        placeholder="e.g. insulated water bottle"
                        className="h-8 text-sm border-0 px-0 focus-visible:ring-1"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        value={row.clicks}
                        onChange={(e) => updateRow(row.id, "clicks", e.target.value)}
                        placeholder="0"
                        className="h-8 w-16 text-right font-mono text-sm"
                        inputMode="decimal"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        value={row.spend}
                        onChange={(e) => updateRow(row.id, "spend", e.target.value)}
                        placeholder="0.00"
                        className="h-8 w-20 text-right font-mono text-sm"
                        inputMode="decimal"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        value={row.orders}
                        onChange={(e) => updateRow(row.id, "orders", e.target.value)}
                        placeholder="0"
                        className="h-8 w-16 text-right font-mono text-sm"
                        inputMode="decimal"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        value={row.sales}
                        onChange={(e) => updateRow(row.id, "sales", e.target.value)}
                        placeholder="0.00"
                        className="h-8 w-20 text-right font-mono text-sm"
                        inputMode="decimal"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm tabular-nums">
                      {sales > 0 ? `${acos.toFixed(1)}%` : spend > 0 ? "∞" : "—"}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm tabular-nums">
                      {clicks > 0 ? `$${cpc.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm tabular-nums">
                      {clicks > 0 ? `${cvr.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm tabular-nums">
                      {orders > 0 ? `$${cpa.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2 px-3 min-w-[260px]">
                      {rec ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge className={actionMeta[rec.action].color}>
                              {(() => {
                                const Icon = actionMeta[rec.action].icon;
                                return <Icon className="h-3 w-3 mr-1" />;
                              })()}
                              {actionMeta[rec.action].label}
                            </Badge>
                            {rec.bidChange !== 0 && (
                              <Badge variant="outline" className="text-[10px]">
                                Bid {rec.bidChange > 0 ? "+" : ""}{rec.bidChange}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.reason}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Enter data to see recommendation</span>
                      )}
                    </td>
                    <td className="py-2 px-3 min-w-[180px]">
                      <Input
                        value={row.description}
                        onChange={(e) => updateRow(row.id, "description", e.target.value)}
                        placeholder="Add a note…"
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-[#FF6B35]"
                          onClick={() => setDeepDiveRow(row)}
                          aria-label={`Deep dive for ${row.searchTerm || "empty search term"}`}
                        >
                          <Search className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                          onClick={() => deleteRow(row.id)}
                          aria-label={`Delete row for ${row.searchTerm || "empty search term"}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rules reference */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/10 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2">
            <Lightbulb className="h-3.5 w-3.5" />
            Decision rules (from Module 3.3)
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-start gap-1.5"><AlertTriangle className="h-3 w-3 mt-0.5 text-rose-500 shrink-0" /> <span><strong className="text-foreground">Negative candidate:</strong> 10–15+ clicks with 0 orders, or obviously irrelevant.</span></li>
            <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-500 shrink-0" /> <span><strong className="text-foreground">Promote to Exact:</strong> 3+ orders with ACoS at or below target.</span></li>
            <li className="flex items-start gap-1.5"><TrendingUp className="h-3 w-3 mt-0.5 text-blue-500 shrink-0" /> <span><strong className="text-foreground">Increase bid +10–20%:</strong> ACoS much lower than target — push for more volume.</span></li>
            <li className="flex items-start gap-1.5"><TrendingDown className="h-3 w-3 mt-0.5 text-orange-500 shrink-0" /> <span><strong className="text-foreground">Decrease bid -10–20%:</strong> ACoS above target with 10+ clicks of data.</span></li>
            <li className="flex items-start gap-1.5"><Pause className="h-3 w-3 mt-0.5 text-rose-500 shrink-0" /> <span><strong className="text-foreground">Pause / negate:</strong> 10+ clicks with 0 orders — strongly consider stopping the bleed.</span></li>
          </ul>
        </div>

        <KeywordDeepDive
          row={deepDiveRow}
          targetAcos={target}
          onClose={() => setDeepDiveRow(null)}
        />
      </CardContent>
    </Card>
  );
}
