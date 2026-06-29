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
        "Explain this Delhi civic risk in plain language. Area: Anand Vihar. Score: 75. Reasons: AQI risk is very high.",
    });
  });
});
