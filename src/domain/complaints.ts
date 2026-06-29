export type ComplaintCategory =
  | "waste"
  | "water"
  | "road"
  | "streetlight"
  | "safety"
  | "drainage"
  | "health"
  | "other";

export type ComplaintUrgency = "low" | "medium" | "high";

export type ComplaintClassification = {
  category: ComplaintCategory;
  urgency: ComplaintUrgency;
  department: string;
  reasons: string[];
};

const categoryRules: Array<{
  category: ComplaintCategory;
  department: string;
  keywords: string[];
}> = [
  {
    category: "waste",
    department: "MCD sanitation",
    keywords: ["garbage", "trash", "dump", "dead animal", "waste"],
  },
  {
    category: "water",
    department: "Delhi Jal Board",
    keywords: ["dirty water", "no water", "leakage", "pipeline"],
  },
  {
    category: "road",
    department: "Public works",
    keywords: ["pothole", "footpath", "road broken", "damaged road"],
  },
  {
    category: "streetlight",
    department: "Street lighting",
    keywords: ["streetlight", "light not working", "dark street"],
  },
  {
    category: "safety",
    department: "Local safety desk",
    keywords: ["unsafe", "harassment", "broken cctv"],
  },
  {
    category: "drainage",
    department: "Drainage maintenance",
    keywords: ["sewage", "drain", "waterlogging", "mosquito"],
  },
  {
    category: "health",
    department: "Public health",
    keywords: ["disease", "fever", "clinic"],
  },
];

const sensitivePlaceKeywords = ["school", "hospital", "clinic"];
const highUrgencyKeywords = [
  "sewage",
  "electric",
  "fire",
  "accident",
  "flood",
  "contaminated",
];

function findMatchingRule(text: string) {
  for (const rule of categoryRules) {
    const matchedKeyword = rule.keywords.find((keyword) =>
      text.includes(keyword),
    );

    if (matchedKeyword) {
      return { rule, matchedKeyword };
    }
  }

  return null;
}

export function classifyComplaint(text: string): ComplaintClassification {
  const normalized = text.toLowerCase();
  const match = findMatchingRule(normalized);
  const hasSensitivePlace = sensitivePlaceKeywords.some((keyword) =>
    normalized.includes(keyword),
  );
  const hasHighUrgencyTerm = highUrgencyKeywords.some((keyword) =>
    normalized.includes(keyword),
  );

  const reasons: string[] = [];

  if (match) {
    reasons.push(`matched ${match.rule.category} keyword`);
  }

  if (hasSensitivePlace) {
    reasons.push("sensitive place mentioned");
  }

  if (hasHighUrgencyTerm) {
    reasons.push("high-risk issue mentioned");
  }

  let urgency: ComplaintUrgency = "low";

  if (hasHighUrgencyTerm || hasSensitivePlace) {
    urgency = "high";
  } else if (match) {
    urgency = "medium";
  }

  return {
    category: match?.rule.category ?? "other",
    department: match?.rule.department ?? "Civic helpdesk",
    urgency,
    reasons,
  };
}
