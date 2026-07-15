"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { phases, type Quiz } from "@/lib/course-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  Target,
  FileText,
  BarChart3,
  Eye,
  EyeOff,
  Sparkles,
  CircleCheck,
  CircleX,
  CircleDot,
  Flag,
  ChevronDown,
  Home,
  BookOpen,
  Users,
  User,
  MonitorDot,
  Bell,
} from "lucide-react";

// ---------------------------------------------------------------------------
// QuizzesSection — top-level wrapper
// ---------------------------------------------------------------------------

export function QuizzesSection() {
  const quizzes = useMemo(
    () =>
      phases
        .filter((p) => p.checkpoint)
        .map((p) => ({ phase: p, quiz: p.checkpoint! })),
    []
  );

  const [activeId, setActiveId] = useState<string>(quizzes[0]?.quiz.id ?? "");
  const quizResults = useAppStore((s) => s.quizResults);

  const current = quizzes.find((q) => q.quiz.id === activeId) ?? quizzes[0];

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page header */}
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Phase Checkpoints
          </h1>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          One checkpoint per phase. Auto-graded for MCQs and numeric answers;
          open-ended answers are self-graded against a model answer.
        </p>
      </div>

      {/* Quiz selector cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quizzes.map(({ phase, quiz }) => {
          const result = quizResults[quiz.id];
          const active = activeId === quiz.id;
          const passed = result && (result.score / result.total) * 100 >= 70;

          return (
            <button
              key={quiz.id}
              onClick={() => setActiveId(quiz.id)}
              className={cn(
                "group relative text-left rounded-2xl border p-5 transition-all duration-200",
                active
                  ? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/5 ring-1 ring-primary/30"
                  : "border-border/60 bg-card hover:border-primary/50 hover:shadow-md"
              )}
            >
              {/* Status indicator line */}
              <div
                className={cn(
                  "absolute top-0 left-6 right-6 h-0.5 rounded-full transition-colors",
                  !result
                    ? "bg-transparent"
                    : passed
                    ? "bg-emerald-400 dark:bg-emerald-600"
                    : "bg-amber-400 dark:bg-amber-600"
                )}
              />

              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                    phase.color
                  )}
                >
                  <span className="font-bold text-sm">{phase.number}</span>
                </div>

                {/* Status badge */}
                {!result ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/60 rounded-full px-2.5 py-1">
                    <CircleDot className="h-3 w-3" />
                    Not taken
                  </span>
                ) : passed ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-full px-2.5 py-1">
                    <CircleCheck className="h-3 w-3" />
                    Passed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-full px-2.5 py-1">
                    <CircleX className="h-3 w-3" />
                    Review
                  </span>
                )}
              </div>

              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-1">
                Phase {phase.number} · {phase.weeks}
              </p>
              <p className="font-semibold text-[15px] leading-snug mb-2">
                {quiz.title}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {quiz.questions.length} questions
                </span>
                {result && (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <BarChart3 className="h-3 w-3" />
                    {result.score}/{result.total}
                  </span>
                )}
              </div>

              {/* Active arrow */}
              {active && (
                <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-primary/5 dark:bg-primary/10 border-r border-b border-primary/50" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active quiz */}
      {current && (
        <QuizView
          key={current.quiz.id}
          quiz={current.quiz}
          phaseNumber={current.phase.number}
          phaseColor={current.phase.color}
          phaseTitle={current.phase.title}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// QuizView — the actual quiz interaction (mirrors stitch quiz.html)
// ---------------------------------------------------------------------------

type Question = Quiz["questions"][number];

function normalizeAnswer(s: string): string {
  return s.toLowerCase().replace(/[^0-9.%]/g, "");
}

function getAcceptable(q: Question): string[] {
  return q.acceptableAnswers ?? (q.modelAnswer ? [q.modelAnswer] : []);
}

function isQuestionCorrect(q: Question, ans: string): boolean {
  const trimmed = ans.trim();
  if (q.type === "mcq") {
    return !!q.options?.find((o) => o.id === trimmed)?.correct;
  }
  if (q.type === "numeric") {
    return getAcceptable(q).some(
      (a) => normalizeAnswer(a) === normalizeAnswer(trimmed)
    );
  }
  return false;
}

function QuizView({
  quiz,
  phaseNumber,
  phaseColor,
  phaseTitle,
}: {
  quiz: Quiz;
  phaseNumber: number;
  phaseColor: string;
  phaseTitle: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [revealOpen, setRevealOpen] = useState<Record<string, boolean>>({});
  const quizResults = useAppStore((s) => s.quizResults);
  const setQuizResult = useAppStore((s) => s.setQuizResult);
  const { toast } = useToast();
  const priorResult = quizResults[quiz.id];

  const setAnswer = (qid: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const answeredCount = quiz.questions.filter(
    (q) => (answers[q.id] ?? "").trim().length > 0
  ).length;
  const allAnswered = answeredCount === quiz.questions.length;
  const progressPercent = Math.round(
    (answeredCount / quiz.questions.length) * 100
  );

  const grade = () => {
    if (!allAnswered) {
      toast({
        title: "Answer all questions",
        description: "Please answer every question before submitting.",
        variant: "destructive",
      });
      return;
    }
    let correct = 0;
    for (const q of quiz.questions) {
      const userAns = (answers[q.id] ?? "").trim();
      if (q.type === "mcq") {
        const opt = q.options?.find((o) => o.id === userAns);
        if (opt?.correct) correct++;
      } else if (q.type === "numeric") {
        const acceptable = getAcceptable(q);
        if (acceptable.some((a) => normalizeAnswer(a) === normalizeAnswer(userAns)))
          correct++;
      }
      // open-ended: not auto-graded
    }
    setSubmitted(true);
    const result = {
      quizId: quiz.id,
      score: correct,
      total: quiz.questions.length,
      answers,
      completedAt: Date.now(),
    };
    setQuizResult(result);
    toast({
      title: "Quiz submitted",
      description: `You scored ${correct}/${quiz.questions.length} on ${quiz.title}.`,
    });
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setAnswers({});
    setCurrent(0);
    setSubmitted(false);
    setRevealOpen({});
  };

  const report = () => {
    toast({
      title: "Question reported",
      description: "Thanks — our team will review this question shortly.",
    });
  };

  const autoGradable = quiz.questions.filter((q) => q.type !== "open").length;
  const openEnded = quiz.questions.filter((q) => q.type === "open").length;
  const scorePercent = priorResult
    ? Math.round((priorResult.score / quiz.questions.length) * 100)
    : 0;

  const q = quiz.questions[current];
  const ans = (answers[q.id] ?? "").trim();
  const answered = ans.length > 0;
  const isLast = current === quiz.questions.length - 1;

  const handleNext = () => {
    if (!answered) return;
    if (isLast) grade();
    else setCurrent((c) => c + 1);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* ── Sticky app-style header ─────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur px-4 sm:px-10 py-3 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-foreground text-base sm:text-lg font-bold leading-tight tracking-tight">
              PPC Companion
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate max-w-[140px] sm:max-w-none">
              {quiz.title}
            </p>
          </div>
        </div>
        {/* Desktop nav — mirrors stitch quiz.html */}
        <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
          <nav className="flex items-center gap-6">
            <span className="text-foreground text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              Dashboard
            </span>
            <span className="text-primary text-sm font-bold">
              Quiz
            </span>
            <span className="text-foreground/70 text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              Community
            </span>
            <span className="text-foreground/70 text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              Profile
            </span>
          </nav>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center size-10 rounded-full hover:bg-muted transition-colors text-muted-foreground">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm">
              {phaseNumber}
            </div>
          </div>
        </div>
        {/* Mobile: avatar */}
        <div className="md:hidden flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {phaseNumber}
          </div>
        </div>
      </header>

      {!submitted ? (
        <div className="flex flex-col pb-20 md:pb-0">
          {/* ── Progress block ──────────────────────────────────── */}
          <div className="border-b border-border/60 bg-muted/20 px-4 sm:px-8 pt-6 pb-4">
            <div className="flex flex-wrap gap-4 justify-between items-end mb-3">
              <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Quiz Progress
                </p>
                <p className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  Question {current + 1}{" "}
                  <span className="text-muted-foreground font-normal">
                    of {quiz.questions.length}
                  </span>
                </p>
              </div>
              <span className="inline-flex items-center justify-center bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-2 py-1 rounded">
                {progressPercent}% Complete
              </span>
            </div>
            <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* ── Question body ──────────────────────────────────── */}
          <div className="px-4 sm:px-8 py-5 sm:py-6">
            <div className="mb-6 sm:mb-8">
              <Badge className="bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-300 border-blue-100 dark:border-blue-800 mb-3 sm:mb-4">
                {phaseTitle}
              </Badge>
              <h1 className="text-xl sm:text-[28px] font-extrabold leading-snug tracking-tight text-foreground">
                {q.question}
              </h1>
            </div>

            {/* Answer area */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {q.type === "mcq" && q.options && (
                <>
                  {q.options.map((opt) => {
                    const selected = ans === opt.id;
                    return (
                      <label
                        key={opt.id}
                          className={cn(
                            "group relative flex items-start gap-3 sm:gap-4 rounded-xl border-2 p-4 sm:p-5 cursor-pointer transition-all duration-200 active:scale-[0.99]",
                            selected
                              ? "border-primary bg-primary/[0.03] shadow-sm"
                              : "border-transparent bg-muted/40 hover:bg-muted hover:border-border hover:shadow-md"
                          )}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.id}
                          checked={selected}
                          onChange={() => setAnswer(q.id, opt.id)}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                        />
                        <div className="flex grow flex-col">
                          <p
                            className={cn(
                              "text-sm sm:text-base font-bold leading-snug",
                              selected ? "text-primary" : "text-foreground"
                            )}
                          >
                            {opt.label}
                          </p>
                          {opt.description && (
                            <p className="text-xs sm:text-sm font-normal leading-relaxed text-muted-foreground mt-0.5 sm:mt-1">
                              {opt.description}
                            </p>
                          )}
                        </div>
                        {selected && (
                          <CheckCircle2 className="absolute right-3 top-3 sm:right-4 sm:top-4 text-primary" />
                        )}
                      </label>
                    );
                  })}
                </>
              )}

              {q.type === "numeric" && (
                <div className="max-w-xs">
                  <Input
                    type="text"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder="e.g. 25%"
                    className="font-mono"
                  />
                </div>
              )}

              {q.type === "open" && (
                <Textarea
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                  className="font-mono resize-y"
                />
              )}
            </div>

            {/* Feedback callouts (after answering) */}
            {answered && q.type !== "open" && (
              <div className="mt-6 sm:mt-8">
                {isQuestionCorrect(q, ans) ? (
                  <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 mb-3 sm:mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-7 sm:size-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <h3 className="text-emerald-800 dark:text-emerald-200 text-base sm:text-lg font-bold">
                        Excellent! Correct.
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 mb-3 sm:mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-7 sm:size-8 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400 shrink-0">
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <h3 className="text-rose-800 dark:text-rose-200 text-base sm:text-lg font-bold">
                        Not quite — keep going.
                      </h3>
                    </div>
                  </div>
                )}

                {q.explanation && (
                  <div className="flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800/30">
                    <div className="shrink-0 text-indigo-500 dark:text-indigo-400">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-900 dark:text-indigo-100">
                        AI Insight
                      </p>
                      <p className="text-xs sm:text-sm leading-relaxed text-indigo-800 dark:text-indigo-200">
                        <strong>Pro Tip:</strong>{" "}
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {answered && q.type === "open" && (
              <div className="mt-6 sm:mt-8">
                {q.explanation && (
                  <div className="flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800/30 mb-3 sm:mb-4">
                    <div className="shrink-0 text-indigo-500 dark:text-indigo-400">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-900 dark:text-indigo-100">
                        AI Insight
                      </p>
                      <p className="text-xs sm:text-sm leading-relaxed text-indigo-800 dark:text-indigo-200">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}

                {q.modelAnswer && (
                  <div>
                    <button
                      onClick={() =>
                        setRevealOpen((p) => ({ ...p, [q.id]: !p[q.id] }))
                      }
                      className={cn(
                        "inline-flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 transition-colors",
                        revealOpen[q.id]
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      {revealOpen[q.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {revealOpen[q.id] ? "Hide model answer" : "Show model answer"}
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          revealOpen[q.id] && "rotate-180"
                        )}
                      />
                    </button>

                    {revealOpen[q.id] && (
                      <div className="mt-3 rounded-lg bg-primary/5 border border-primary/50 px-4 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                            Model answer
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                          {q.modelAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action bar */}
            <div className="sticky bottom-0 -mx-4 sm:-mx-8 mt-6 sm:mt-8 px-4 sm:px-8 py-4 bg-card border-t border-border z-20">
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={report}
                  className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
                >
                  <Flag className="h-4 w-4" />
                  Report
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!answered}
                  size="lg"
                  className="w-full sm:w-auto min-w-[160px]"
                >
                  {isLast ? "Submit checkpoint" : "Next Question"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Review mode ─────────────────────────────────────── */
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
          {/* Results banner */}
          <div className="rounded-xl border border-border/60 bg-primary/5 dark:bg-primary/10 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-border/40"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${(scorePercent / 100) * 213.6} 213.6`}
                      className={cn(
                        "transition-all duration-700",
                        scorePercent >= 80
                          ? "text-emerald-500"
                          : scorePercent >= 60
                          ? "text-amber-500"
                          : "text-rose-500"
                      )}
                      stroke="currentColor"
                    />
                  </svg>
                  <span className="absolute text-lg sm:text-xl font-bold tabular-nums">
                    {scorePercent}%
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy
                      className={cn(
                        "h-5 w-5",
                        scorePercent >= 80
                          ? "text-emerald-500"
                          : scorePercent >= 60
                          ? "text-amber-500"
                          : "text-rose-500"
                      )}
                    />
                    <span className="text-2xl font-bold tabular-nums">
                      {priorResult?.score}
                      <span className="text-muted-foreground font-normal">
                        /{quiz.questions.length}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {scorePercent >= 80
                      ? "Excellent — you've mastered this phase."
                      : scorePercent >= 60
                      ? "Good progress — review the explanations below."
                      : "Worth reviewing the phase material again before moving on."}
                  </p>
                </div>
              </div>

              <Button
                onClick={reset}
                variant="outline"
                size="default"
                className="sm:ml-auto shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
                Retake checkpoint
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>
              Review your answers below. Correct answers are highlighted in
              green.
            </span>
          </div>

          {quiz.questions.map((rq, i) => {
            const userAns = (answers[rq.id] ?? "").trim();
            const showFeedback = rq.type !== "open";
            const isCorrect = showFeedback
              ? isQuestionCorrect(rq, userAns)
              : false;
            const isRevealed = revealOpen[rq.id];

            return (
              <div
                key={rq.id}
                className={cn(
                  "rounded-xl border p-5 sm:p-6 transition-colors",
                  !showFeedback
                    ? "border-border/60"
                    : isCorrect
                    ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/10"
                    : "border-rose-200 dark:border-rose-800/60 bg-rose-50/30 dark:bg-rose-950/10"
                )}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0",
                      !showFeedback
                        ? "bg-primary/10 text-primary"
                        : isCorrect
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] leading-snug">
                      {rq.question}
                    </p>
                  </div>
                  {showFeedback &&
                    (isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-full px-3 py-1 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-full px-3 py-1 shrink-0">
                        <XCircle className="h-3.5 w-3.5" />
                        Incorrect
                      </span>
                    ))}
                </div>

                <div className="ml-10 space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Your answer
                    </p>
                    <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
                      {userAns || (
                        <span className="text-muted-foreground italic">
                          No answer provided
                        </span>
                      )}
                    </p>
                  </div>

                  {rq.type === "mcq" && rq.options && (
                    <div className="space-y-1.5 pt-1">
                      {rq.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={cn(
                            "flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm",
                            opt.correct
                              ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50"
                              : opt.id === userAns
                              ? "bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50"
                              : "bg-muted/20 border border-transparent"
                          )}
                        >
                          {opt.correct ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          ) : opt.id === userAns ? (
                            <XCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                          ) : (
                            <span className="h-4 w-4 mt-0.5 shrink-0 rounded-full border-2 border-border" />
                          )}
                          <span
                            className={cn(
                              opt.correct
                                ? "font-semibold text-emerald-800 dark:text-emerald-200"
                                : opt.id === userAns
                                ? "text-rose-800 dark:text-rose-200"
                                : "text-muted-foreground"
                            )}
                          >
                            {opt.label}
                          </span>
                          {opt.description && (
                            <span className="text-xs text-muted-foreground/70 mt-0.5 block">
                              {opt.description}
                            </span>
                          )}
                          {opt.correct && (
                            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shrink-0">
                              Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {rq.type === "numeric" && !isCorrect && (
                    <div className="pt-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Acceptable answer(s)
                      </p>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        {getAcceptable(rq).join(", ")}
                      </p>
                    </div>
                  )}

                  {rq.explanation && (
                    <div className="rounded-lg bg-primary/10 dark:bg-primary/15 border border-primary/50 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm leading-relaxed text-primary">
                          {rq.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {rq.type === "open" && rq.modelAnswer && (
                    <div className="pt-1">
                      <button
                        onClick={() =>
                          setRevealOpen((p) => ({
                            ...p,
                            [rq.id]: !p[rq.id],
                          }))
                        }
                        className={cn(
                          "inline-flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 transition-colors",
                          isRevealed
                            ? "bg-primary/10 text-primary"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                        )}
                      >
                        {isRevealed ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        {isRevealed ? "Hide model answer" : "Show model answer"}
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            isRevealed && "rotate-180"
                          )}
                        />
                      </button>

                      {isRevealed && (
                        <div className="mt-3 rounded-lg bg-primary/5 border border-primary/50 px-4 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                              Model answer
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                            {rq.modelAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex justify-center pt-4 pb-2">
            <Button onClick={reset} variant="outline" size="lg">
              <RotateCcw className="h-4 w-4" />
              Retake checkpoint
            </Button>
          </div>
        </div>
      )}

      {/* Mobile bottom nav (mirrors stitch quiz.html) */}
      <nav className="fixed bottom-0 left-0 w-full z-40 bg-card border-t border-border md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16 items-center">
          <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors p-1">
            <Home className="text-[24px]" />
            <span className="text-[10px] font-medium leading-none">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors p-1">
            <BookOpen className="text-[24px]" />
            <span className="text-[10px] font-medium leading-none">Courses</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors p-1">
            <Users className="text-[24px]" />
            <span className="text-[10px] font-medium leading-none">Community</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-primary transition-colors p-1 relative">
            <MonitorDot className="text-[24px] fill-current" />
            <span className="text-[10px] font-bold leading-none">Progress</span>
            <span className="absolute top-1 right-3 size-2 rounded-full bg-destructive border border-card" />
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors p-1">
            <User className="text-[24px]" />
            <span className="text-[10px] font-medium leading-none">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
