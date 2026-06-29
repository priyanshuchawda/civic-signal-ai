import type { RiskFactors } from "../domain/risk";
import type { CivicArea } from "./delhi-seed";

export type LiveSignalFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type LiveSignalSource = "live" | "partial" | "fallback";

export type LiveSignalState = {
  source: LiveSignalSource;
  refreshedAt: string;
  totalAreas: number;
  fallbackAreaCount: number;
};

export type LiveSignalDataset = LiveSignalState & {
  areas: CivicArea[];
};

type OpenMeteoCurrent = Record<string, unknown> & {
  time?: string;
};

const weatherEndpoint = "https://api.open-meteo.com/v1/forecast";
const airQualityEndpoint =
  "https://air-quality-api.open-meteo.com/v1/air-quality";

function clampRisk(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function scaleToRisk(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return clampRisk(((value - min) / (max - min)) * 100);
}

function buildCurrentUrl(
  endpoint: string,
  area: CivicArea,
  variables: string[],
) {
  const url = new URL(endpoint);
  url.searchParams.set("latitude", String(area.latitude));
  url.searchParams.set("longitude", String(area.longitude));
  url.searchParams.set("current", variables.join(","));
  url.searchParams.set("timezone", "auto");

  return url;
}

function aqiRiskFromCurrent(current: OpenMeteoCurrent, fallback: number) {
  return (
    scaleToRisk(current.us_aqi, 0, 200) ??
    scaleToRisk(current.pm2_5, 0, 150) ??
    fallback
  );
}

function weatherRiskFromCurrent(current: OpenMeteoCurrent, fallback: number) {
  const apparentTemperatureRisk = scaleToRisk(
    current.apparent_temperature,
    24,
    44,
  );
  const temperatureRisk = scaleToRisk(current.temperature_2m, 26, 46);
  const humidityRisk = scaleToRisk(current.relative_humidity_2m, 35, 85);
  const risks = [
    apparentTemperatureRisk,
    temperatureRisk,
    humidityRisk,
  ].filter((risk): risk is number => risk !== null);

  return risks.length > 0 ? Math.max(...risks) : fallback;
}

async function readCurrent(fetcher: LiveSignalFetch, url: URL) {
  const response = await fetcher(url);

  if (!response.ok) {
    throw new Error(`Live signal request failed with ${response.status}`);
  }

  const body = (await response.json()) as { current?: OpenMeteoCurrent };

  if (!body.current) {
    throw new Error("Live signal response did not include current values");
  }

  return body.current;
}

function mergeLiveFactors(
  seedFactors: RiskFactors,
  airQuality: OpenMeteoCurrent,
  weather: OpenMeteoCurrent,
): RiskFactors {
  return {
    ...seedFactors,
    aqiRisk: aqiRiskFromCurrent(airQuality, seedFactors.aqiRisk),
    weatherRisk: weatherRiskFromCurrent(weather, seedFactors.weatherRisk),
  };
}

async function getAreaWithLiveSignals(
  area: CivicArea,
  fetcher: LiveSignalFetch,
): Promise<{ area: CivicArea; source: Exclude<LiveSignalSource, "partial"> }> {
  try {
    const [airQuality, weather] = await Promise.all([
      readCurrent(
        fetcher,
        buildCurrentUrl(airQualityEndpoint, area, ["us_aqi", "pm2_5"]),
      ),
      readCurrent(
        fetcher,
        buildCurrentUrl(weatherEndpoint, area, [
          "temperature_2m",
          "apparent_temperature",
          "relative_humidity_2m",
        ]),
      ),
    ]);

    return {
      area: {
        ...area,
        factors: mergeLiveFactors(area.factors, airQuality, weather),
      },
      source: "live",
    };
  } catch {
    return {
      area: {
        ...area,
        factors: { ...area.factors },
      },
      source: "fallback",
    };
  }
}

export async function getLiveSignalDataset(
  areas: CivicArea[],
  fetcher: LiveSignalFetch = fetch,
  now: () => Date = () => new Date(),
): Promise<LiveSignalDataset> {
  const results = await Promise.all(
    areas.map((area) => getAreaWithLiveSignals(area, fetcher)),
  );
  const fallbackAreaCount = results.filter(
    (result) => result.source === "fallback",
  ).length;
  const source: LiveSignalSource =
    fallbackAreaCount === 0
      ? "live"
      : fallbackAreaCount === results.length
        ? "fallback"
        : "partial";

  return {
    areas: results.map((result) => result.area),
    source,
    refreshedAt: now().toISOString(),
    totalAreas: results.length,
    fallbackAreaCount,
  };
}

export async function getAreasWithLiveSignals(
  areas: CivicArea[],
  fetcher: LiveSignalFetch = fetch,
) {
  const dataset = await getLiveSignalDataset(areas, fetcher);

  return dataset.areas;
}
