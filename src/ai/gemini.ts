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

type GenerateContentClient = {
  models: {
    generateContent: (request: {
      model: string;
      contents: string;
    }) => Promise<{ text?: string }>;
  };
};

const defaultModel = "gemini-2.5-flash";

function buildRiskPrompt(input: ExplainRiskInput) {
  const reasons = input.reasons.join("; ") || "no major elevated signals";

  return `Explain this Delhi civic risk in plain language. Area: ${input.areaName}. Score: ${input.score}. Reasons: ${reasons}.`;
}

function fallbackExplanation(input: ExplainRiskInput): ExplainRiskResult {
  return {
    source: "fallback",
    text: `${input.areaName} has a risk score of ${input.score}. Main signals: ${input.reasons.join(", ") || "no major elevated signals"}.`,
  };
}

async function createGeminiClient(apiKey: string): Promise<GenerateContentClient> {
  const { GoogleGenAI } = await import("@google/genai");

  return new GoogleGenAI({ apiKey });
}

export async function explainRisk(
  input: ExplainRiskInput,
  injectedClient?: GenerateContentClient,
): Promise<ExplainRiskResult> {
  if (!input.apiKey && !injectedClient) {
    return fallbackExplanation(input);
  }

  const client = injectedClient ?? (await createGeminiClient(input.apiKey ?? ""));
  const response = await client.models.generateContent({
    model: input.model || defaultModel,
    contents: buildRiskPrompt(input),
  });

  return {
    source: "gemini",
    text: response.text || fallbackExplanation(input).text,
  };
}
