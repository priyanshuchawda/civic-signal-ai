import type { RiskFactors } from "../domain/risk";

export type CivicArea = {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  factors: RiskFactors;
  signals: string[];
};

export const delhiSeedAreas: CivicArea[] = [
  {
    id: "anand-vihar",
    name: "Anand Vihar",
    district: "East Delhi",
    latitude: 28.6469,
    longitude: 77.316,
    factors: {
      aqiRisk: 92,
      weatherRisk: 62,
      complaintRisk: 78,
      schoolExposureRisk: 68,
      hospitalAccessRisk: 45,
      transitAccessRisk: 25,
    },
    signals: [
      "High AQI corridor",
      "Transit hub exposure",
      "Repeated waste complaints",
    ],
  },
  {
    id: "lajpat-nagar",
    name: "Lajpat Nagar",
    district: "South East Delhi",
    latitude: 28.5677,
    longitude: 77.2433,
    factors: {
      aqiRisk: 64,
      weatherRisk: 74,
      complaintRisk: 82,
      schoolExposureRisk: 52,
      hospitalAccessRisk: 30,
      transitAccessRisk: 20,
    },
    signals: ["Market crowding", "Heat stress", "Sanitation complaints"],
  },
  {
    id: "dwarka",
    name: "Dwarka",
    district: "South West Delhi",
    latitude: 28.5921,
    longitude: 77.046,
    factors: {
      aqiRisk: 52,
      weatherRisk: 70,
      complaintRisk: 34,
      schoolExposureRisk: 40,
      hospitalAccessRisk: 42,
      transitAccessRisk: 18,
    },
    signals: ["Heat risk", "Moderate AQI"],
  },
  {
    id: "karol-bagh",
    name: "Karol Bagh",
    district: "Central Delhi",
    latitude: 28.6514,
    longitude: 77.1907,
    factors: {
      aqiRisk: 70,
      weatherRisk: 58,
      complaintRisk: 55,
      schoolExposureRisk: 45,
      hospitalAccessRisk: 25,
      transitAccessRisk: 16,
    },
    signals: ["Dense commercial area", "Traffic exposure"],
  },
  {
    id: "rohini",
    name: "Rohini",
    district: "North West Delhi",
    latitude: 28.7432,
    longitude: 77.0672,
    factors: {
      aqiRisk: 46,
      weatherRisk: 65,
      complaintRisk: 28,
      schoolExposureRisk: 35,
      hospitalAccessRisk: 38,
      transitAccessRisk: 35,
    },
    signals: ["Moderate heat risk", "Lower complaint pressure"],
  },
];
