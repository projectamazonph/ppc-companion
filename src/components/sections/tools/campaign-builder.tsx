"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Stack as Layers,
  Plus,
  Trash as Trash2,
  Compass,
  ArrowsOut as Expand,
  Star,
  Shield,
  Copy,
  Check,
  Lightbulb,
  DotsSixVertical as Grip,
} from "@phosphor-icons/react";

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

const LAYER_META: Record<Layer, { label: string; budgetPct: number; description: string; color: string; icon: typeof Compass; solid: string }> = {
  discovery: {
    label: "Discovery",
    budgetPct: 30,
    description: "Auto + Broad. Find new converting search terms.",
    color: "border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20",
    icon: Compass,
    solid: "bg-blue-600",
  },
  expansion: {
    label: "Expansion",
    budgetPct: 20,
    description: "Phrase. Scale promising terms with more control.",
    color: "border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20",
    icon: Expand,
    solid: "bg-rose-500",
  },
  heroes: {
    label: "Heroes",
    budgetPct: 40,
    description: "Exact. Maximize profit on best keywords.",
    color: "border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20",
    icon: Star,
    solid: "bg-emerald-600",
  },
  defense: {
    label: "Defense & Conquest",
    budgetPct: 10,
    description: "ASIN + SD. Defend your listings, attack competitors.",
    color: "border-violet-300 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20",
    icon: Shield,
    solid: "bg-violet-600",
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
const MATCH_TYPES = ["Auto", "Broad", "Phrase", "Exact", "ASIN Targeting", "Placement"];

type CampaignCardProps = {
  campaign: Campaign;
  onUpdate: (id: string, field: keyof Campaign, value: string) => void;
  onAutoName: (c: Campaign) => void;
  onDelete: (id: string) => void;
};

function CampaignCard({ campaign, onUpdate, onAutoName, onDelete }: CampaignCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: campaign.id });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-border/60 bg-card p-3 space-y-2",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label={`Drag ${campaign.name || "campaign"} to another layer`}
          {...attributes}
          {...listeners}
        >
          <Grip className="h-4 w-4" />
        </button>
        <Input
          value={campaign.name}
          onChange={(e) => onUpdate(campaign.id, "name", e.target.value)}
          className="font-mono text-xs h-8"
          placeholder="Campaign name"
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0 text-muted-foreground"
          onClick={() => onAutoName(campaign)}
          title="Auto-generate name using [Product] – [Ad Type] – [Match Type] – [Purpose]"
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-rose-500"
          onClick={() => onDelete(campaign.id)}
          aria-label={`Delete ${campaign.name || "campaign"}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        <div>
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Ad Type</Label>
          <select
            value={campaign.adType}
            onChange={(e) => onUpdate(campaign.id, "adType", e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
          >
            {AD_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Match Type</Label>
          <select
            value={campaign.matchType}
            onChange={(e) => onUpdate(campaign.id, "matchType", e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
          >
            {MATCH_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Daily Budget ($)</Label>
          <Input
            value={campaign.budget}
            onChange={(e) => onUpdate(campaign.id, "budget", e.target.value)}
            className="h-8 font-mono text-xs"
            inputMode="decimal"
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Goal</Label>
          <Input
            value={campaign.goal}
            onChange={(e) => onUpdate(campaign.id, "goal", e.target.value)}
            className="h-8 text-xs"
            placeholder="e.g. Maximize profit"
          />
        </div>
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Example Keywords / Targets</Label>
        <Input
          value={campaign.exampleKeywords}
          onChange={(e) => onUpdate(campaign.id, "exampleKeywords", e.target.value)}
          className="h-8 text-xs"
          placeholder="e.g. insulated water bottle 32oz, B08XXX"
        />
      </div>
    </div>
  );
}

type LayerSectionProps = {
  layer: Layer;
  campaigns: Campaign[];
  onAdd: (layer: Layer) => void;
  onUpdate: (id: string, field: keyof Campaign, value: string) => void;
  onAutoName: (c: Campaign) => void;
  onDelete: (id: string) => void;
};

function LayerSection({ layer, campaigns, onAdd, onUpdate, onAutoName, onDelete }: LayerSectionProps) {
  const meta = LAYER_META[layer];
  const { setNodeRef, isOver } = useDroppable({ id: layer });
  const Icon = meta.icon;

  return (
    <div
      ref={setNodeRef}
      data-testid={`layer-${layer}`}
      className={cn(
        "rounded-xl border-2 p-4 transition-colors",
        meta.color,
        isOver && "ring-2 ring-[#FF6B35] bg-[#FF6B35]/5"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-white", meta.solid)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">{meta.label}</p>
            <p className="text-xs text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            Target: {meta.budgetPct}% · {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
          </Badge>
          <Button size="sm" variant="outline" onClick={() => onAdd(layer)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2 text-center">
          {isOver ? "Drop here to add to this layer" : "No campaigns yet — click \"Add\" to create one."}
        </p>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onUpdate={onUpdate}
              onAutoName={onAutoName}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CampaignBuilder() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(PRESET_CAMPAIGNS);
  const [product, setProduct] = useState("WaterBottle");
  const [totalBudget, setTotalBudget] = useState("150");
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  const totalBudgetNum = parseFloat(totalBudget.replace(/[$,\s]/g, "")) || 0;
  const allocatedBudget = campaigns.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

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

  // Auto-generate name based on naming convention
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

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const targetLayer = over.id as Layer;
    const camp = campaigns.find((c) => c.id === String(active.id));
    if (camp && camp.layer !== targetLayer) {
      updateCampaign(camp.id, "layer", targetLayer);
      toast({ title: `Moved to ${LAYER_META[targetLayer].label}` });
    }
  };

  const activeCampaign = activeId ? campaigns.find((c) => c.id === activeId) ?? null : null;

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B35] text-white shadow-sm">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Campaign Structure Builder</CardTitle>
            <CardDescription>
              Design your four-layer structure: Discovery → Expansion → Heroes → Defense. Drag campaigns between layers.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Product + budget header */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="product" className="text-xs font-medium">Product name</Label>
            <Input id="product" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="WaterBottle" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget" className="text-xs font-medium">Total daily budget ($)</Label>
            <Input id="budget" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} className="font-mono" inputMode="decimal" />
          </div>
        </div>

        {/* Budget allocation bar */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Budget allocation by layer</p>
            <p className="text-xs tabular-nums">
              <span className="font-semibold">${allocatedBudget.toFixed(0)}</span>
              <span className="text-muted-foreground"> / ${totalBudgetNum.toFixed(0)} allocated</span>
            </p>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-muted">
            {(Object.keys(LAYER_META) as Layer[]).map((layer) => {
              const total = campaigns.filter((c) => c.layer === layer).reduce((s, c) => s + (parseFloat(c.budget) || 0), 0);
              const pct = totalBudgetNum > 0 ? (total / totalBudgetNum) * 100 : 0;
              return (
                <div
                  key={layer}
                  className={cn("h-full", LAYER_META[layer].solid)}
                  style={{ width: `${pct}%` }}
                  title={`${LAYER_META[layer].label}: $${total.toFixed(0)} (${pct.toFixed(0)}%)`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
            {(Object.keys(LAYER_META) as Layer[]).map((layer) => {
              const total = campaigns.filter((c) => c.layer === layer).reduce((s, c) => s + (parseFloat(c.budget) || 0), 0);
              const pct = totalBudgetNum > 0 ? (total / totalBudgetNum) * 100 : 0;
              const target = LAYER_META[layer].budgetPct;
              const Icon = LAYER_META[layer].icon;
              return (
                <div key={layer} className="flex items-center gap-1.5">
                  <Icon className={cn("h-3 w-3 text-white rounded-sm p-0.5 box-content", LAYER_META[layer].solid)} />
                  <span className="text-muted-foreground">{LAYER_META[layer].label}</span>
                  <span className="font-semibold tabular-nums">{pct.toFixed(0)}%</span>
                  <span className="text-muted-foreground text-[10px]">(target {target}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer sections (drag & drop) */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid gap-4 lg:grid-cols-2">
            {(Object.keys(LAYER_META) as Layer[]).map((layer) => (
              <LayerSection
                key={layer}
                layer={layer}
                campaigns={campaigns.filter((c) => c.layer === layer)}
                onAdd={addCampaign}
                onUpdate={updateCampaign}
                onAutoName={autoName}
                onDelete={deleteCampaign}
              />
            ))}
          </div>
          <DragOverlay>
            {activeCampaign ? (
              <div className="rounded-lg border-2 border-[#FF6B35] bg-card p-3 shadow-lg">
                <p className="text-xs font-mono truncate">{activeCampaign.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Dragging…</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Export */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportBlueprint} variant="default" className="bg-[#FF6B35] hover:brightness-105">
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy blueprint to clipboard
          </Button>
        </div>

        {/* Naming convention tip */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/10 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2">
            <Lightbulb className="h-3.5 w-3.5" />
            Naming convention
          </p>
          <p className="font-mono text-xs bg-card border border-border/60 rounded p-2 inline-block">
            [Product] – [Ad Type] – [Match Type/Targeting] – [Purpose]
          </p>
          <p className="text-[11px] text-muted-foreground mt-2">
            Examples: <span className="font-mono">WaterBottle – SP – Auto – Discovery</span> · <span className="font-mono">WaterBottle – SP – Exact – Heroes</span> · <span className="font-mono">WaterBottle – SB – Video – Brand</span> · <span className="font-mono">WaterBottle – SD – ASIN – Conquest</span>
          </p>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-2">
            Click the ✓ next to a campaign name to auto-generate it from this format. Drag the grip handle (⋮⋮) to move a campaign between layers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
