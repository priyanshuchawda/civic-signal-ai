// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDashboardSummary } from "../../data/dashboard";
import { delhiSeedAreas } from "../../data/delhi-seed";
import { PriorityMap } from "./priority-map";

describe("PriorityMap", () => {
  it("renders score markers and updates selected area details", () => {
    const summary = getDashboardSummary(delhiSeedAreas);

    render(<PriorityMap areas={summary.areas} />);

    expect(
      screen.getByRole("heading", { name: "Priority map" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Select Anand Vihar, score 69, High risk",
      }),
    ).toBeInTheDocument();

    const detail = screen.getByRole("region", { name: "Selected map area" });
    expect(within(detail).getByText("Anand Vihar")).toBeInTheDocument();
    expect(within(detail).getByText("High AQI corridor")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Select Lajpat Nagar, score 61, High risk",
      }),
    );

    expect(within(detail).getByText("Lajpat Nagar")).toBeInTheDocument();
    expect(within(detail).getByText("Market crowding")).toBeInTheDocument();
  });
});
