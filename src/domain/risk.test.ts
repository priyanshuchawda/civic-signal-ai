import { describe, expect, it } from "vitest";
import { calculateRiskScore } from "./risk";

describe("calculateRiskScore", () => {
  it("calculates a weighted risk score and level", () => {
    const result = calculateRiskScore({
      aqiRisk: 90,
      weatherRisk: 60,
      complaintRisk: 80,
      schoolExposureRisk: 70,
      hospitalAccessRisk: 50,
      transitAccessRisk: 30,
    });

    expect(result.score).toBe(70);
    expect(result.level).toBe("high");
    expect(result.reasons).toContain("AQI risk is very high");
    expect(result.reasons).toContain("Complaint risk is very high");
  });

  it("clamps invalid factors into the 0 to 100 range", () => {
    const result = calculateRiskScore({
      aqiRisk: 140,
      weatherRisk: -10,
      complaintRisk: 0,
      schoolExposureRisk: 0,
      hospitalAccessRisk: 0,
      transitAccessRisk: 0,
    });

    expect(result.score).toBe(30);
    expect(result.level).toBe("moderate");
  });
});
