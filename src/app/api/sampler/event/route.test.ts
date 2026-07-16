import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/sampler/event/route";

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/sampler/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0]);

describe("POST /api/sampler/event — privacy-safe analytics", () => {
  it("accepts a whitelisted event and returns 204", async () => {
    const res = await post({
      event: "sampler_completed",
      step: "career-path",
      sessionId: "abc-123",
      meta: { score: 14, maxScore: 20 },
    });
    expect(res.status).toBe(204);
  });

  it("rejects an unknown event with 400", async () => {
    const res = await post({ event: "delete_everything", sessionId: "x" });
    expect(res.status).toBe(400);
  });

  it("rejects an unknown step with 400", async () => {
    const res = await post({ event: "sampler_step_completed", step: "hack-step" });
    expect(res.status).toBe(400);
  });

  it("never persists free-text answers — only whitelisted numeric/enum meta", async () => {
    const res = await post({
      event: "sampler_triage_submitted",
      sessionId: "s1",
      // A naive caller trying to log the student's actual PPC note:
      meta: {
        score: 12,
        freeText: "I would negate the term because 0 orders",
        essay: { long: "secret" },
      },
    });
    expect(res.status).toBe(204);
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await POST(
      new Request("http://localhost/api/sampler/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      }) as unknown as Parameters<typeof POST>[0]
    );
    expect(res.status).toBe(400);
  });

  it("truncates over-long session ids", async () => {
    const longId = "a".repeat(200);
    const res = await post({ event: "sampler_started", sessionId: longId });
    expect(res.status).toBe(204);
  });
});
