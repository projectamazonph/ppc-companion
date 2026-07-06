"use client";

import { useMemo, useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { phases, type Exercise } from "@/lib/course-data";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BrandButton } from "@/components/shared/buttons";
import {
  PenLine,
  CheckCircle2,
  XCircle,
  Calculator,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Target,
  HelpCircle,
  ChevronRight,
  Trophy,
  Circle,
  Check,
  Lightbulb,
} from "lucide-react";

// ─── Phase color maps ────────────────────────────────────────────────────────

const phaseGradients: Record<number, string> = {
  1: "from-violet-500 to-purple-600",
  2: "from-blue-500 to-cyan-600",
  3: "from-amber-500 to-orange-600",
  4: "from-emerald-500 to-teal-600",
};

const phaseAccentText: Record<number, string> = {
  1: "text-violet-600 dark:text-violet-400",
  2: "text-blue-600 dark:text-blue-400",
  3: "text-amber-600 dark:text-amber-400",
  4: "text-emerald-600 dark:text-emerald-400",
};

const phaseAccentBg: Record<number, string> = {
  1: "bg-violet-500/10 dark:bg-violet-500/15",
  2: "bg-blue-500/10 dark:bg-blue-500/15",
  3: "bg-amber-500/10 dark:bg-amber-500/15",
  4: "bg-emerald-500/10 dark:bg-emerald-500/15",
};

const phaseBorder: Record<number, string> = {
  1: "border-violet-200 dark:border-violet-800",
  2: "border-blue-200 dark:border-blue-800",
  3: "border-amber-200 dark:border-amber-800",
  4: "border-emerald-200 dark:border-emerald-800",
};

