# Product Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working CivicSignal AI foundation: a Next.js app with tested risk scoring, Delhi seed data, a basic dashboard, complaint classification fallback, and Gemini-ready AI boundaries.

**Architecture:** Keep domain logic in pure TypeScript modules with Vitest coverage before UI work. Use Next.js App Router with Server Components for dashboard reads and client components only for interactive controls. Store initial data as seed JSON so the product works without paid infrastructure or external data setup.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Vitest, Testing Library, Leaflet later, `@google/genai` behind a server-only adapter.

---

## File Structure

- `package.json`: scripts and dependencies.
- `src/domain/risk.ts`: pure risk score types and calculation.
- `src/domain/risk.test.ts`: risk scoring tests.
- `src/domain/complaints.ts`: complaint category and urgency fallback classifier.
- `src/domain/complaints.test.ts`: complaint classifier tests.
- `src/domain/privacy.ts`: AI input sanitizer.
- `src/domain/privacy.test.ts`: sanitizer tests.
- `src/data/delhi-seed.ts`: small typed seed dataset for first dashboard.
- `src/data/dashboard.ts`: aggregation helpers for dashboard cards and ranked areas.
- `src/data/dashboard.test.ts`: aggregation tests.
- `src/ai/gemini.ts`: server-only Gemini adapter with missing-key fallback.
- `src/ai/gemini.test.ts`: Gemini adapter behavior tests with injected fake client.
- `src/app/layout.tsx`: root layout and metadata.
- `src/app/page.tsx`: dashboard shell.
- `src/app/globals.css`: Tailwind theme and base styles.
- `src/components/dashboard/*`: dashboard UI components.
- `src/components/complaints/*`: complaint form UI.
- `docs/workflow.md`: issue, branch, PR, merge, and branch deletion process.
- `.env.example`: environment variables including `GEMINI_API_KEY`.

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Create a branch**

Run:

```bash
git checkout -b feat/3-project-foundation
```

Expected: branch switches to `feat/3-project-foundation`.

- [ ] **Step 2: Install the app scaffold**

Run:

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Expected: Next.js files are created in the repository root.

- [ ] **Step 3: Add test dependencies**

Run:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Expected: packages install without security-blocking errors.

- [ ] **Step 4: Add Gemini and map dependencies**

Run:

```bash
npm install @google/genai leaflet react-leaflet lucide-react clsx tailwind-merge zod
```

Expected: packages install without security-blocking errors.

- [ ] **Step 5: Configure scripts in `package.json`**

Set scripts to:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Expected: `npm test` runs Vitest after tests are added.

- [ ] **Step 6: Add `.env.example`**

```text
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
```

Expected: real secrets are not committed.

- [ ] **Step 7: Commit scaffold**

Run:

```bash
git add .
git commit -m "chore: scaffold project foundation"
```

Expected: one scaffold commit exists on the branch.

## Task 2: Risk Scoring Domain

**Files:**
- Create: `src/domain/risk.test.ts`
- Create: `src/domain/risk.ts`

- [ ] **Step 1: Write failing tests**

Create `src/domain/risk.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateRiskScore } from "./risk";

describe("calculateRiskScore", () => {
  it("calculates a weighted risk score and level", () => {
    const result = calculateRiskScore({
      aqiRisk: 90,
      weatherRisk: 60,
      complaintRisk: 80,
      schoolExposureRisk: 70,
      hospitalAccessRisk: 50,
      transitAccessRisk: 30,
    });

    expect(result.score).toBe(70);
    expect(result.level).toBe("high");
    expect(result.reasons).toContain("AQI risk is very high");
    expect(result.reasons).toContain("Complaint risk is high");
  });

  it("clamps invalid factors into the 0 to 100 range", () => {
    const result = calculateRiskScore({
      aqiRisk: 140,
      weatherRisk: -10,
      complaintRisk: 0,
      schoolExposureRisk: 0,
      hospitalAccessRisk: 0,
      transitAccessRisk: 0,
    });

    expect(result.score).toBe(30);
    expect(result.level).toBe("moderate");
  });
});
```

- [ ] **Step 2: Run test and verify red**

Run:

```bash
npm test -- src/domain/risk.test.ts
```

Expected: FAIL because `src/domain/risk.ts` does not exist.

- [ ] **Step 3: Implement risk scoring**

Create `src/domain/risk.ts`:

