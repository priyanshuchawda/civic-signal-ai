// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActionQueue } from "./action-queue";

describe("ActionQueue", () => {
  it("renders target area, rationale, and suggested next step", () => {
    render(
      <ActionQueue
        actions={[
          {
            id: "anand-vihar-aqi",
            category: "aqi",
            priority: "high",
            targetArea: "Anand Vihar",
            title: "Air quality field check",
            rationale: "AQI risk is very high",
            nextStep: "Coordinate an air quality check and exposure advisory.",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Action queue" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Anand Vihar")).toBeInTheDocument();
    expect(screen.getByText("AQI risk is very high")).toBeInTheDocument();
    expect(
      screen.getByText("Coordinate an air quality check and exposure advisory."),
    ).toBeInTheDocument();
  });
});
