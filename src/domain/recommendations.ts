import type { RankedCivicArea } from "../data/dashboard";

export type OperatorActionCategory = "aqi" | "heat" | "complaints" | "access";
export type OperatorActionPriority = "urgent" | "high" | "watch";

export type OperatorAction = {
  id: string;
  category: OperatorActionCategory;
  priority: OperatorActionPriority;
  targetArea: string;
  title: string;
  rationale: string;
  nextStep: string;
};

type ActionTemplate = {
  category: OperatorActionCategory;
  title: string;
  nextStep: string;
  match: RegExp;
};

const actionTemplates: ActionTemplate[] = [
  {
    category: "aqi",
    title: "Air quality field check",
    nextStep: "Coordinate an air quality check and exposure advisory.",
    match: /\b(aqi|air quality|traffic|pollution)\b/i,
  },
  {
    category: "heat",
    title: "Heat-risk outreach",
    nextStep: "Prepare heat-risk outreach for vulnerable facilities.",
    match: /\b(weather|heat|temperature)\b/i,
  },
  {
    category: "complaints",
    title: "Complaint cluster triage",
    nextStep: "Triage the complaint cluster with the responsible ward team.",
    match: /\b(complaint|waste|sanitation|garbage)\b/i,
  },
  {
    category: "access",
    title: "Service access check",
    nextStep: "Check service access constraints before field deployment.",
    match: /\b(access|hospital|transit)\b/i,
  },
];

function priorityForArea(area: RankedCivicArea): OperatorActionPriority {
  if (area.level === "very_high") {
    return "urgent";
  }

  if (area.level === "high") {
    return "high";
  }

  return "watch";
}

function findRationale(area: RankedCivicArea, template: ActionTemplate) {
  return (
    area.reasons.find((reason) => template.match.test(reason)) ??
    area.signals.find((signal) => template.match.test(signal)) ??
    area.reasons[0] ??
    area.signals[0] ??
    `Risk score is ${area.score}`
  );
}

export function generateOperatorActions(
  areas: RankedCivicArea[],
  limit = 5,
): OperatorAction[] {
  return areas
    .flatMap((area) =>
      actionTemplates
        .filter((template) =>
          [...area.reasons, ...area.signals].some((value) =>
            template.match.test(value),
          ),
        )
        .map((template) => ({
          id: `${area.id}-${template.category}`,
          category: template.category,
          priority: priorityForArea(area),
          targetArea: area.name,
          title: template.title,
          rationale: findRationale(area, template),
          nextStep: template.nextStep,
          score: area.score,
        })),
    )
    .toSorted((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((action) => ({
      id: action.id,
      category: action.category,
      priority: action.priority,
      targetArea: action.targetArea,
      title: action.title,
      rationale: action.rationale,
      nextStep: action.nextStep,
    }));
}
