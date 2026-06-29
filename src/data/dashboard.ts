import { calculateRiskScore, type RiskScore } from "../domain/risk";
import type { CivicArea } from "./delhi-seed";

export type RankedCivicArea = CivicArea & RiskScore;

export type DashboardSummary = {
  totalAreas: number;
  highRiskAreas: number;
  averageRiskScore: number;
  areas: RankedCivicArea[];
};

export function getDashboardSummary(areas: CivicArea[]): DashboardSummary {
  const rankedAreas = areas
    .map((area) => ({
      ...area,
      ...calculateRiskScore(area.factors),
    }))
    .toSorted((a, b) => b.score - a.score);

  const totalScore = rankedAreas.reduce((sum, area) => sum + area.score, 0);

  return {
    totalAreas: rankedAreas.length,
    highRiskAreas: rankedAreas.filter(
      (area) => area.level === "high" || area.level === "very_high",
    ).length,
    averageRiskScore:
      rankedAreas.length === 0 ? 0 : Math.round(totalScore / rankedAreas.length),
    areas: rankedAreas,
  };
}