```ts
export type RiskLevel = "low" | "moderate" | "high" | "very_high";

export type RiskFactors = {
  aqiRisk: number;
  weatherRisk: number;
  complaintRisk: number;
  schoolExposureRisk: number;
  hospitalAccessRisk: number;
  transitAccessRisk: number;
};

export type RiskScore = {
  score: number;
  level: RiskLevel;
  reasons: string[];
};

const weights: Record<keyof RiskFactors, number> = {
  aqiRisk: 0.3,
  weatherRisk: 0.2,
  complaintRisk: 0.2,
  schoolExposureRisk: 0.1,
  hospitalAccessRisk: 0.1,
  transitAccessRisk: 0.1,
};

function clampFactor(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function levelForScore(score: number): RiskLevel {
  if (score >= 75) return "very_high";
  if (score >= 50) return "high";
  if (score >= 25) return "moderate";
  return "low";
}

function describeFactor(label: string, value: number) {
  if (value >= 75) return `${label} is very high`;
  if (value >= 50) return `${label} is high`;
  return null;
}

export function calculateRiskScore(factors: RiskFactors): RiskScore {
  const normalized = Object.fromEntries(
    Object.entries(factors).map(([key, value]) => [key, clampFactor(value)]),
  ) as RiskFactors;

  const score = Math.round(
    Object.entries(weights).reduce((total, [key, weight]) => {
      return total + normalized[key as keyof RiskFactors] * weight;
    }, 0),
  );

  const reasons = [
    describeFactor("AQI risk", normalized.aqiRisk),
    describeFactor("Weather risk", normalized.weatherRisk),
    describeFactor("Complaint risk", normalized.complaintRisk),
    describeFactor("School exposure risk", normalized.schoolExposureRisk),
    describeFactor("Hospital access risk", normalized.hospitalAccessRisk),
    describeFactor("Transit access risk", normalized.transitAccessRisk),
  ].filter((reason): reason is string => Boolean(reason));

  return {
    score,
    level: levelForScore(score),
    reasons,
  };
}
```

- [ ] **Step 4: Run test and verify green**

Run:

```bash
npm test -- src/domain/risk.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/domain/risk.ts src/domain/risk.test.ts
git commit -m "feat: add explainable risk scoring"
```

Expected: one domain commit exists.

## Task 3: Complaint Fallback Classifier

**Files:**
- Create: `src/domain/complaints.test.ts`
- Create: `src/domain/complaints.ts`

- [ ] **Step 1: Write failing tests**

Create `src/domain/complaints.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { classifyComplaint } from "./complaints";

describe("classifyComplaint", () => {
  it("routes garbage issues to sanitation with medium urgency", () => {
    const result = classifyComplaint("Garbage has not been collected near the market for three days");

    expect(result.category).toBe("waste");
    expect(result.department).toBe("MCD sanitation");
    expect(result.urgency).toBe("medium");
  });

  it("raises urgency for sewage near a school", () => {
    const result = classifyComplaint("Open sewage and mosquitoes outside a school gate");

    expect(result.category).toBe("drainage");
    expect(result.urgency).toBe("high");
    expect(result.reasons).toContain("sensitive place mentioned");
  });
});
```

- [ ] **Step 2: Run test and verify red**

Run:

```bash
npm test -- src/domain/complaints.test.ts
```

Expected: FAIL because `src/domain/complaints.ts` does not exist.

- [ ] **Step 3: Implement classifier**

Create `src/domain/complaints.ts`:

```ts
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
  { category: "waste", department: "MCD sanitation", keywords: ["garbage", "trash", "dump", "dead animal"] },
  { category: "water", department: "Delhi Jal Board", keywords: ["dirty water", "no water", "leakage", "pipeline"] },
  { category: "road", department: "Public works", keywords: ["pothole", "footpath", "road broken", "damaged road"] },
  { category: "streetlight", department: "Street lighting", keywords: ["streetlight", "light not working", "dark street"] },
  { category: "safety", department: "Local safety desk", keywords: ["unsafe", "harassment", "broken cctv"] },
  { category: "drainage", department: "Drainage maintenance", keywords: ["sewage", "drain", "waterlogging", "mosquito"] },
  { category: "health", department: "Public health", keywords: ["mosquito", "disease", "fever", "clinic"] },
];

const sensitivePlaceKeywords = ["school", "hospital", "clinic", "market", "metro station", "bus stop"];
const highUrgencyKeywords = ["sewage", "electric", "fire", "accident", "flood", "contaminated"];

export function classifyComplaint(text: string): ComplaintClassification {
  const normalized = text.toLowerCase();
  const matchedRule = categoryRules.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  );

  const reasons: string[] = [];
  const hasSensitivePlace = sensitivePlaceKeywords.some((keyword) => normalized.includes(keyword));
  const hasHighUrgencyTerm = highUrgencyKeywords.some((keyword) => normalized.includes(keyword));

  if (hasSensitivePlace) reasons.push("sensitive place mentioned");
  if (hasHighUrgencyTerm) reasons.push("high-risk issue mentioned");

  let urgency: ComplaintUrgency = "low";
  if (hasHighUrgencyTerm || hasSensitivePlace) urgency = "high";
  else if (matchedRule) urgency = "medium";

  return {
    category: matchedRule?.category ?? "other",
    department: matchedRule?.department ?? "Civic helpdesk",
    urgency,
    reasons,
  };
}
```

