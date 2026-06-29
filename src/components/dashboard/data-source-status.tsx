import { DatabaseZap } from "lucide-react";
import type { LiveSignalState } from "../../data/live-signals";

const sourceLabel: Record<LiveSignalState["source"], string> = {
  live: "Live data",
  partial: "Partial live data",
  fallback: "Seed fallback",
};

const sourceMessage: Record<LiveSignalState["source"], string> = {
  live: "Using Open-Meteo live signals",
  partial: "Some areas are using deterministic seed data",
  fallback: "Using deterministic seed data",
};

const sourceClass: Record<LiveSignalState["source"], string> = {
  live: "bg-emerald-50 text-emerald-800",
  partial: "bg-amber-50 text-amber-800",
  fallback: "bg-slate-100 text-slate-700",
};

function formatRefreshedAt(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DataSourceStatus({ state }: { state: LiveSignalState }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-teal-50 p-2 text-teal-700">
            <DatabaseZap aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-500">Data source</p>
            <p className="text-base font-semibold text-slate-950">
              {sourceLabel[state.source]}
            </p>
          </div>
        </div>
        <span
          className={`rounded-md px-2 py-1 text-xs font-medium ${sourceClass[state.source]}`}
        >
          {state.totalAreas} areas
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {sourceMessage[state.source]}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Refreshed {formatRefreshedAt(state.refreshedAt)}
      </p>
      {state.source === "partial" ? (
        <p className="mt-2 text-sm text-slate-500">
          {state.fallbackAreaCount} areas using seed fallback
        </p>
      ) : null}
    </section>
  );
}
