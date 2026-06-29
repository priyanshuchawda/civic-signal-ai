export type RiskLevel = "low" | "moderate" | "high" | "very_high";

export type RiskFactors = {
  aqiRisk: number;
  weatherRisk: number;
  complaintRisk: number;
  schoolExposureRisk: number;
  hospitalAccessRisk: number;
  transitAccessRisk: number;
};

export type RiskScore = {
  score: number;
  level: RiskLevel;
  reasons: string[];
};

const weights: Record<keyof RiskFactors, number> = {
  aqiRisk: 0.3,
  weatherRisk: 0.2,
  complaintRisk: 0.2,
  schoolExposureRisk: 0.1,
  hospitalAccessRisk: 0.1,
  transitAccessRisk: 0.1,
};

function clampFactor(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

function levelForScore(score: number): RiskLevel {
  if (score >= 75) {
    return "very_high";
  }

  if (score >= 50) {
    return "high";
  }

  if (score >= 25) {
    return "moderate";
  }

  return "low";
}

function describeFactor(label: string, value: number) {
  if (value >= 75) {
    return `${label} is very high`;
  }

  if (value >= 50) {
    return `${label} is high`;
  }

  return null;
}

export function calculateRiskScore(factors: RiskFactors): RiskScore {
  const normalized = Object.fromEntries(
    Object.entries(factors).map(([key, value]) => [key, clampFactor(value)]),
  ) as RiskFactors;

  const score = Math.round(
    Object.entries(weights).reduce((total, [key, weight]) => {
      return total + normalized[key as keyof RiskFactors] * weight;
    }, 0),
  );

  const reasons = [
    describeFactor("AQI risk", normalized.aqiRisk),
    describeFactor("Weather risk", normalized.weatherRisk),
    describeFactor("Complaint risk", normalized.complaintRisk),
    describeFactor("School exposure risk", normalized.schoolExposureRisk),
    describeFactor("Hospital access risk", normalized.hospitalAccessRisk),
    describeFactor("Transit access risk", normalized.transitAccessRisk),
  ].filter((reason): reason is string => Boolean(reason));

  return {
    score,
    level: levelForScore(score),
    reasons,
  };
}