- [ ] **Step 4: Run test and verify green**

Run:

```bash
npm test -- src/domain/complaints.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/domain/complaints.ts src/domain/complaints.test.ts
git commit -m "feat: add complaint fallback classifier"
```

Expected: one classifier commit exists.

## Task 4: Privacy Sanitizer

**Files:**
- Create: `src/domain/privacy.test.ts`
- Create: `src/domain/privacy.ts`

- [ ] **Step 1: Write failing tests**

Create `src/domain/privacy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { sanitizeForAi } from "./privacy";

describe("sanitizeForAi", () => {
  it("removes phone numbers and email addresses", () => {
    const result = sanitizeForAi("Call me at 9876543210 or test@example.com about garbage");

    expect(result).toBe("Call me at [phone] or [email] about garbage");
  });

  it("compresses extra whitespace", () => {
    const result = sanitizeForAi("Garbage    near\n\nmarket");

    expect(result).toBe("Garbage near market");
  });
});
```

- [ ] **Step 2: Run test and verify red**

Run:

```bash
npm test -- src/domain/privacy.test.ts
```

Expected: FAIL because `src/domain/privacy.ts` does not exist.

- [ ] **Step 3: Implement sanitizer**

Create `src/domain/privacy.ts`:

```ts
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const indiaPhonePattern = /(?<!\d)(?:\+?91[\s-]?)?[6-9]\d{9}(?!\d)/g;

export function sanitizeForAi(input: string): string {
  return input
    .replace(emailPattern, "[email]")
    .replace(indiaPhonePattern, "[phone]")
    .replace(/\s+/g, " ")
    .trim();
}
```

- [ ] **Step 4: Run test and verify green**

Run:

```bash
npm test -- src/domain/privacy.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/domain/privacy.ts src/domain/privacy.test.ts
git commit -m "feat: sanitize ai inputs"
```

Expected: one privacy commit exists.

## Task 5: Seed Dashboard Data

**Files:**
- Create: `src/data/delhi-seed.ts`
- Create: `src/data/dashboard.test.ts`
- Create: `src/data/dashboard.ts`

- [ ] **Step 1: Write failing aggregation test**

Create `src/data/dashboard.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getDashboardSummary } from "./dashboard";
import { delhiSeedAreas } from "./delhi-seed";

describe("getDashboardSummary", () => {
  it("returns ranked areas and summary counts", () => {
    const summary = getDashboardSummary(delhiSeedAreas);

    expect(summary.areas[0]?.name).toBe("Anand Vihar");
    expect(summary.totalAreas).toBe(5);
    expect(summary.highRiskAreas).toBeGreaterThan(0);
    expect(summary.averageRiskScore).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test and verify red**

Run:

```bash
npm test -- src/data/dashboard.test.ts
```

Expected: FAIL because data modules do not exist.

- [ ] **Step 3: Add seed data**

Create `src/data/delhi-seed.ts`:

```ts
import type { RiskFactors } from "@/domain/risk";

export type CivicArea = {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  factors: RiskFactors;
  signals: string[];
};