const phaseRing: Record<number, string> = {
  1: "ring-violet-500/30",
  2: "ring-blue-500/30",
  3: "ring-amber-500/30",
  4: "ring-emerald-500/30",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTypeIcon(type: Exercise["type"]) {
  switch (type) {
    case "open":
      return PenLine;
    case "calculation":
      return Calculator;
    case "decision":
      return Target;
    default:
      return HelpCircle;
  }
}

function getTypeLabel(type: Exercise["type"]) {
  switch (type) {
    case "open":
      return "Open Response";
    case "calculation":
      return "Calculation";
    case "decision":
      return "Decision";
    default:
      return type;
  }
}

// ─── Main Section ────────────────────────────────────────────────────────────

export function ExercisesSection() {
  const allExercises = useMemo(() => {
    const list: {
      phase: (typeof phases)[number];
      module: (typeof phases)[number]["modules"][number];
      exercise: Exercise;
    }[] = [];
    for (const p of phases) {
      for (const m of p.modules) {
        if (m.exercises) {
          for (const e of m.exercises) {
            list.push({ phase: p, module: m, exercise: e });
          }
        }
      }
    }
    return list;
  }, []);

  const [activeId, setActiveId] = useState<string>(allExercises[0]?.exercise.id ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = allExercises.find((e) => e.exercise.id === activeId) ?? allExercises[0];

  // Group exercises by phase for the sidebar
  const exercisesByPhase = useMemo(() => {
    const map = new Map<number, typeof allExercises>();
    for (const item of allExercises) {
      const num = item.phase.number;
      if (!map.has(num)) map.set(num, []);
      map.get(num)!.push(item);
    }
    return map;
  }, [allExercises]);

  // Compute overall progress
  const progress = useAppStore((s) => {
    let total = 0;
    let answered = 0;
    for (const item of allExercises) {
      total++;
      const ex = item.exercise;
      if (ex.type === "open") {
        const ans = s.exerciseAnswers[ex.id];
        if (ans && ans.trim().length > 0) answered++;
      } else if (ex.type === "decision" && ex.decisions) {
        if (ex.decisions.every((d) => s.decisionSelections[d.id])) answered++;
      } else if (ex.type === "calculation" && ex.questions) {
        if (ex.questions.every((q) => s.calculationAnswers[q.id])) answered++;
      }
    }
    return { total, answered };
  });

  const progressPct = progress.total > 0 ? Math.round((progress.answered / progress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Exercises</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {allExercises.length} exercises across {phases.length} phases. Your answers save automatically.
          </p>
        </div>
        {/* Progress ring */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
          <div className="relative h-11 w-11">
            <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-border"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(progressPct / 100) * 113.1} 113.1`}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {progressPct}%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold">{progress.answered}/{progress.total} completed</p>
            <p className="text-xs text-muted-foreground">
              {progressPct === 100 ? "All done! 🎉" : `${progress.total - progress.answered} remaining`}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile exercise picker toggle */}
      <div className="lg:hidden">
        <BrandButton
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="flex items-center gap-2">
            {current && (
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br text-[10px] font-bold text-white", phaseGradients[current.phase.number])}>
                {current.exercise.id.split(".")[0]}
              </span>
            )}
            <span className="truncate text-left">{current?.exercise.title ?? "Select exercise"}</span>
          </span>
          <ChevronRight className={cn("h-4 w-4 transition-transform", sidebarOpen && "rotate-90")} />
        </BrandButton>
      </div>

      {/* Main layout: sidebar + exercise view */}
      <div className="flex gap-6 items-start">
        {/* Sidebar — exercise selector */}
        <aside
          className={cn(
            "shrink-0 w-full lg:w-72 xl:w-80 space-y-5",
            sidebarOpen ? "block" : "hidden lg:block"
          )}
        >
          {Array.from(exercisesByPhase.entries()).map(([phaseNum, items]) => (
            <div key={phaseNum} className="space-y-2">
              <PhaseHeader phaseNum={phaseNum} items={items} />
              <div className="space-y-1.5">
                {items.map(({ phase, exercise }) => (
                  <ExerciseChip
                    key={exercise.id}
                    exercise={exercise}
                    phaseNumber={phase.number}
                    active={activeId === exercise.id}
                    onClick={() => {
                      setActiveId(exercise.id);
                      setSidebarOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Active exercise view */}
        <div className="flex-1 min-w-0">
          {current && (
            <ExerciseView
              key={current.exercise.id}
              exercise={current.exercise}
              phaseTitle={`Phase ${current.phase.number}: ${current.phase.title}`}
              moduleTitle={`Module ${current.module.code} · ${current.module.title}`}
              phaseNumber={current.phase.number}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Exercise Chip (sidebar item) ────────────────────────────────────────────

function ExerciseChip({
  exercise,
  phaseNumber,
  active,
  onClick,
}: {
  exercise: Exercise;
  phaseNumber: number;
  active: boolean;
  onClick: () => void;
}) {
  const answer = useAppStore((s) => s.exerciseAnswers[exercise.id]);
  const decisionSelections = useAppStore((s) => s.decisionSelections);
  const calculationAnswers = useAppStore((s) => s.calculationAnswers);

  let answered = false;
  if (exercise.type === "open") {
    answered = !!answer && answer.trim().length > 0;
  } else if (exercise.type === "decision" && exercise.decisions) {
    answered = exercise.decisions.every((d) => decisionSelections[d.id]);
  } else if (exercise.type === "calculation" && exercise.questions) {
    answered = exercise.questions.every((q) => calculationAnswers[q.id]);
  }

  const TypeIcon = getTypeIcon(exercise.type);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
        active
          ? cn("border-transparent bg-gradient-to-r shadow-md ring-2", phaseGradients[phaseNumber].replace("from-", "from-").replace(" to-", ""), phaseRing[phaseNumber], "bg-white dark:bg-card shadow-black/5")
          : "border-transparent bg-card/50 hover:bg-card hover:shadow-sm"
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
          answered
            ? cn("bg-gradient-to-br text-white shadow-sm", phaseGradients[phaseNumber])
            : "bg-muted/60 text-muted-foreground"
        )}
      >
        {answered ? (
          <Check className="h-4 w-4" strokeWidth={3} />
        ) : (
          <Circle className="h-3.5 w-3.5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[11px] font-bold tabular-nums", active ? phaseAccentText[phaseNumber] : "text-muted-foreground")}>
            {exercise.id}
          </span>
          <TypeIcon className={cn("h-3 w-3", active ? phaseAccentText[phaseNumber] : "text-muted-foreground/60")} />
        </div>
        <p className={cn(
          "text-xs truncate mt-0.5 transition-colors",
          active ? "font-medium text-foreground" : "text-muted-foreground"
        )}>
          {exercise.title}
        </p>
      </div>

      {/* Active arrow */}
      {active && (
        <ChevronRight className={cn("h-4 w-4 shrink-0", phaseAccentText[phaseNumber])} />
      )}
    </button>
  );
}

// ─── Phase Header (sidebar group heading) ────────────────────────────────────

function PhaseHeader({
  phaseNum,
  items,
}: {
  phaseNum: number;
  items: {
    phase: (typeof phases)[number];
    module: (typeof phases)[number]["modules"][number];
    exercise: Exercise;
  }[];
}) {
  const exerciseAnswers = useAppStore((s) => s.exerciseAnswers);
  const decisionSelections = useAppStore((s) => s.decisionSelections);
  const calculationAnswers = useAppStore((s) => s.calculationAnswers);

  const done = items.filter((it) => {
    const ex = it.exercise;
    if (ex.type === "open") {
      const ans = exerciseAnswers[ex.id];
      return ans && ans.trim().length > 0;
    } else if (ex.type === "decision" && ex.decisions) {
      return ex.decisions.every((d) => decisionSelections[d.id]);
    } else if (ex.type === "calculation" && ex.questions) {
      return ex.questions.every((q) => calculationAnswers[q.id]);
    }
    return false;
  }).length;

  return (
    <div className="flex items-center gap-2 px-1">
      <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white shadow-sm", phaseGradients[phaseNum])}>
        {phaseNum}
      </span>
      <span className={cn("text-xs font-semibold uppercase tracking-wider", phaseAccentText[phaseNum])}>
        Phase {phaseNum}
      </span>
      <span className="ml-auto text-[10px] font-medium text-muted-foreground">
        {done}/{items.length}
      </span>
    </div>
  );
}

// ─── Exercise View (main workspace) ──────────────────────────────────────────

function ExerciseView({
  exercise,
  phaseTitle,
  moduleTitle,
  phaseNumber,
}: {
  exercise: Exercise;
  phaseTitle: string;
  moduleTitle: string;
  phaseNumber: number;
}) {
  const TypeIcon = getTypeIcon(exercise.type);

  return (
    <div className="space-y-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {/* Header */}
      <div className={cn("border-b border-border/60 px-6 py-5", phaseAccentBg[phaseNumber])}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={cn("inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r px-2.5 py-1 text-xs font-bold text-white shadow-sm", phaseGradients[phaseNumber])}>
            {exercise.id}
          </span>
          <Badge variant="outline" className="text-[10px] font-medium border-border/50">
            {phaseTitle}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-medium border-border/50">
            {moduleTitle}
          </Badge>
        </div>

        <div className="flex items-start gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md", phaseGradients[phaseNumber])}>
            <TypeIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{exercise.title}</h2>
            <span className={cn("inline-flex items-center gap-1 mt-1 text-xs font-medium", phaseAccentText[phaseNumber])}>
              <BookOpen className="h-3 w-3" />
              {getTypeLabel(exercise.type)}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground/80">
          {exercise.prompt}
        </p>
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        {exercise.type === "open" && <OpenExercise exercise={exercise} phaseNumber={phaseNumber} />}
        {exercise.type === "calculation" && <CalculationExercise exercise={exercise} phaseNumber={phaseNumber} />}
        {exercise.type === "decision" && <DecisionExercise exercise={exercise} phaseNumber={phaseNumber} />}
      </div>
    </div>
  );
}

// ─── Open-ended Exercise ─────────────────────────────────────────────────────

function OpenExercise({ exercise, phaseNumber }: { exercise: Exercise; phaseNumber: number }) {
  const answer = useAppStore((s) => s.exerciseAnswers[exercise.id] ?? "");
  const setAnswer = useAppStore((s) => s.setExerciseAnswer);
  const { toast } = useToast();
  const [showModel, setShowModel] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const save = () => {
    setAnswer(exercise.id, answer);
    setJustSaved(true);
    toast({
      title: "Answer saved",
      description: `Exercise ${exercise.id} saved locally.`,
    });
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Editor area */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <PenLine className={cn("h-4 w-4", phaseAccentText[phaseNumber])} />
          <Label className="text-sm font-semibold">Your Answer</Label>
        </div>
        <div className={cn("rounded-xl border-2 transition-colors duration-200 focus-within:ring-2", phaseBorder[phaseNumber], phaseRing[phaseNumber])}>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(exercise.id, e.target.value)}
            placeholder={exercise.placeholder ?? "Type your answer here…"}
            className="min-h-[200px] resize-y border-0 bg-transparent text-sm leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4"
          />
          <div className="flex items-center justify-between border-t border-border/40 px-4 py-2">
            <span className="text-[11px] text-muted-foreground tabular-nums">{answer.length} characters</span>
            <BrandButton
              onClick={save}
              size="sm"
              variant={justSaved ? "success" : "default"}
              className="transition-all duration-300"
            >
              {justSaved ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Answer
                </>
              )}
            </BrandButton>
          </div>
        </div>
      </div>

      {/* Model answer toggle */}
      {exercise.modelAnswer && (
        <div>
          <BrandButton
            onClick={() => setShowModel(!showModel)}
            variant="outline"
            size="sm"
          >
            {showModel ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showModel ? "Hide Model Answer" : "Reveal Model Answer"}
          </BrandButton>

          <div
            className={cn(
              "overflow-hidden transition-all duration-500 ease-in-out",
              showModel ? "mt-4 max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className={cn("rounded-xl border-2 p-5 space-y-3", phaseBorder[phaseNumber], phaseAccentBg[phaseNumber])}>
              <div className="flex items-center gap-2">
                <div className={cn("flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br text-white", phaseGradients[phaseNumber])}>
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Model Answer — for self-checking
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {exercise.modelAnswer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Calculation Exercise ────────────────────────────────────────────────────

function CalculationExercise({ exercise, phaseNumber }: { exercise: Exercise; phaseNumber: number }) {
  if (!exercise.questions) return null;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span>Type your answer in each box. Click <strong>Reveal</strong> to check the formula and correct answer.</span>
      </div>
      {exercise.questions.map((q, i) => (
        <CalcQuestion key={q.id} question={q} index={i + 1} phaseNumber={phaseNumber} />
      ))}
    </div>
  );
}

function CalcQuestion({
  question,
  index,
  phaseNumber,
}: {
  question: NonNullable<Exercise["questions"]>[number];
  index: number;
  phaseNumber: number;
}) {
  const userAnswer = useAppStore((s) => s.calculationAnswers[question.id] ?? "");
  const setAnswer = useAppStore((s) => s.setCalculationAnswer);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shakeIncorrect, setShakeIncorrect] = useState(false);

  const normalize = (s: string) => s.toLowerCase().replace(/[^0-9.%]/g, "");
  const hasAnswer = userAnswer.trim().length > 0;
  const isCorrect = hasAnswer && normalize(userAnswer) === normalize(question.answer);

  // Trigger shake animation when user types something incorrect
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hasAnswer && !isCorrect && userAnswer.length > 0) {
      setShakeIncorrect(true);
      const t = setTimeout(() => setShakeIncorrect(false), 600);
      return () => clearTimeout(t);
    }
  }, [userAnswer, hasAnswer, isCorrect]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-5 transition-all duration-300",
        isCorrect
          ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10"
          : showAnswer
            ? "border-blue-200 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-950/10"
            : "border-border/60 bg-card",
        shakeIncorrect && "animate-[shake_0.5s_ease-in-out]"
      )}
    >
      {/* Question header */}
      <div className="flex items-start gap-3 mb-4">
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white shadow-sm", phaseGradients[phaseNumber])}>
          {index}
        </span>
        <p className="font-semibold text-sm leading-snug pt-0.5">{question.question}</p>
      </div>

      {/* Given inputs */}
      <div className="ml-10 mb-4 flex flex-wrap gap-2">
        {question.inputs.map((inp, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1.5 text-xs"
          >
            <span className="text-muted-foreground">{inp.label}:</span>
            <span className="font-bold tabular-nums">{inp.value}</span>
          </div>
        ))}
      </div>

      {/* Answer row */}
      <div className="ml-10 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Input
            value={userAnswer}
            onChange={(e) => setAnswer(question.id, e.target.value)}
            placeholder="Your answer"
            className={cn(
              "w-[200px] font-mono text-sm transition-all duration-300",
              isCorrect && "border-emerald-400 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-400/20"
            )}
          />
          {isCorrect && (
            <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-[fadeScaleIn_0.3s_ease-out]" />
          )}
        </div>

        {/* Feedback badge */}
        {hasAnswer && (
          <div className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-300",
            isCorrect
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
          )}>
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Correct!
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                Try again
              </>
            )}
          </div>
        )}

        {/* Reveal button */}
        <BrandButton
          variant="ghost"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
          className="ml-auto"
        >
          {showAnswer ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showAnswer ? "Hide" : "Reveal"}
        </BrandButton>
      </div>

      {/* Revealed answer */}
      <div
        className={cn(
          "ml-10 overflow-hidden transition-all duration-500 ease-in-out",
          showAnswer ? "mt-4 max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className={cn("rounded-xl border p-4 space-y-2", phaseBorder[phaseNumber], phaseAccentBg[phaseNumber])}>
          <div className="flex items-center gap-2">
            <Calculator className={cn("h-4 w-4", phaseAccentText[phaseNumber])} />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formula</span>
          </div>
          <p className="font-mono text-sm font-semibold pl-6">{question.formula}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Answer:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{question.answer}</span>
          </div>
          {question.hint && (
            <p className="text-xs text-muted-foreground italic pt-1 pl-6 border-t border-border/40 pt-2">{question.hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Decision Exercise ───────────────────────────────────────────────────────

function DecisionExercise({ exercise, phaseNumber }: { exercise: Exercise; phaseNumber: number }) {
  const decisionSelections = useAppStore((s) => s.decisionSelections);
  if (!exercise.decisions) return null;
  const allAnswered = exercise.decisions.every((d) => decisionSelections[d.id]);
  const correctCount = exercise.decisions.filter((d) => {
    const sel = decisionSelections[d.id];
    const opt = d.options.find((o) => o.id === sel);
    return opt?.correct;
  }).length;
  const perfectScore = allAnswered && correctCount === exercise.decisions.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Target className={cn("h-4 w-4", phaseAccentText[phaseNumber])} />
        <span>Pick the best action for each scenario. Selecting an option reveals the explanation.</span>
      </div>

      {exercise.decisions.map((d, i) => (
        <DecisionCard key={d.id} decision={d} index={i + 1} phaseNumber={phaseNumber} />
      ))}

      {/* Score summary */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          allAnswered ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div
          className={cn(
            "rounded-xl border-2 p-5 flex items-center gap-4",
            perfectScore
              ? "border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10"
              : "border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10"
          )}
        >
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md",
            perfectScore
              ? "bg-gradient-to-br from-emerald-500 to-teal-600"
              : "bg-gradient-to-br from-blue-500 to-indigo-600"
          )}>
            {perfectScore ? (
              <Trophy className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">
              {perfectScore ? "Perfect Score!" : "All Decisions Made"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              You got{" "}
              <span className={cn("font-bold", perfectScore ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400")}>
                {correctCount}
              </span>{" "}
              of{" "}
              <span className="font-bold">{exercise.decisions.length}</span>{" "}
              right.
              {perfectScore
                ? " You're thinking like a PPC manager! 🎯"
                : " Review the explanations above and try to internalize the rules."}
            </p>
          </div>
          {/* Mini score bar */}
          <div className="hidden sm:flex items-center gap-1">
            {exercise.decisions.map((d, i) => {
              const sel = decisionSelections[d.id];
              const opt = d.options.find((o) => o.id === sel);
              const correct = opt?.correct;
              return (
                <div
                  key={i}
                  className={cn(
                    "h-2 w-6 rounded-full transition-all duration-500",
                    correct
                      ? "bg-emerald-500"
                      : "bg-rose-400"
                  )}
                  style={{ transitionDelay: `${i * 100}ms` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DecisionCard({
  decision,
  index,
  phaseNumber,
}: {
  decision: NonNullable<Exercise["decisions"]>[number];
  index: number;
  phaseNumber: number;
}) {
  const selected = useAppStore((s) => s.decisionSelections[decision.id]);
  const setSelected = useAppStore((s) => s.setDecisionSelection);
  const selectedOption = decision.options.find((o) => o.id === selected);
  const isCorrect = selectedOption?.correct;
  const hasSelection = !!selected;

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-5 transition-all duration-300",
        hasSelection && isCorrect
          ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10"
          : hasSelection && !isCorrect
            ? "border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/10"
            : "border-border/60 bg-card"
      )}
    >
      {/* Scenario header */}
      <div className="flex items-start gap-3 mb-4">
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white shadow-sm", phaseGradients[phaseNumber])}>
          {index}
        </span>
        <p className="font-semibold text-sm leading-snug pt-0.5">{decision.scenario}</p>
      </div>

      {/* Options */}
      <div className="ml-10 space-y-2">
        <RadioGroup
          value={selected ?? ""}
          onValueChange={(v) => setSelected(decision.id, v)}
        >
          {decision.options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <Label
                key={opt.id}
                htmlFor={`${decision.id}-${opt.id}`}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-all duration-200",
                  isSelected
                    ? opt.correct
                      ? "border-emerald-400 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-sm"
                      : "border-rose-400 dark:border-rose-700 bg-rose-50/60 dark:bg-rose-950/20 shadow-sm"
                    : "border-border/50 hover:border-border hover:bg-muted/30"
                )}
              >
                <RadioGroupItem
                  value={opt.id}
                  id={`${decision.id}-${opt.id}`}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{opt.label}</span>
                    {isSelected && (
                      opt.correct ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-[fadeScaleIn_0.3s_ease-out]" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-500 animate-[fadeScaleIn_0.3s_ease-out]" />
                      )
                    )}
                  </div>
                  {isSelected && opt.explanation && (
                    <div className={cn(
                      "mt-2.5 rounded-lg border-l-3 pl-3 py-1.5 text-xs leading-relaxed animate-[fadeSlideIn_0.3s_ease-out]",
                      opt.correct
                        ? "border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-200"
                        : "border-rose-400 bg-rose-50/40 dark:bg-rose-950/10 text-rose-800 dark:text-rose-200"
                    )}>
                      {opt.explanation}
                    </div>
                  )}
                </div>
              </Label>
            );
          })}
        </RadioGroup>

        {/* Result badge */}
        {hasSelection && (
          <div className="pt-1 animate-[fadeSlideIn_0.3s_ease-out]">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
                isCorrect
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
              )}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Correct decision
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  Not the best choice
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
