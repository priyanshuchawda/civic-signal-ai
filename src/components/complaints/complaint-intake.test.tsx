// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { delhiSeedAreas } from "../../data/delhi-seed";
import { ComplaintIntake } from "./complaint-intake";

describe("ComplaintIntake", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("rejects empty complaint text with an accessible error", () => {
    render(<ComplaintIntake areas={delhiSeedAreas} />);

    fireEvent.click(screen.getByRole("button", { name: "Classify complaint" }));

    expect(
      screen.getByText("Describe the civic issue before submitting."),
    ).toBeInTheDocument();
  });

  it("classifies and persists a sanitation complaint", () => {
    render(<ComplaintIntake areas={delhiSeedAreas} />);

    fireEvent.change(screen.getByLabelText("Area"), {
      target: { value: "lajpat-nagar" },
    });
    fireEvent.change(screen.getByLabelText("Complaint"), {
      target: {
        value:
          "Garbage has not been collected near my lane. Call me at 9876543210.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Classify complaint" }));

    expect(screen.getByText("waste")).toBeInTheDocument();
    expect(screen.getByText("MCD sanitation")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText(/Call me at \[phone\]/)).toBeInTheDocument();

    const stored = JSON.parse(
      localStorage.getItem("civic-signal:complaints") ?? "[]",
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].areaName).toBe("Lajpat Nagar");
    expect(stored[0].classification.category).toBe("waste");
  });
});