export const delhiSeedAreas: CivicArea[] = [
  {
    id: "anand-vihar",
    name: "Anand Vihar",
    district: "East Delhi",
    latitude: 28.6469,
    longitude: 77.316,
    factors: { aqiRisk: 92, weatherRisk: 62, complaintRisk: 78, schoolExposureRisk: 68, hospitalAccessRisk: 45, transitAccessRisk: 25 },
    signals: ["High AQI corridor", "Transit hub exposure", "Repeated waste complaints"],
  },
  {
    id: "lajpat-nagar",
    name: "Lajpat Nagar",
    district: "South East Delhi",
    latitude: 28.5677,
    longitude: 77.2433,
    factors: { aqiRisk: 64, weatherRisk: 74, complaintRisk: 82, schoolExposureRisk: 52, hospitalAccessRisk: 30, transitAccessRisk: 20 },
    signals: ["Market crowding", "Heat stress", "Sanitation complaints"],
  },
  {
    id: "dwarka",
    name: "Dwarka",
    district: "South West Delhi",
    latitude: 28.5921,
    longitude: 77.046,
    factors: { aqiRisk: 52, weatherRisk: 70, complaintRisk: 34, schoolExposureRisk: 40, hospitalAccessRisk: 42, transitAccessRisk: 18 },
    signals: ["Heat risk", "Moderate AQI"],
  },
  {
    id: "karol-bagh",
    name: "Karol Bagh",
    district: "Central Delhi",
    latitude: 28.6514,
    longitude: 77.1907,
    factors: { aqiRisk: 70, weatherRisk: 58, complaintRisk: 55, schoolExposureRisk: 45, hospitalAccessRisk: 25, transitAccessRisk: 16 },
    signals: ["Dense commercial area", "Traffic exposure"],
  },
  {
    id: "rohini",
    name: "Rohini",
    district: "North West Delhi",
    latitude: 28.7432,
    longitude: 77.0672,
    factors: { aqiRisk: 46, weatherRisk: 65, complaintRisk: 28, schoolExposureRisk: 35, hospitalAccessRisk: 38, transitAccessRisk: 35 },
    signals: ["Moderate heat risk", "Lower complaint pressure"],
  },
];
```

- [ ] **Step 4: Add dashboard aggregation**

Create `src/data/dashboard.ts`:

```ts
import { calculateRiskScore } from "@/domain/risk";
import type { CivicArea } from "./delhi-seed";

export type RankedCivicArea = CivicArea & ReturnType<typeof calculateRiskScore>;

export type DashboardSummary = {
  totalAreas: number;
  highRiskAreas: number;
  averageRiskScore: number;
  areas: RankedCivicArea[];
};

export function getDashboardSummary(areas: CivicArea[]): DashboardSummary {
  const rankedAreas = areas
    .map((area) => ({
      ...area,
      ...calculateRiskScore(area.factors),
    }))
    .toSorted((a, b) => b.score - a.score);

  const totalScore = rankedAreas.reduce((sum, area) => sum + area.score, 0);

  return {
    totalAreas: rankedAreas.length,
    highRiskAreas: rankedAreas.filter((area) => area.level === "high" || area.level === "very_high").length,
    averageRiskScore: rankedAreas.length === 0 ? 0 : Math.round(totalScore / rankedAreas.length),
    areas: rankedAreas,
  };
}
```

- [ ] **Step 5: Run test and verify green**

Run:

```bash
npm test -- src/data/dashboard.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/data src/domain
git commit -m "feat: add delhi seed dashboard data"
```

Expected: one data commit exists.

## Task 6: Gemini Adapter Boundary

**Files:**
- Create: `src/ai/gemini.test.ts`
- Create: `src/ai/gemini.ts`

- [ ] **Step 1: Write failing tests**

Create `src/ai/gemini.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { explainRisk } from "./gemini";

describe("explainRisk", () => {
  it("returns fallback explanation when api key is missing", async () => {
    const result = await explainRisk({
      apiKey: "",
      model: "gemini-3.5-flash",
      areaName: "Anand Vihar",
      score: 70,
      reasons: ["AQI risk is very high"],
    });

    expect(result.source).toBe("fallback");
    expect(result.text).toContain("Anand Vihar");
    expect(result.text).toContain("AQI risk is very high");
  });
});
```

- [ ] **Step 2: Run test and verify red**

Run:

```bash
npm test -- src/ai/gemini.test.ts
```

Expected: FAIL because `src/ai/gemini.ts` does not exist.

- [ ] **Step 3: Implement fallback-first adapter**

Create `src/ai/gemini.ts`:

```ts
import "server-only";

export type ExplainRiskInput = {
  apiKey?: string;
  model?: string;
  areaName: string;
  score: number;
  reasons: string[];
};

export type ExplainRiskResult = {
  source: "gemini" | "fallback";
  text: string;
};

