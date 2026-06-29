import { Activity, AlertTriangle, MapPinned } from "lucide-react";
import type { DashboardSummary } from "../../data/dashboard";

const tiles = [
  {
    key: "totalAreas",
    label: "Tracked areas",
    description: "Delhi localities in the current model",
    icon: MapPinned,
    tone: "text-teal-700 bg-teal-50",
  },
  {
    key: "highRiskAreas",
    label: "High risk areas",
    description: "Areas needing near-term attention",
    icon: AlertTriangle,
    tone: "text-amber-700 bg-amber-50",
  },
  {
    key: "averageRiskScore",
    label: "Average risk",
    description: "Citywide planning signal",
    icon: Activity,
    tone: "text-sky-700 bg-sky-50",
  },
] as const;

export function RiskSummary({ summary }: { summary: DashboardSummary }) {
  return (
    <section aria-label="Risk summary" className="grid gap-3 md:grid-cols-3">
      {tiles.map((tile) => {
        const Icon = tile.icon;

        return (
          <div
            key={tile.key}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {tile.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {summary[tile.key]}
                </p>
              </div>
              <span className={`rounded-md p-2 ${tile.tone}`}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {tile.description}
            </p>
          </div>
        );
      })}
    </section>
  );
}
