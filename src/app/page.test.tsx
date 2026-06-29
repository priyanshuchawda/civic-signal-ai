// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLiveSignalDataset } from "../data/live-signals";
import Home from "./page";

vi.mock("server-only", () => ({}));
vi.mock("../data/live-signals", () => ({
  getLiveSignalDataset: vi.fn(async (areas) => ({
    areas,
    source: "fallback",
    refreshedAt: "2026-06-29T10:15:00.000Z",
    totalAreas: areas.length,
    fallbackAreaCount: areas.length,
  })),
}));

describe("Home page", () => {
  beforeEach(() => {
    vi.mocked(getLiveSignalDataset).mockClear();
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
    expect(
      screen.getByRole("heading", { name: "Priority map" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Local fallback")).toBeInTheDocument();
    expect(
      screen.getByText(/Anand Vihar has a risk score of 69/),
    ).toBeInTheDocument();
    expect(screen.getByText("Seed fallback")).toBeInTheDocument();
    expect(getLiveSignalDataset).toHaveBeenCalledOnce();
  });
});