export async function explainRisk(input: ExplainRiskInput): Promise<ExplainRiskResult> {
  if (!input.apiKey) {
    return {
      source: "fallback",
      text: `${input.areaName} has a risk score of ${input.score}. Main signals: ${input.reasons.join(", ") || "no major elevated signals"}.`,
    };
  }

  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: input.apiKey });
  const response = await ai.models.generateContent({
    model: input.model || "gemini-3.5-flash",
    contents: `Explain this Delhi civic risk in plain language. Area: ${input.areaName}. Score: ${input.score}. Reasons: ${input.reasons.join("; ")}.`,
  });

  return {
    source: "gemini",
    text: response.text || "AI explanation was unavailable.",
  };
}
```

- [ ] **Step 4: Install server-only package if needed**

Run:

```bash
npm install server-only
```

Expected: package installs if it is not already present.

- [ ] **Step 5: Run test and verify green**

Run:

```bash
npm test -- src/ai/gemini.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/ai package.json package-lock.json
git commit -m "feat: add gemini explanation boundary"
```

Expected: one AI boundary commit exists.

## Task 7: Dashboard UI

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/dashboard/risk-summary.tsx`
- Create: `src/components/dashboard/area-ranking.tsx`

- [ ] **Step 1: Build server-rendered dashboard page**

Set `src/app/page.tsx` to:

```tsx
import { AreaRanking } from "@/components/dashboard/area-ranking";
import { RiskSummary } from "@/components/dashboard/risk-summary";
import { delhiSeedAreas } from "@/data/delhi-seed";
import { getDashboardSummary } from "@/data/dashboard";

export default function Home() {
  const summary = getDashboardSummary(delhiSeedAreas);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">Delhi-first civic intelligence</p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            CivicSignal AI
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            A risk and action workspace for air quality, weather, civic complaints, public facilities, and service access.
          </p>
        </header>
        <RiskSummary summary={summary} />
        <AreaRanking areas={summary.areas} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Add summary component**

Create `src/components/dashboard/risk-summary.tsx`:

```tsx
import type { DashboardSummary } from "@/data/dashboard";

export function RiskSummary({ summary }: { summary: DashboardSummary }) {
  return (
    <section aria-label="Risk summary" className="grid gap-3 sm:grid-cols-3">
      <SummaryTile label="Tracked areas" value={summary.totalAreas.toString()} />
      <SummaryTile label="High risk areas" value={summary.highRiskAreas.toString()} />
      <SummaryTile label="Average risk" value={summary.averageRiskScore.toString()} />
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
```

- [ ] **Step 3: Add ranking component**

Create `src/components/dashboard/area-ranking.tsx`:

```tsx
import type { RankedCivicArea } from "@/data/dashboard";

const levelLabel: Record<RankedCivicArea["level"], string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  very_high: "Very high",
};

export function AreaRanking({ areas }: { areas: RankedCivicArea[] }) {
  return (
    <section aria-label="Ranked Delhi areas" className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-950">Priority areas</h2>
        <p className="text-sm text-slate-500">Ranked by explainable civic risk score.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {areas.map((area) => (
          <article key={area.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-slate-950">{area.name}</h3>
                <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800">
                  {levelLabel[area.level]}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{area.district}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {area.signals.map((signal) => (
                  <li key={signal} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-950 text-xl font-semibold text-white">
              {area.score}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run verification**

Run:

```bash
npm test
npm run build
```

Expected: tests pass and production build succeeds.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/app src/components
git commit -m "feat: add first civic dashboard"
```

Expected: one UI commit exists.

## Task 8: Workflow Documentation

**Files:**
- Create: `docs/workflow.md`

- [ ] **Step 1: Create workflow documentation**

Create `docs/workflow.md`:

```md
# Development Workflow

## Rules

- Work starts from a GitHub issue.
- Each issue gets one branch.
- Each branch gets one pull request.
- Pull requests merge into `main`.
- Delete merged branches.
- Do not add GitHub Actions until the final project phase.

## Branch Naming

```text
feat/<issue-number>-short-description
```

## Local Flow

```bash
git checkout main
git pull
git checkout -b feat/<issue-number>-short-description
npm test
npm run build
git add .
git commit -m "<type>: <short outcome>"
git push -u origin feat/<issue-number>-short-description
gh pr create --draft --title "<type>: <short outcome>" --body "Closes #<number>"
```

## Merge Flow

```bash
gh pr merge <number> --squash --delete-branch
git checkout main
git pull
```
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/workflow.md
git commit -m "docs: document issue to pr workflow"
```

Expected: workflow docs are committed.

## Final Verification

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Open the app locally with `npm run dev`.
- [ ] Confirm dashboard loads at `http://localhost:3000`.
- [ ] Confirm no secret values are committed.
- [ ] Push branch and open a PR linked to the issue.
