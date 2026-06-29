import { ChevronRight } from "lucide-react";
import type { RankedCivicArea } from "../../data/dashboard";

const levelLabel: Record<RankedCivicArea["level"], string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  very_high: "Very high",
};

const levelClass: Record<RankedCivicArea["level"], string> = {
  low: "bg-emerald-50 text-emerald-800",
  moderate: "bg-sky-50 text-sky-800",
  high: "bg-amber-50 text-amber-800",
  very_high: "bg-rose-50 text-rose-800",
};

export function AreaRanking({ areas }: { areas: RankedCivicArea[] }) {
  return (
    <section
      aria-label="Ranked Delhi areas"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-1 border-b border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-950">
          Priority areas
        </h2>
        <p className="text-sm leading-6 text-slate-500">
          Ranked by explainable civic risk score from AQI, weather, complaints,
          and service access.
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {areas.map((area, index) => (
          <article key={area.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-400">
                  #{index + 1}
                </span>
                <h3 className="text-base font-semibold text-slate-950">
                  {area.name}
                </h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${levelClass[area.level]}`}
                >
                  {levelLabel[area.level]}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{area.district}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {area.signals.map((signal) => (
                  <li
                    key={signal}
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                  >
                    {signal}
                  </li>
                ))}
              </ul>
              {area.reasons.length > 0 ? (
                <p className="mt-3 flex items-center gap-1 text-sm text-slate-600">
                  <ChevronRight aria-hidden="true" className="size-4" />
                  {area.reasons[0]}
                </p>
              ) : null}
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xl font-semibold text-white">
              {area.score}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
