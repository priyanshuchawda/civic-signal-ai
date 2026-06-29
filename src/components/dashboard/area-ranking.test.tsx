// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDashboardSummary } from "../../data/dashboard";
import { delhiSeedAreas } from "../../data/delhi-seed";
import { AreaRanking } from "./area-ranking";

describe("AreaRanking", () => {
  it("renders ranked Delhi areas with scores and signals", () => {
    const summary = getDashboardSummary(delhiSeedAreas);

    render(<AreaRanking areas={summary.areas} />);

    expect(
      screen.getByRole("heading", { name: "Priority areas" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Anand Vihar")).toBeInTheDocument();
    expect(screen.getByText("High AQI corridor")).toBeInTheDocument();
    expect(screen.getByText("69")).toBeInTheDocument();
  });
});
