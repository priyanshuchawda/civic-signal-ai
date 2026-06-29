import { ClipboardList } from "lucide-react";
import type { OperatorAction } from "../../domain/recommendations";

const categoryLabel: Record<OperatorAction["category"], string> = {
  aqi: "AQI",
  heat: "Heat",
  complaints: "Complaints",
  access: "Access",
};

const priorityClass: Record<OperatorAction["priority"], string> = {
  urgent: "bg-rose-50 text-rose-800",
  high: "bg-amber-50 text-amber-800",
  watch: "bg-sky-50 text-sky-800",
};

export function ActionQueue({ actions }: { actions: OperatorAction[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 p-4">
        <span className="rounded-md bg-teal-50 p-2 text-teal-700">
          <ClipboardList aria-hidden="true" className="size-4" />
        </span>
        <h2 className="text-lg font-semibold text-slate-950">Action queue</h2>
      </div>

      {actions.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {actions.map((action) => (
            <article key={action.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-medium ${priorityClass[action.priority]}`}
                >
                  {action.priority}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {categoryLabel[action.category]}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-950">
                {action.targetArea}
              </p>
              <h3 className="mt-1 text-sm font-medium text-slate-800">
                {action.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {action.rationale}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                <span className="font-medium text-slate-950">Next step:</span>{" "}
                {action.nextStep}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="p-4 text-sm leading-6 text-slate-600">
          No elevated recommendations for the current area set.
        </p>
      )}
    </section>
  );
}
