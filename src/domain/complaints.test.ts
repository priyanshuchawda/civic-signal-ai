import { describe, expect, it } from "vitest";
import { classifyComplaint } from "./complaints";

describe("classifyComplaint", () => {
  it("routes garbage issues to sanitation with medium urgency", () => {
    const result = classifyComplaint(
      "Garbage has not been collected near the lane for three days",
    );

    expect(result.category).toBe("waste");
    expect(result.department).toBe("MCD sanitation");
    expect(result.urgency).toBe("medium");
    expect(result.reasons).toContain("matched waste keyword");
  });

  it("raises urgency for sewage near a school", () => {
    const result = classifyComplaint(
      "Open sewage and mosquitoes outside a school gate",
    );

    expect(result.category).toBe("drainage");
    expect(result.department).toBe("Drainage maintenance");
    expect(result.urgency).toBe("high");
    expect(result.reasons).toContain("sensitive place mentioned");
    expect(result.reasons).toContain("high-risk issue mentioned");
  });

  it("returns other and low urgency when no civic keyword matches", () => {
    const result = classifyComplaint("Need help understanding this local issue");

    expect(result.category).toBe("other");
    expect(result.department).toBe("Civic helpdesk");
    expect(result.urgency).toBe("low");
  });
});
