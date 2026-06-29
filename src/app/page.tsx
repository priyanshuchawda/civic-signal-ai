import { AreaRanking } from "../components/dashboard/area-ranking";
import { RiskSummary } from "../components/dashboard/risk-summary";
import { RiskExplanationPanel } from "../components/dashboard/risk-explanation-panel";
import { ActionQueue } from "../components/dashboard/action-queue";
import { ComplaintIntake } from "../components/complaints/complaint-intake";
import { explainRisk } from "../ai/gemini";
import { getDashboardSummary } from "../data/dashboard";
import { delhiSeedAreas } from "../data/delhi-seed";
import { generateOperatorActions } from "../domain/recommendations";

export const dynamic = "force-dynamic";

export default async function Home() {
  const summary = getDashboardSummary(delhiSeedAreas);
  const topArea = summary.areas[0];
  const operatorActions = generateOperatorActions(summary.areas);
  const topAreaExplanation = topArea
    ? await explainRisk({
        apiKey: process.env.GEMINI_API_KEY || undefined,
        model: process.env.GEMINI_MODEL || undefined,
        areaName: topArea.name,
        score: topArea.score,
        reasons: topArea.reasons,
      })
    : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="grid gap-5 border-b border-slate-200 pb-6 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-700">
              Delhi-first civic intelligence
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              CivicSignal AI
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              A risk and action workspace for air quality, weather, civic
              complaints, public facilities, and service access.
            </p>
          </div>
          {topArea ? (
            <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Highest priority today
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-950">
                    {topArea.name}
                  </p>
                  <p className="text-sm text-slate-500">{topArea.district}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-rose-600 text-lg font-semibold text-white">
                  {topArea.score}
                </div>
              </div>
            </aside>
          ) : null}
        </header>

        <RiskSummary summary={summary} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            {topArea && topAreaExplanation ? (
              <RiskExplanationPanel
                area={topArea}
                explanation={topAreaExplanation}
              />
            ) : null}
            <AreaRanking areas={summary.areas} />
          </div>
          <div className="space-y-6">
            <ComplaintIntake areas={delhiSeedAreas} />
            <ActionQueue actions={operatorActions} />
          </div>
        </div>
      </div>
    </main>
  );
}
