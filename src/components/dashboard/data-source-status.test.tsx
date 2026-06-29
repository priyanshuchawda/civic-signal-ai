// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataSourceStatus } from "./data-source-status";

describe("DataSourceStatus", () => {
  it("renders live data state and refreshed time", () => {
    render(
      <DataSourceStatus
        state={{
          source: "live",
          refreshedAt: "2026-06-29T10:15:00.000Z",
          totalAreas: 5,
          fallbackAreaCount: 0,
        }}
      />,
    );

    expect(screen.getByText("Live data")).toBeInTheDocument();
    expect(screen.getByText(/29 Jun 2026/)).toBeInTheDocument();
    expect(screen.getByText("5 areas")).toBeInTheDocument();
  });

  it("renders fallback state without alarming language", () => {
    render(
      <DataSourceStatus
        state={{
          source: "fallback",
          refreshedAt: "2026-06-29T10:15:00.000Z",
          totalAreas: 5,
          fallbackAreaCount: 5,
        }}
      />,
    );

    expect(screen.getByText("Seed fallback")).toBeInTheDocument();
    expect(screen.getByText("Using deterministic seed data")).toBeInTheDocument();
  });
});
