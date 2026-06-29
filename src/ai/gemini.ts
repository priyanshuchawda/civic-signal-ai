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
      config?: {
        maxOutputTokens?: number;
        temperature?: number;
      };
    }) => Promise<{ text?: string }>;
  };
};

const defaultModel = "gemini-3.1-flash-lite";

function buildRiskPrompt(input: ExplainRiskInput) {
  const reasons = input.reasons.join("; ") || "no major elevated signals";

  return `Explain this Delhi civic risk in plain language for an operator dashboard. Use only the provided signals. Do not add outside facts, markdown, bullets, or recommendations. Keep it to two short sentences. Area: ${input.areaName}. Score: ${input.score}. Signals: ${reasons}.`;
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

  try {
    const client =
      injectedClient ?? (await createGeminiClient(input.apiKey ?? ""));
    const response = await client.models.generateContent({
      model: input.model || defaultModel,
      contents: buildRiskPrompt(input),
      config: {
        maxOutputTokens: 160,
        temperature: 0.2,
      },
    });
    const text = response.text?.trim();

    if (!text) {
      return fallbackExplanation(input);
    }

    return {
      source: "gemini",
      text,
    };
  } catch {
    return fallbackExplanation(input);
  }
}
