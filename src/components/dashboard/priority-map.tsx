"use client";

import { MapPinned } from "lucide-react";
import { useMemo, useState } from "react";
import type { RankedCivicArea } from "../../data/dashboard";

const levelLabel: Record<RankedCivicArea["level"], string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  very_high: "Very high",
};

const markerClass: Record<RankedCivicArea["level"], string> = {
  low: "bg-emerald-600 ring-emerald-100",
  moderate: "bg-sky-600 ring-sky-100",
  high: "bg-amber-600 ring-amber-100",
  very_high: "bg-rose-600 ring-rose-100",
};

function getCoordinateBounds(areas: RankedCivicArea[]) {
  const latitudes = areas.map((area) => area.latitude);
  const longitudes = areas.map((area) => area.longitude);

  return {
    minLatitude: Math.min(...latitudes),
    maxLatitude: Math.max(...latitudes),
    minLongitude: Math.min(...longitudes),
    maxLongitude: Math.max(...longitudes),
  };
}

function coordinateToPosition(
  area: RankedCivicArea,
  bounds: ReturnType<typeof getCoordinateBounds>,
) {
  const longitudeRange = bounds.maxLongitude - bounds.minLongitude || 1;
  const latitudeRange = bounds.maxLatitude - bounds.minLatitude || 1;
  const x = ((area.longitude - bounds.minLongitude) / longitudeRange) * 80 + 10;
  const y =
    (1 - (area.latitude - bounds.minLatitude) / latitudeRange) * 80 + 10;

  return { x, y };
}

export function PriorityMap({ areas }: { areas: RankedCivicArea[] }) {
  const [selectedAreaId, setSelectedAreaId] = useState(areas[0]?.id ?? "");
  const bounds = useMemo(() => getCoordinateBounds(areas), [areas]);
  const selectedArea =
    areas.find((area) => area.id === selectedAreaId) ?? areas[0];

  if (!selectedArea) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 p-4">
        <span className="rounded-md bg-teal-50 p-2 text-teal-700">
          <MapPinned aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Priority map
          </h2>
          <p className="text-sm text-slate-500">Delhi area risk positions</p>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="relative aspect-[4/3] min-h-72 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:20%_20%]" />
          <div className="absolute inset-4 rounded-[40%_50%_45%_55%] border border-teal-200 bg-teal-50/60" />
          {areas.map((area) => {
            const { x, y } = coordinateToPosition(area, bounds);
            const isSelected = area.id === selectedArea.id;

            return (
              <button
                key={area.id}
                type="button"
                aria-label={`Select ${area.name}, score ${area.score}, ${levelLabel[area.level]} risk`}
                onClick={() => setSelectedAreaId(area.id)}
                onFocus={() => setSelectedAreaId(area.id)}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
                className={`absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm ring-4 transition-transform focus:outline-none focus:ring-slate-400 ${markerClass[area.level]} ${
                  isSelected ? "scale-110" : "hover:scale-105"
                }`}
              >
                {area.score}
              </button>
            );
          })}
        </div>

        <div
          role="region"
          aria-label="Selected map area"
          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-950">
                {selectedArea.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedArea.district}
              </p>
            </div>
            <span className="rounded-md bg-slate-950 px-2 py-1 text-sm font-semibold text-white">
              {selectedArea.score}
            </span>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700">
            {levelLabel[selectedArea.level]} risk
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {selectedArea.signals[0] ?? "No active signal"}
          </p>
        </div>
      </div>
    </section>
  );
}
