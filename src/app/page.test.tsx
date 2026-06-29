// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("server-only", () => ({}));

describe("Home page", () => {
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
  });
});
