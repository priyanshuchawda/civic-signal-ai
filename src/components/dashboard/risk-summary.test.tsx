// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDashboardSummary } from "../../data/dashboard";
import { delhiSeedAreas } from "../../data/delhi-seed";
import { RiskSummary } from "./risk-summary";

describe("RiskSummary", () => {
  it("shows tracked areas, high risk areas, and average risk", () => {
    render(<RiskSummary summary={getDashboardSummary(delhiSeedAreas)} />);

    expect(screen.getByText("Tracked areas")).toBeInTheDocument();
    expect(screen.getByText("High risk areas")).toBeInTheDocument();
    expect(screen.getByText("Average risk")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
