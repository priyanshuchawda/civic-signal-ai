import { describe, expect, it, vi } from "vitest";
import type { CivicArea } from "./delhi-seed";
import { getAreasWithLiveSignals } from "./live-signals";

const seedArea: CivicArea = {
  id: "anand-vihar",
  name: "Anand Vihar",
  district: "East Delhi",
  latitude: 28.6469,
  longitude: 77.316,
  factors: {
    aqiRisk: 20,
    weatherRisk: 30,
    complaintRisk: 78,
    schoolExposureRisk: 68,
    hospitalAccessRisk: 45,
    transitAccessRisk: 25,
  },
  signals: ["High AQI corridor"],
};

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("getAreasWithLiveSignals", () => {
  it("updates AQI and weather risk from live free API responses", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("air-quality")) {
        return jsonResponse({
          current: {
            time: "2026-06-29T10:00",
            us_aqi: 150,
            pm2_5: 80,
          },
        });
      }

      return jsonResponse({
        current: {
          time: "2026-06-29T10:00",
          temperature_2m: 38,
          apparent_temperature: 40,
          relative_humidity_2m: 44,
        },
      });
    });

    const [area] = await getAreasWithLiveSignals([seedArea], fetcher);

    expect(area.factors.aqiRisk).toBe(75);
    expect(area.factors.weatherRisk).toBe(80);
    expect(area.factors.complaintRisk).toBe(78);
    expect(seedArea.factors.aqiRisk).toBe(20);
    expect(seedArea.factors.weatherRisk).toBe(30);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("falls back to seed factors when live fetch fails", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("network");
    });

    const [area] = await getAreasWithLiveSignals([seedArea], fetcher);

    expect(area.factors).toEqual(seedArea.factors);
  });
});
