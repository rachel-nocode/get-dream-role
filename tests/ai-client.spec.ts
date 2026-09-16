import { expect, test } from "@playwright/test";
import { completionTokenLimit, shouldFallbackToJsonObject } from "../convex/ai/limits";

test.describe("openai-compatible json fallback", () => {
  test("retries json_object on any schema 400, not only response_format wording", () => {
    expect(shouldFallbackToJsonObject(400, true)).toBe(true);
    expect(shouldFallbackToJsonObject(400, false)).toBe(false);
    expect(shouldFallbackToJsonObject(429, true)).toBe(false);
    expect(shouldFallbackToJsonObject(200, true)).toBe(false);
  });

  test("gives Groq reasoning models room to think before the JSON", () => {
    expect(completionTokenLimit("groq", 800)).toBe(2800);
    expect(completionTokenLimit("openai", 800)).toBe(800);
    expect(completionTokenLimit("anthropic", 800)).toBe(800);
  });
});
