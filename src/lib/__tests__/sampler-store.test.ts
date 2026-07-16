import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/lib/store";

const STEPS = ["see-the-work", "check-listing", "make-decision", "career-path"] as const;

describe("Sampler progress (store)", () => {
  beforeEach(() => {
    // Reset sampler slice before each test via the documented reset path.
    useAppStore.setState({
      samplerStepResults: {},
      samplerStartedAt: null,
      samplerCompletedAt: null,
    });
  });

  it("starts with no steps completed", () => {
    expect(useAppStore.getState().getSamplerProgress()).toEqual({
      completed: 0,
      total: 4,
      done: false,
    });
  });

  it("marks individual steps and tracks a completion time", () => {
    const mark = useAppStore.getState().completeSamplerStep;
    mark("see-the-work");
    mark("check-listing");
    mark("make-decision", 14);

    const progress = useAppStore.getState().getSamplerProgress();
    expect(progress.completed).toBe(3);
    expect(progress.done).toBe(false);
    expect(useAppStore.getState().samplerStepResults["make-decision"]?.score).toBe(14);
    expect(typeof useAppStore.getState().samplerStepResults["see-the-work"]?.completedAt).toBe(
      "number"
    );
  });

  it("markSamplerStarted records a timestamp only once (idempotent)", () => {
    const start = useAppStore.getState().markSamplerStarted;
    start();
    const t1 = useAppStore.getState().samplerStartedAt;
    start(); // second call must not overwrite
    const t2 = useAppStore.getState().samplerStartedAt;
    expect(t1).not.toBeNull();
    expect(t1).toBe(t2);
  });

  it("completes the sampler only after ALL four steps are done", () => {
    const { completeSampler, completeSamplerStep } = useAppStore.getState();
    // Three of four — should NOT complete.
    completeSamplerStep("see-the-work");
    completeSamplerStep("check-listing");
    completeSamplerStep("make-decision");
    completeSampler();
    expect(useAppStore.getState().samplerCompletedAt).toBeNull();
    expect(useAppStore.getState().getSamplerProgress().done).toBe(false);

    // Fourth step closes it.
    completeSamplerStep("career-path");
    completeSampler();
    expect(useAppStore.getState().samplerCompletedAt).not.toBeNull();
    expect(useAppStore.getState().getSamplerProgress().done).toBe(true);
  });

  it("keeps sampler progress ISOLATED from course/phase progress", () => {
    // Completing the sampler must not flip any legacy completion flag.
    const before = useAppStore.getState();
    expect(before.capstoneCompleted).toEqual({});
    expect(before.quizResults).toEqual({});
    expect(before.checklistCompleted).toEqual({});

    useAppStore.getState().markSamplerStarted();
    STEPS.forEach((s) => useAppStore.getState().completeSamplerStep(s));
    useAppStore.getState().completeSampler();

    const after = useAppStore.getState();
    expect(after.capstoneCompleted).toEqual({});
    expect(after.quizResults).toEqual({});
    expect(after.checklistCompleted).toEqual({});
    expect(after.samplerCompletedAt).not.toBeNull();
  });
});
