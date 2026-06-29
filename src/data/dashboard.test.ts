import { describe, expect, it } from "vitest";
import { getDashboardSummary } from "./dashboard";
import { delhiSeedAreas } from "./delhi-seed";

describe("getDashboardSummary", () => {
  it("returns ranked areas and summary counts", () => {
    const summary = getDashboardSummary(delhiSeedAreas);

    expect(summary.areas[0]?.name).toBe("Anand Vihar");
    expect(summary.totalAreas).toBe(5);
    expect(summary.highRiskAreas).toBeGreaterThan(0);
    expect(summary.averageRiskScore).toBeGreaterThan(0);
  });

  it("returns an empty summary for no areas", () => {
    const summary = getDashboardSummary([]);

    expect(summary.totalAreas).toBe(0);
    expect(summary.highRiskAreas).toBe(0);
    expect(summary.averageRiskScore).toBe(0);
    expect(summary.areas).toEqual([]);
  });
});
