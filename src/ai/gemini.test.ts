import { describe, expect, it, vi } from "vitest";
import { explainRisk } from "./gemini";

vi.mock("server-only", () => ({}));

describe("explainRisk", () => {
  it("returns fallback explanation when api key is missing", async () => {
    const result = await explainRisk({
      apiKey: "",
      model: "gemini-2.5-flash",
      areaName: "Anand Vihar",
      score: 75,
      reasons: ["AQI risk is very high"],
    });

    expect(result.source).toBe("fallback");
    expect(result.text).toContain("Anand Vihar");
    expect(result.text).toContain("AQI risk is very high");
  });

  it("uses an injected Gemini client when api key is present", async () => {
    const generateContent = vi.fn().mockResolvedValue({
      text: "Anand Vihar needs reduced outdoor exposure and sanitation action.",
    });

    const result = await explainRisk(
      {
        apiKey: "test-key",
        model: "gemini-2.5-flash",
        areaName: "Anand Vihar",
        score: 75,
        reasons: ["AQI risk is very high"],
      },
      { models: { generateContent } },
    );

    expect(result).toEqual({
      source: "gemini",
      text: "Anand Vihar needs reduced outdoor exposure and sanitation action.",
    });
    expect(generateContent).toHaveBeenCalledWith({
      model: "gemini-2.5-flash",
      contents:
        "Explain this Delhi civic risk in plain language for an operator dashboard. Use only the provided signals. Do not add outside facts, markdown, bullets, or recommendations. Keep it to two short sentences. Area: Anand Vihar. Score: 75. Signals: AQI risk is very high.",
      config: {
        maxOutputTokens: 160,
        temperature: 0.2,
      },
    });
  });

  it("uses the current Flash-Lite model by default", async () => {
    const generateContent = vi.fn().mockResolvedValue({
      text: "Prioritize Anand Vihar because AQI risk is very high.",
    });

    await explainRisk(
      {
        areaName: "Anand Vihar",
        score: 75,
        reasons: ["AQI risk is very high"],
      },
      { models: { generateContent } },
    );

    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-3.1-flash-lite",
      }),
    );
  });

  it("falls back when the Gemini request fails", async () => {
    const generateContent = vi.fn().mockRejectedValue(new Error("quota"));

    const result = await explainRisk(
      {
        apiKey: "test-key",
        areaName: "Anand Vihar",
        score: 75,
        reasons: ["AQI risk is very high"],
      },
      { models: { generateContent } },
    );

    expect(result.source).toBe("fallback");
    expect(result.text).toContain("Anand Vihar");
    expect(result.text).toContain("AQI risk is very high");
  });
});
