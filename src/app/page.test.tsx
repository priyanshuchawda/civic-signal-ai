// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAreasWithLiveSignals } from "../data/live-signals";
import Home from "./page";

vi.mock("server-only", () => ({}));
vi.mock("../data/live-signals", () => ({
  getAreasWithLiveSignals: vi.fn(async (areas) => areas),
}));

describe("Home page", () => {
  beforeEach(() => {
    vi.mocked(getAreasWithLiveSignals).mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders a fallback risk explanation when Gemini is not configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("GEMINI_MODEL", "");

    render(await Home());

    expect(
      screen.getByRole("heading", { name: "Risk explanation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Local fallback")).toBeInTheDocument();
    expect(
      screen.getByText(/Anand Vihar has a risk score of 69/),
    ).toBeInTheDocument();
    expect(getAreasWithLiveSignals).toHaveBeenCalledOnce();
  });
});
