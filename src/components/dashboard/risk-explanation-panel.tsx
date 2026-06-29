import { Sparkles } from "lucide-react";
import type { ExplainRiskResult } from "../../ai/gemini";
import type { RankedCivicArea } from "../../data/dashboard";

const sourceLabel: Record<ExplainRiskResult["source"], string> = {
  gemini: "Gemini",
  fallback: "Local fallback",
};

const sourceClass: Record<ExplainRiskResult["source"], string> = {
  gemini: "bg-violet-50 text-violet-800",
  fallback: "bg-slate-100 text-slate-700",
};

export function RiskExplanationPanel({
  area,
  explanation,
}: {
  area: RankedCivicArea;
  explanation: ExplainRiskResult;
}) {
  return (
    <section
      aria-labelledby="risk-explanation-title"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-teal-50 p-2 text-teal-700">
            <Sparkles aria-hidden="true" className="size-4" />
          </span>
          <div>
            <h2
              id="risk-explanation-title"
              className="text-lg font-semibold text-slate-950"
            >
              Risk explanation
            </h2>
            <p className="text-sm text-slate-500">{area.name}</p>
          </div>
        </div>
        <span
          className={`rounded-md px-2 py-1 text-xs font-medium ${sourceClass[explanation.source]}`}
        >
          {sourceLabel[explanation.source]}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700">
        {explanation.text}
      </p>

      {area.reasons.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {area.reasons.slice(0, 4).map((reason) => (
            <li
              key={reason}
              className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600"
            >
              {reason}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
