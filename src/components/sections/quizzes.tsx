"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { phases, type Quiz } from "@/lib/course-data";
import { BrandButton } from "@/components/shared/buttons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  CircleCheck,
  CircleX,
  CircleDot,
  ArrowRight,
  Target,
  FileText,
  BarChart3,
  ChevronDown,
  Lightbulb,
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md shadow-primary-600/20">
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
                  ? "border-primary-400 dark:border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 shadow-lg shadow-primary-500/5 ring-1 ring-primary-400/30 dark:ring-primary-600/30"
                  : "border-border/60 bg-card hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md"
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
                <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-primary-50 dark:bg-primary-950/20 border-r border-b border-primary-400 dark:border-primary-600" />
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
// QuizView — the actual quiz interaction
// ---------------------------------------------------------------------------

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
        const normalize = (s: string) =>
          s.toLowerCase().replace(/[^0-9.%]/g, "");
        const acceptable = q.acceptableAnswers ?? (q.modelAnswer ? [q.modelAnswer] : []);
        if (acceptable.some((a) => normalize(a) === normalize(userAns)))
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
    setSubmitted(false);
    setRevealOpen({});
  };

  const autoGradable = quiz.questions.filter((q) => q.type !== "open").length;
  const openEnded = quiz.questions.filter((q) => q.type === "open").length;
  const scorePercent = priorResult
    ? Math.round((priorResult.score / quiz.questions.length) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="border-b border-border/60 bg-muted/20 px-6 sm:px-8 py-6">
        <div className="flex flex-wrap items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md shrink-0",
              phaseColor
            )}
          >
            <span className="font-bold">{phaseNumber}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {quiz.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-muted-foreground">
              <span>
                Phase {phaseNumber}: {phaseTitle}
              </span>
              <span className="hidden sm:inline">·</span>
              <span>{quiz.questions.length} questions</span>
              {autoGradable > 0 && (
                <>
                  <span className="hidden sm:inline">·</span>
                  <span>{autoGradable} auto-graded</span>
                </>
              )}
              {openEnded > 0 && (
                <>
                  <span className="hidden sm:inline">·</span>
                  <span>{openEnded} self-graded</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Results banner ──────────────────────────────────── */}
        {submitted && priorResult && (
          <div className="mt-6 rounded-xl border border-border/60 bg-gradient-to-br from-primary-50/80 via-card to-accent-50/40 dark:from-primary-950/20 dark:via-card dark:to-accent-950/10 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Score circle */}
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center">
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 80 80"
                  >
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
                      {priorResult.score}
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

              <BrandButton
                onClick={reset}
                variant="outline"
                size="default"
                className="sm:ml-auto shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
                Retake checkpoint
              </BrandButton>
            </div>
          </div>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
        {!submitted ? (
          <>
            {/* Questions */}
            {quiz.questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                answer={answers[q.id] ?? ""}
                onAnswer={(val) => setAnswer(q.id, val)}
              />
            ))}

            {/* Submit section */}
            <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-gradient-to-t from-card via-card to-card/0 border-t border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Progress */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {answeredCount} of {quiz.questions.length} answered
                    </span>
                    <span className="text-xs font-semibold tabular-nums">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <BrandButton
                  onClick={grade}
                  disabled={!allAnswered}
                  size="lg"
                  className="shrink-0"
                >
                  Submit checkpoint
                  <ArrowRight className="h-4 w-4" />
                </BrandButton>
              </div>
            </div>
          </>
        ) : (
          /* ── Review mode ─────────────────────────────────────── */
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>
                Review your answers below. Correct answers are highlighted in
                green.
              </span>
            </div>

            {quiz.questions.map((q, i) => {
              const userAns = (answers[q.id] ?? "").trim();
              let isCorrect = false;
              if (q.type === "mcq") {
                const opt = q.options?.find((o) => o.id === userAns);
                isCorrect = !!opt?.correct;
              } else if (q.type === "numeric") {
                const normalize = (s: string) =>
                  s.toLowerCase().replace(/[^0-9.%]/g, "");
                const acceptable = q.acceptableAnswers ?? (q.modelAnswer ? [q.modelAnswer] : []);
                isCorrect = acceptable.some(
                  (a) => normalize(a) === normalize(userAns)
                );
              }
              const showFeedback = q.type !== "open";
              const isRevealed = revealOpen[q.id];

              return (
                <div
                  key={q.id}
                  className={cn(
                    "rounded-xl border p-5 sm:p-6 transition-colors",
                    !showFeedback
                      ? "border-border/60"
                      : isCorrect
                      ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/10"
                      : "border-rose-200 dark:border-rose-800/60 bg-rose-50/30 dark:bg-rose-950/10"
                  )}
                >
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-4">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0",
                        !showFeedback
                          ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                          : isCorrect
                          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] leading-snug">
                        {q.question}
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
                    {/* Your answer */}
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

                    {/* MCQ option breakdown */}
                    {q.type === "mcq" && q.options && (
                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt) => (
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
                            {opt.correct && (
                              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shrink-0">
                                Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Numeric answer breakdown */}
                    {q.type === "numeric" && !isCorrect && (
                      <div className="pt-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Acceptable answer(s)
                        </p>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          {(q.acceptableAnswers ?? (q.modelAnswer ? [q.modelAnswer] : [])).join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="rounded-lg bg-primary-50/60 dark:bg-primary-950/15 border border-primary-200/60 dark:border-primary-800/30 px-4 py-3">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                          <p className="text-sm leading-relaxed text-primary-800 dark:text-primary-200">
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Open-ended model answer */}
                    {q.type === "open" && q.modelAnswer && (
                      <div className="pt-1">
                        <button
                          onClick={() =>
                            setRevealOpen((p) => ({
                              ...p,
                              [q.id]: !p[q.id],
                            }))
                          }
                          className={cn(
                            "inline-flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 transition-colors",
                            isRevealed
                              ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
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
                          <div className="mt-3 rounded-lg bg-gradient-to-br from-primary-50/80 to-accent-50/40 dark:from-primary-950/15 dark:to-accent-950/10 border border-primary-200/50 dark:border-primary-800/25 px-4 py-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                              <span className="text-[11px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
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
                </div>
              );
            })}

            {/* Retake at bottom of review */}
            <div className="flex justify-center pt-4 pb-2">
              <BrandButton onClick={reset} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4" />
                Retake checkpoint
              </BrandButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QuestionCard — individual question in the active (pre-submit) quiz
// ---------------------------------------------------------------------------

function QuestionCard({
  question: q,
  index,
  answer,
  onAnswer,
}: {
  question: Quiz["questions"][number];
  index: number;
  answer: string;
  onAnswer: (val: string) => void;
}) {
  const isAnswered = answer.trim().length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-5 sm:p-6 transition-all duration-200",
        isAnswered
          ? "border-primary-200 dark:border-primary-800/50 bg-primary-50/20 dark:bg-primary-950/10"
          : "border-border/60 bg-card"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-colors",
            isAnswered
              ? "bg-primary-600 text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] leading-snug">
            {q.question}
          </p>
        </div>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5 shrink-0",
            q.type === "mcq"
              ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
              : q.type === "numeric"
              ? "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
              : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
          )}
        >
          {q.type === "open" ? "Open-ended" : q.type === "numeric" ? "Numeric" : "Multiple choice"}
        </span>
      </div>

      {/* Answer area */}
      <div className="ml-10">
        {q.type === "mcq" && q.options && (
          <div className="space-y-2">
            {q.options.map((opt) => {
              const selected = answer === opt.id;
              return (
                <label
                  key={opt.id}
                  htmlFor={`${q.id}-${opt.id}`}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border px-4 py-3.5 cursor-pointer text-sm transition-all duration-150",
                    selected
                      ? "border-primary-400 dark:border-primary-600 bg-primary-50/60 dark:bg-primary-950/20 shadow-sm"
                      : "border-border/60 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-muted/20"
                  )}
                >
                  <input
                    type="radio"
                    name={q.id}
                    id={`${q.id}-${opt.id}`}
                    value={opt.id}
                    checked={selected}
                    onChange={() => onAnswer(opt.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 border-muted-foreground/40 focus:ring-primary-500"
                  />
                  <span className="leading-relaxed">{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}

        {q.type === "numeric" && (
          <div className="max-w-xs">
            <input
              type="text"
              value={answer}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder="e.g. 25%"
              className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all"
            />
          </div>
        )}

        {q.type === "open" && (
          <textarea
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all resize-y"
          />
        )}
      </div>
    </div>
  );
}
