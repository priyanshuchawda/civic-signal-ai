import { describe, expect, it } from "vitest";
import type { RankedCivicArea } from "../data/dashboard";
import { generateOperatorActions } from "./recommendations";

function area(
  id: string,
  reasons: string[],
  signals: string[],
): RankedCivicArea {
  return {
    id,
    name: id
      .split("-")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" "),
    district: "Test District",
    latitude: 28.6,
    longitude: 77.2,
    factors: {
      aqiRisk: 10,
      weatherRisk: 10,
      complaintRisk: 10,
      schoolExposureRisk: 10,
      hospitalAccessRisk: 10,
      transitAccessRisk: 10,
    },
    signals,
    score: 76,
    level: "very_high",
    reasons,
  };
}

describe("generateOperatorActions", () => {
  it("generates AQI, heat, complaint, and access recommendations", () => {
    const actions = generateOperatorActions(
      [
        area("aqi-nagar", ["AQI risk is very high"], ["Traffic exposure"]),
        area("heat-colony", ["Weather risk is high"], ["Heat stress"]),
        area(
          "waste-market",
          ["Complaint risk is very high"],
          ["Sanitation complaints"],
        ),
        area(
          "access-block",
          ["Hospital access risk is high"],
          ["Transit access gap"],
        ),
      ],
      10,
    );

    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "aqi",
          targetArea: "Aqi Nagar",
          rationale: "AQI risk is very high",
          nextStep: "Coordinate an air quality check and exposure advisory.",
        }),
        expect.objectContaining({
          category: "heat",
          targetArea: "Heat Colony",
          rationale: "Weather risk is high",
          nextStep: "Prepare heat-risk outreach for vulnerable facilities.",
        }),
        expect.objectContaining({
          category: "complaints",
          targetArea: "Waste Market",
          rationale: "Complaint risk is very high",
          nextStep: "Triage the complaint cluster with the responsible ward team.",
        }),
        expect.objectContaining({
          category: "access",
          targetArea: "Access Block",
          rationale: "Hospital access risk is high",
          nextStep: "Check service access constraints before field deployment.",
        }),
      ]),
    );
  });

  it("limits recommendations after sorting highest risk areas first", () => {
    const highRiskArea = area("high-risk", ["AQI risk is high"], ["Traffic"]);
    const moderateArea = {
      ...area("moderate-risk", ["Weather risk is high"], ["Heat risk"]),
      score: 42,
      level: "moderate" as const,
    };

    const actions = generateOperatorActions([moderateArea, highRiskArea], 1);

    expect(actions).toHaveLength(1);
    expect(actions[0].targetArea).toBe("High Risk");
  });
});
