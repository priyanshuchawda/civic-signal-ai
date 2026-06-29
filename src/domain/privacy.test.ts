import { describe, expect, it } from "vitest";
import { sanitizeForAi } from "./privacy";

describe("sanitizeForAi", () => {
  it("removes phone numbers and email addresses", () => {
    const result = sanitizeForAi(
      "Call me at 9876543210 or test@example.com about garbage",
    );

    expect(result).toBe("Call me at [phone] or [email] about garbage");
  });

  it("removes phone numbers with country code separators", () => {
    const result = sanitizeForAi("My number is +91-9876543210 for this issue");

    expect(result).toBe("My number is [phone] for this issue");
  });

  it("compresses extra whitespace", () => {
    const result = sanitizeForAi("Garbage    near\n\nmarket");

    expect(result).toBe("Garbage near market");
  });
});
