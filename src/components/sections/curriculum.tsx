"use client";

import { useState, type ReactElement } from "react";
import { clsx } from "clsx";
import { useAppStore } from "@/lib/store";
import { phases } from "@/lib/course-data";
import { BrandButton } from "@/components/shared/buttons";
import { CourseView, getPhaseColors, findActiveModule } from "@/components/sections/course-view";
import {
  BookOpen, CheckCircle as CheckCircle2, CaretDown as ChevronDown, Clock, Download, GraduationCap, Lock, Pen as PenLine, Play, PlayCircle, MagnifyingGlass as Search, ShieldCheck } from "@phosphor-icons/react";
import styles from "./curriculum.module.css";

type FilterTab = "all" | "foundation" | "advanced";

export function CurriculumSection() {
  const activeModuleId = useAppStore((s) => s.activeModuleId);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const setSection = useAppStore((s) => s.setSection);
  const user = useAppStore((s) => s.user);

  const isTrial = !user || user.role === "guest";
  const activeModule = findActiveModule(activeModuleId);

  const phasePassMap: Record<number, boolean> = {
    1: user?.phase1Pass ?? false,
    2: user?.phase2Pass ?? false,
    3: user?.phase3Pass ?? false,
    4: user?.phase4Pass ?? false,
  };

  function isPhaseUnlocked(phaseNum: number): boolean {
    if (phaseNum === 1) return true;
    return phasePassMap[phaseNum - 1] === true;
  }

  if (activeModule) {
    return <CourseView isTrial={isTrial} />;
  }

  return <CoursesListView isTrial={isTrial} phasePassMap={phasePassMap} isPhaseUnlocked={isPhaseUnlocked} setActiveModule={setActiveModule} />;
}

function CoursesListView({
  isTrial,
  phasePassMap,
  isPhaseUnlocked,
  setActiveModule,
}: {
  isTrial: boolean;
  phasePassMap: Record<number, boolean>;
  isPhaseUnlocked: (n: number) => boolean;
  setActiveModule: (moduleId: string, phaseId: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const courseCards = phases.map((phase) => {
    const unlocked = isPhaseUnlocked(phase.number);
    const passed = phasePassMap[phase.number] ?? false;
    const totalLessons = phase.modules.length;
    const totalExercises = phase.modules.reduce((sum, m) => sum + (m.exercises?.length ?? 0), 0);

    let status: "in_progress" | "locked" | "completed";
    if (passed) { status = "completed"; }
    else if (!unlocked) { status = "locked"; }
    else { status = "in_progress"; }

    let progressPct = 0;
    if (passed) { progressPct = 100; }
    else if (unlocked) { progressPct = 10; }

    const category: "foundation" | "advanced" = phase.number <= 2 ? "foundation" : "advanced";
    const phaseColors = getPhaseColors(phase.number);

    return {
      phase,
      status,
      progressPct,
      totalLessons,
      totalExercises,
      category,
      phaseColors,
    };
  });

  const filteredCards = courseCards.filter((c) => {
    if (activeFilter === "foundation") return c.category === "foundation";
    if (activeFilter === "advanced") return c.category === "advanced";
    return true;
  });

  const searchedCards = filteredCards.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.phase.title.toLowerCase().includes(q) ||
      c.phase.subtitle?.toLowerCase().includes(q) ||
      c.phase.modules.some((m) => m.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className={styles.section}>
      <div className={styles.toolbar}>
        <div className={styles.filterRow}>
          {(["all", "foundation", "advanced"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveFilter(tab)}
              className={clsx(styles.filterBtn, activeFilter === tab && styles.filterBtnActive)}>
              {tab === "all" ? "All Phases" : tab === "foundation" ? "Foundation" : "Advanced"}
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--muted-foreground)" }} />
          <input
            type="text" placeholder="Search modules..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {(isTrial) && (
        <div className={styles.infoBanner}>
          <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5"
            style={{ color: "var(--primary)" }} />
          <p>You&apos;re viewing the sampler. <strong>Phase 1 and the PPC Sampler are free.</strong> Full access unlocks when you enroll.</p>
        </div>
      )}

      {searchedCards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--muted-foreground)" }}>
          <p style={{ fontSize: "14px", fontWeight: 500 }}>No phases match your search.</p>
        </div>
      ) : (
        searchedCards.map((card) => {
          const phaseColors = card.phaseColors;
          const statusIcons: Record<string, ReactElement> = {
            completed: <CheckCircle2 className={clsx("h-5 w-5", styles.checkIcon)} />,
            locked: <Lock className={clsx("h-5 w-5", styles.lockedIcon)} />,
            in_progress: <Play className={clsx("h-5 w-5", styles.playIcon)} />,
          };

          return (
            <div key={card.phase.id} className={clsx(styles.phaseCard, card.status === "locked" && styles.phaseCardLocked)}>
              <div className={styles.phaseHeader}>
                <div className={styles.phaseTop}>
                  <div className={clsx(styles.phaseIconBox)} style={{ background: phaseColors.accent }}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 className={styles.phaseTitle}>{card.phase.title}</h2>
                    <p className={styles.phaseSubtitle}>{card.phase.subtitle}</p>
                  </div>
                  {statusIcons[card.status]}
                </div>
                <div className={styles.phaseMeta}>
                  <span className={styles.phaseMetaItem}>
                    <GraduationCap className="h-3.5 w-3.5" /> {card.totalLessons} modules
                  </span>
                  <span className={styles.phaseMetaItem}>
                    <PenLine className="h-3.5 w-3.5" /> {card.totalExercises} exercises
                  </span>
                  <span className={styles.phaseMetaItem}>
                    <Clock className="h-3.5 w-3.5" /> {card.phase.duration}
                  </span>
                </div>
              </div>

              <div className={styles.phaseBody}>
                {card.status !== "locked" && (
                  <div className={styles.progressRow}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${card.progressPct}%`, background: phaseColors.accent }} />
                    </div>
                    <span className={styles.progressLabel}>
                      {card.progressPct > 0 ? `${card.progressPct}%` : "Not started"}
                    </span>
                  </div>
                )}

                <div className={styles.moduleList}>
                  {card.phase.modules.map((mod) => {
                    const mColor = getPhaseColors(card.phase.number);
                    const isModuleLocked = card.status === "locked";

                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          if (!isModuleLocked) {
                            setActiveModule(mod.id, card.phase.id);
                          }
                        }}
                        className={clsx(styles.moduleItem, !isModuleLocked && styles.moduleItemActive)}
                        disabled={isModuleLocked}
                        style={isModuleLocked ? { cursor: "not-allowed" } : undefined}
                      >
                        <div className={styles.moduleIconBox} style={{ background: mColor.accent }}>
                          {mod.code}
                        </div>
                        <div className={styles.moduleInfo}>
                          <div className={styles.moduleName}>{mod.title}</div>
                          <div className={styles.moduleDesc}>{mod.content.length > 0 ? `${mod.content.length} sections` : "Start learning"}</div>
                        </div>
                        {isModuleLocked ? (
                          <Lock className={clsx("h-4 w-4", styles.lockedIcon)} />
                        ) : (
                          <PlayCircle className="h-4 w-4" style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}

      <p className={styles.sortInfo}>Phases 1-2 Foundation · Phases 3-4 Advanced</p>
    </div>
  );
}
