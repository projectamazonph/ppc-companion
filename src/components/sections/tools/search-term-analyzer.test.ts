import { describe, it, expect } from "vitest";
import { parseNum, recommend, type Row } from "@/components/sections/tools/search-term-analyzer";

const row = (over: Partial<Row> = {}): Row => ({
  id: "x",
  searchTerm: "test term",
  clicks: "0",
  spend: "0",
  orders: "0",
  sales: "0",
  description: "",
  ...over,
});

describe("parseNum", () => {
  it("parses plain numbers", () => {
    expect(parseNum("45")).toBe(45);
  });
  it("strips $ and commas", () => {
    expect(parseNum("$1,234.50")).toBe(1234.5);
  });
  it("returns 0 for blanks / non-numeric", () => {
    expect(parseNum("")).toBe(0);
    expect(parseNum("—")).toBe(0);
    expect(parseNum("abc")).toBe(0);
  });
});

describe("recommend", () => {
  it("returns null for empty rows", () => {
    expect(recommend(row(), 30)).toBeNull();
  });

  it("flags a negative candidate (clicks, no orders)", () => {
    const rec = recommend(row({ clicks: "15", spend: "10", orders: "0" }), 30);
    expect(rec?.action).toBe("negative");
    expect(rec?.bidChange).toBe(0);
  });

  it("promotes a strong converter at/below target", () => {
    const rec = recommend(row({ clicks: "50", spend: "60", orders: "8", sales: "200" }), 30);
    expect(rec?.action).toBe("promote");
    expect(rec?.bidChange).toBeGreaterThan(0);
  });

  it("decreases bid when ACoS is above target", () => {
    const rec = recommend(row({ clicks: "20", spend: "90", orders: "1", sales: "100" }), 30);
    expect(rec?.action).toBe("decrease");
    expect(rec?.bidChange).toBeLessThan(0);
  });

  it("increases bid when ACoS is well below target", () => {
    const rec = recommend(row({ clicks: "20", spend: "9", orders: "2", sales: "200" }), 30);
    expect(rec?.action).toBe("increase");
  });

  it("keeps terms in the safe zone", () => {
    const rec = recommend(row({ clicks: "5", spend: "10", orders: "1", sales: "30" }), 30);
    expect(rec?.action).toBe("keep");
  });
});
